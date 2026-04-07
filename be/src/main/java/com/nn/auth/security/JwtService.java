/**
 * Archivo: JwtService.java
 * Descripción: Servicio que encapsula toda la lógica de creación y validación de tokens JWT.
 * ¿Para qué? Centralizar el manejo de JWT para que AuthService y JwtAuthenticationFilter
 *            usen la misma lógica sin duplicar código — punto único de verdad sobre los tokens.
 * ¿Impacto? Un error aquí compromete toda la seguridad del sistema. Si generateAccessToken()
 *            o isTokenValid() fallan, los usuarios no pueden autenticarse ni el filtro
 *            puede verificar peticiones — toda la API quedaría inaccesible o abierta.
 */
package com.nn.auth.security;

import com.nn.auth.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * ¿Qué? Servicio Spring (@Service) que provee operaciones sobre JWT.
 * ¿Para qué? Ser inyectado en JwtAuthenticationFilter (verificar tokens
 * entrantes)
 * y en AuthService (generar tokens al hacer login).
 * ¿Impacto? Al ser un @Service singleton, la clave secreta se lee una sola vez
 * de AppProperties — seguro y eficiente.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

  private static final Logger log = LoggerFactory.getLogger(JwtService.class);

  /**
   * ¿Qué? Tipo de token — distingue access tokens de refresh tokens.
   * ¿Para qué? Evitar que un refresh token sea usado como access token
   * (OWASP: tokens deben tener propósito específico).
   * ¿Impacto? Sin esta distinción, ambos tokens serían intercambiables —
   * un refresh token robado daría acceso a recursos protegidos.
   */
  private static final String CLAIM_TOKEN_TYPE = "typ";
  private static final String ACCESS_TOKEN_TYPE = "access";
  private static final String REFRESH_TOKEN_TYPE = "refresh";

  private final AppProperties appProperties;

  // -------------------------------------------------------------------------
  // Generación de tokens
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Genera un access token JWT con duración de 15 minutos (configurable).
   * ¿Para qué? El access token es la credencial que el cliente envía en cada
   * petición autenticada en el header: Authorization: Bearer <token>.
   * ¿Impacto? Duración corta (15 min) limita la ventana de exposición si el
   * token es interceptado — principio de mínimo privilegio temporal.
   *
   * @param userDetails Usuario para quien se genera el token
   * @return JWT firmado con HS256 como String
   */
  public String generateAccessToken(UserDetails userDetails) {
    long expirationMs = (long) appProperties.jwt().accessTokenExpirationMinutes() * 60 * 1000;
    return buildToken(userDetails.getUsername(), Map.of(CLAIM_TOKEN_TYPE, ACCESS_TOKEN_TYPE), expirationMs);
  }

  /**
   * ¿Qué? Genera un refresh token JWT con duración de 7 días (configurable).
   * ¿Para qué? Permite renovar el access token sin que el usuario tenga que
   * iniciar sesión de nuevo cuando el access token de 15 min expira.
   * ¿Impacto? Duración larga (7 días) es intencional — pero el refresh token
   * solo sirve para obtener nuevos access tokens, NO para acceder
   * a recursos protegidos directamente.
   *
   * @param userDetails Usuario para quien se genera el refresh token
   * @return JWT firmado con HS256 como String
   */
  public String generateRefreshToken(UserDetails userDetails) {
    long expirationMs = (long) appProperties.jwt().refreshTokenExpirationDays() * 24 * 60 * 60 * 1000;
    return buildToken(userDetails.getUsername(), Map.of(CLAIM_TOKEN_TYPE, REFRESH_TOKEN_TYPE), expirationMs);
  }

  /**
   * ¿Qué? Método interno que construye el JWT con JJWT 0.12.x.
   * ¿Para qué? Evitar duplicar la lógica de construcción entre
   * generateAccessToken
   * y generateRefreshToken.
   * ¿Impacto? Cambios en este método afectan TODOS los tokens generados.
   * La firma "HS256 + secret de 32+ chars" es el único mecanismo
   * que garantiza que los tokens no pueden ser falsificados.
   *
   * @param subject      Email del usuario (subject del JWT)
   * @param extraClaims  Claims adicionales a incluir en el payload
   * @param expirationMs Duración del token en milisegundos
   * @return JWT firmado como String
   */
  private String buildToken(String subject, Map<String, Object> extraClaims, long expirationMs) {
    Instant now = Instant.now();
    return Jwts.builder()
        .claims(extraClaims)
        .subject(subject)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(expirationMs)))
        .id(UUID.randomUUID().toString()) // jti — ID único por token, útil para revocación futura
        .signWith(getSigningKey())
        .compact();
  }

  // -------------------------------------------------------------------------
  // Validación de tokens
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Verifica que el token es válido: firmado correctamente, no expirado,
   * y que el subject coincide con el usuario dado.
   * ¿Para qué? JwtAuthenticationFilter llama a este método antes de setear
   * el usuario en el SecurityContext.
   * ¿Impacto? Si devuelve true incorrectamente, un token inválido o de otro
   * usuario podría autenticarse — vulnerabilidad crítica.
   *
   * @param token       JWT a validar
   * @param userDetails Usuario contra quien validar el subject del token
   * @return true si el token es válido para ese usuario
   */
  public boolean isTokenValid(String token, UserDetails userDetails) {
    try {
      final String email = extractEmail(token);
      return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    } catch (JwtException | IllegalArgumentException e) {
      log.warn("Token inválido: {}", e.getMessage());
      return false;
    }
  }

  /**
   * ¿Qué? Verifica que el token es un access token (not refresh).
   * ¿Para qué? Evitar que el endpoint /refresh acepte un access token
   * como si fuera un refresh token, y viceversa.
   * ¿Impacto? Separa los privilegios de cada tipo de token — OWASP A07.
   *
   * @param token JWT a verificar
   * @return true si el claim "typ" es "access"
   */
  public boolean isAccessToken(String token) {
    try {
      String type = extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
      return ACCESS_TOKEN_TYPE.equals(type);
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  /**
   * ¿Qué? Verifica que el token es un refresh token.
   * ¿Para qué? El endpoint POST /auth/refresh solo debe aceptar refresh tokens.
   *
   * @param token JWT a verificar
   * @return true si el claim "typ" es "refresh"
   */
  public boolean isRefreshToken(String token) {
    try {
      String type = extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
      return REFRESH_TOKEN_TYPE.equals(type);
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Extracción de claims
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Extrae el email (subject) del token JWT.
   * ¿Para qué? El JwtAuthenticationFilter usa el email para buscar al usuario
   * en la BD vía UserDetailsService.
   *
   * @param token JWT del que extraer el subject
   * @return Email del usuario (subject del JWT)
   * @throws JwtException Si el token es inválido o está expirado
   */
  public String extractEmail(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  /**
   * ¿Qué? Método genérico para extraer cualquier claim del token JWT.
   * ¿Para qué? Reutilizar el parseo del token para diferentes necesidades
   * sin duplicar el bloque try-catch de JJWT.
   *
   * @param token          JWT a parsear
   * @param claimsResolver Función que extrae el claim deseado del objeto Claims
   * @param <T>            Tipo del claim a extraer
   * @return Valor del claim solicitado
   */
  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  /**
   * ¿Qué? Parsea el JWT y retorna todos los claims del payload.
   * ¿Para qué? Es el punto central de parseo — verifica la firma automáticamente.
   * ¿Impacto? JJWT lanza excepción si la firma no coincide o el token expiró —
   * esto previene tokens falsificados o manipulados.
   *
   * @param token JWT a parsear
   * @return Claims del payload verificado
   * @throws ExpiredJwtException Si el token expiró
   * @throws JwtException        Si la firma es inválida o el token está
   *                             malformado
   */
  private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  /**
   * ¿Qué? Comprueba si el token ya expiró comparando la fecha de expiración
   * con el momento actual.
   * ¿Para qué? Rechazar tokens expirados antes de autenticar la petición.
   *
   * @param token JWT a comprobar
   * @return true si el token ya expiró
   */
  private boolean isTokenExpired(String token) {
    return extractClaim(token, Claims::getExpiration).before(new Date());
  }

  /**
   * ¿Qué? Construye la clave criptográfica HMAC-SHA256 a partir del secret.
   * ¿Para qué? JJWT 0.12.x requiere un SecretKey de tipo javax.crypto.SecretKey
   * en lugar de strings raw — más seguro y tipado.
   * ¿Impacto? La misma clave debe usarse para firmar y verificar. Si la clave
   * cambia entre reinicios (ej: si se generar aleatoriamente aquí),
   * todos los tokens anteriores quedarían inválidos — por eso se lee
   * de variable de entorno (JWT_SECRET) que persiste entre reinicios.
   *
   * @return SecretKey para firmar/verificar con HS256
   */
  private SecretKey getSigningKey() {
    byte[] keyBytes = appProperties.jwt().secret().getBytes(StandardCharsets.UTF_8);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
