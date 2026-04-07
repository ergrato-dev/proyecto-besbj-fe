/**
 * Archivo: JwtAuthenticationFilter.java
 * Descripción: Filtro HTTP que intercepta cada petición, extrae el JWT del header
 *              Authorization y establece el usuario en el SecurityContext de Spring.
 * ¿Para qué? En un sistema stateless, no hay sesión HTTP. Este filtro reemplaza
 *            el mecanismo de sesión tradicional — cada petición autenticada debe
 *            llevar su propio token que este filtro valida.
 * ¿Impacto? Sin este filtro, todas las rutas protegidas devolverían 401 aunque
 *            el cliente envíe un token válido — el sistema sería inutilizable.
 *            Un error de lógica aquí puede permitir acceso no autorizado o
 *            bloquear acceso legítimo.
 */
package com.nn.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ¿Qué? Filtro que extiende OncePerRequestFilter — garantiza ejecución
 * exactamente una vez por petición HTTP (importante en cadenas de filtros).
 * ¿Para qué? Extraer y validar el JWT de cada petición que llega al servidor,
 * antes de que los controllers la procesen.
 * ¿Impacto? Se ejecuta en TODAS las peticiones — debe ser eficiente y nunca
 * lanzar excepciones sin capturar (romperían la cadena de filtros).
 */
// Registra este filtro como un bean genérico de Spring.
// @Component (no @Service ni @Repository) porque es un componente de
// infraestructura,
// no contiene lógica de negocio ni acceso a datos.
@Component

// Lombok: genera el constructor con JwtService y UserDetailsService como
// parámetros.
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  /** Prefijo estándar del header Authorization para tokens Bearer. */
  private static final String BEARER_PREFIX = "Bearer ";
  private static final String AUTHORIZATION_HEADER = "Authorization";

  private final JwtService jwtService;
  private final UserDetailsService userDetailsService;

  /**
   * ¿Qué? Lógica principal del filtro: extrae el token, lo valida y setea la
   * autenticación en el SecurityContext de Spring.
   * ¿Para qué? Permite que @PreAuthorize, .authenticated() y
   * SecurityContextHolder
   * funcionen correctamente en los controllers de destino.
   * ¿Impacto? Si no se setea la autenticación aquí, Spring Security rechaza la
   * petición con 403 aunque el token sea válido.
   *
   * @param request     Petición HTTP entrante — puede tener el header
   *                    Authorization
   * @param response    Respuesta HTTP — no se modifica aquí (salvo errores)
   * @param filterChain Cadena de filtros — se llama a continue() si el token es
   *                    OK
   * @throws ServletException Si hay error en el procesamiento del filtro
   * @throws IOException      Si hay error de IO en el filtro
   */
  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    // Paso 1: Extraer el header Authorization
    final String authHeader = request.getHeader(AUTHORIZATION_HEADER);

    // Paso 2: Si no hay header Bearer, dejar pasar sin autenticar
    // (Spring Security manejará si la ruta requiere auth o no)
    if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
      filterChain.doFilter(request, response);
      return;
    }

    // Paso 3: Extraer el token quitando el prefijo "Bearer "
    final String jwt = authHeader.substring(BEARER_PREFIX.length());

    // Paso 4: Solo procesar access tokens — los refresh tokens no deben usarse aquí
    if (!jwtService.isAccessToken(jwt)) {
      log.warn("Se intentó usar un refresh token como access token en: {}", request.getRequestURI());
      filterChain.doFilter(request, response);
      return;
    }

    // Paso 5: Extraer el email del token
    final String email;
    try {
      email = jwtService.extractEmail(jwt);
    } catch (Exception e) {
      // Token malformado o expirado — dejar pasar sin autenticar
      log.debug("No se pudo extraer el email del token: {}", e.getMessage());
      filterChain.doFilter(request, response);
      return;
    }

    // Paso 6: Si tenemos email y aún no hay autenticación en el contexto
    // (evitar re-autenticar si ya fue procesada por otro filtro)
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

      // Paso 7: Cargar el usuario completo desde la BD
      UserDetails userDetails;
      try {
        userDetails = userDetailsService.loadUserByUsername(email);
      } catch (Exception e) {
        log.warn("Usuario no encontrado para el token con email: {}", email);
        filterChain.doFilter(request, response);
        return;
      }

      // Paso 8: Validar token contra el usuario cargado (firma + expiración + email)
      if (jwtService.isTokenValid(jwt, userDetails)) {

        // Paso 9: Crear el objeto de autenticación y setearlo en el SecurityContext
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails,
            null, // credentials = null en autenticación stateless
            userDetails.getAuthorities() // roles: [ROLE_USER]
        );

        // Paso 10: Agrega los detalles de la petición (IP, session ID, etc.) para
        // auditoría
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        // Paso 11: Registrar la autenticación en el contexto de seguridad actual
        SecurityContextHolder.getContext().setAuthentication(authToken);

        log.debug("Usuario autenticado vía JWT: {}", email);
      } else {
        log.warn("Token JWT inválido para el usuario: {}", email);
      }
    }

    // Paso 12: Continuar con el siguiente filtro en la cadena (sin importar el
    // resultado)
    filterChain.doFilter(request, response);
  }
}
