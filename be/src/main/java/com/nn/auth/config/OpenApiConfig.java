/**
 * Archivo: OpenApiConfig.java
 * Descripción: Configuración de SpringDoc OpenAPI — Swagger UI condicional según entorno.
 * ¿Para qué? Proveer documentación interactiva de la API en desarrollo sin exponerla en producción.
 * ¿Impacto? Si el Swagger UI queda habilitado en producción, cualquier persona puede
 *            explorar y probar todos los endpoints de la API — riesgo de seguridad.
 */
package com.nn.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Marca esta clase como configuración de Spring — aquí se definen beans
// que SpringDoc necesita para construir la documentación de la API.
@Configuration
public class OpenApiConfig {

  /**
   * ¿Qué? Configura la documentación OpenAPI con metadatos del proyecto y
   * el esquema de autenticación JWT Bearer.
   * ¿Para qué? Permite probar endpoints protegidos directamente desde Swagger UI
   * ingresando el access token en el botón "Authorize".
   * ¿Impacto? Sin esta configuración, los endpoints protegidos no se pueden
   * probar desde Swagger UI — devuelve 401 sin indicar cómo autenticarse.
   *
   * @return OpenAPI con metadatos y esquema de seguridad JWT
   */
  // Registra el objeto OpenAPI como bean. SpringDoc lo detecta al arrancar
  // y lo usa para construir /v3/api-docs y el Swagger UI en /swagger-ui.html.
  @Bean
  public OpenAPI openAPI() {
    final String securitySchemeName = "bearerAuth";

    return new OpenAPI()
        .info(new Info()
            .title("NN Auth System API")
            .description("API de autenticación completa: registro, login, cambio y recuperación de contraseña")
            .version("1.0.0"))
        .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
        .components(new Components()
            .addSecuritySchemes(securitySchemeName,
                new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Ingresa el access token JWT obtenido en /api/v1/auth/login")));
  }
}
