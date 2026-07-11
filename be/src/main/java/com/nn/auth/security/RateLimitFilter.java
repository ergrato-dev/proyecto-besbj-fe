/**
 * Archivo: RateLimitFilter.java
 * Descripción: Filtro HTTP que limita cuántas peticiones por IP se aceptan en
 *              /api/v1/auth/** usando Bucket4j (token bucket en memoria).
 * ¿Para qué? Sin límite, un atacante puede probar miles de contraseñas por segundo
 *            contra /login o saturar /register — mismo riesgo que slowapi (FastAPI)
 *            y express-rate-limit (Express) mitigan en los repos hermanos.
 * ¿Impacto? Cada IP tiene su propio bucket de app.rate-limit.capacity tokens que
 *           se recargan cada app.rate-limit.refill-minutes. Al agotarse, la API
 *           responde 429 en vez de dejar pasar la petición al controller.
 */
package com.nn.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nn.auth.config.AppProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ¿Qué? Filtro que aplica un bucket de tokens por IP, solo a rutas bajo
 * /api/v1/auth/.
 * ¿Para qué? Aislar el rate limiting de auth del resto de la API — no
 * penalizar /api/v1/users/** con el mismo límite pensado para login/registro.
 * ¿Impacto? Los buckets viven en memoria del proceso — se pierden al reiniciar
 * y no se comparten entre instancias. Suficiente para este proyecto educativo
 * de una sola instancia; una app multi-instancia necesitaría un backend
 * distribuido (Redis) para Bucket4j.
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

  private static final String AUTH_PATH_PREFIX = "/api/v1/auth/";

  private final AppProperties appProperties;
  private final ObjectMapper objectMapper;

  /** Un bucket por IP — se crea perezosamente en el primer request de esa IP. */
  private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    AppProperties.RateLimit config = appProperties.rateLimit();

    // Solo aplica a /api/v1/auth/** — el resto de la API no pasa por aquí.
    if (!config.enabled() || !request.getRequestURI().startsWith(AUTH_PATH_PREFIX)) {
      filterChain.doFilter(request, response);
      return;
    }

    String clientIp = request.getRemoteAddr();
    Bucket bucket = buckets.computeIfAbsent(clientIp, ip -> newBucket(config));

    if (bucket.tryConsume(1)) {
      filterChain.doFilter(request, response);
      return;
    }

    // Sin tokens disponibles — 429 antes de llegar al controller.
    // setCharacterEncoding ANTES de getWriter(): Tomcat usa ISO-8859-1 por
    // defecto y rompe las tildes ("Límite" -> "L�mite") si no se fija UTF-8.
    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    response.setCharacterEncoding("UTF-8");
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setHeader("Retry-After", String.valueOf(Duration.ofMinutes(config.refillMinutes()).toSeconds()));

    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.TOO_MANY_REQUESTS);
    detail.setTitle("Demasiadas peticiones");
    detail.setDetail("Límite de peticiones excedido. Intenta de nuevo en " + config.refillMinutes() + " minutos.");
    detail.setProperty("timestamp", Instant.now());
    response.getWriter().write(objectMapper.writeValueAsString(detail));
  }

  /**
   * ¿Qué? Crea un bucket con capacidad fija que se recarga completa cada
   * ventana (Refill.intervally) — equivalente al fixed-window de
   * express-rate-limit, no un goteo continuo.
   * ¿Para qué? Que "10 peticiones / 15 min" sea intuitivo de explicar y
   * verificar en la bitácora, en vez de un refill gradual token a token.
   */
  private Bucket newBucket(AppProperties.RateLimit config) {
    Bandwidth limit = Bandwidth.classic(
        config.capacity(),
        Refill.intervally(config.capacity(), Duration.ofMinutes(config.refillMinutes())));
    return Bucket.builder().addLimit(limit).build();
  }
}
