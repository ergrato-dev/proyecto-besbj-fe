/**
 * Archivo: AppProperties.java
 * Descripción: Propiedades tipadas de la aplicación leídas desde application.yml.
 * ¿Para qué? Validar en el arranque que todas las variables requeridas están definidas
 *            y proveer acceso tipado (en lugar de @Value por toda la app).
 * ¿Impacto? Si JWT_SECRET tiene menos de 32 caracteres, la app lanza un error al arrancar
 *            — este fail-fast evita tokens inseguros en producción.
 */
package com.nn.auth.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

// Activa la validación de las propiedades al arranque de la app con Jakarta Validation.
// Sin @Validated, las anotaciones @NotBlank y @Size se ignoran — un JWT_SECRET de
// 3 caracteres pasaría sin error, comprometiendo la seguridad desde el inicio.
@Validated
// Mapea el bloque 'app:' del application.yml a este record.
// Permite usar 'app.jwt.secret', 'app.frontendUrl', etc. en lugar de
// @Value("${...}") dispersos.
// Sin @ConfigurationProperties, Spring no inyecta los valores del YAML — todos
// los campos quedarían null.
@ConfigurationProperties(prefix = "app")
public record AppProperties(
    Jwt jwt,
    RateLimit rateLimit,
    @NotBlank String frontendUrl,
    @NotBlank String environment) {
  /**
   * ¿Qué? Propiedades anidadas de JWT.
   * ¿Para qué? Agrupar las configuraciones relacionadas con JWT bajo un mismo
   * objeto.
   * ¿Impacto? El secret con menos de 32 caracteres hace que HMAC-SHA256 sea
   * inseguro.
   */
  public record Jwt(
      @NotBlank @Size(min = 32, message = "JWT_SECRET debe tener al menos 32 caracteres") String secret,

      @Positive int accessTokenExpirationMinutes,

      @Positive int refreshTokenExpirationDays) {
  }

  /**
   * ¿Qué? Propiedades anidadas de rate limiting (Bucket4j) para /api/v1/auth/**.
   * ¿Para qué? Configurar cuántas peticiones por IP se permiten en la ventana,
   * sin tocar código — igual que capacity/refill en los repos FastAPI (slowapi)
   * y Express (express-rate-limit).
   * ¿Impacto? enabled=false en el perfil de test evita 429 durante las
   * suites de MockMvc, que disparan muchas más peticiones que el límite real.
   */
  public record RateLimit(
      boolean enabled,

      @Positive int capacity,

      @Positive int refillMinutes) {
  }
}
