/**
 * Archivo: SecurityConfig.java
 * Descripción: Configuración principal de Spring Security — SecurityFilterChain, CORS y JWT.
 * ¿Para qué? Define qué endpoints son públicos y cuáles requieren autenticación JWT,
 *            y configura CORS para permitir peticiones desde el frontend React.
 * ¿Impacto? Un error aquí puede dejar la API completamente abierta (si se pone
 *            permitAll() en todo) o completamente bloqueada (si se niega todo).
 */
package com.nn.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  /**
   * ¿Qué? Define las reglas de seguridad HTTP: qué rutas son públicas, stateless
   * JWT,
   * CSRF deshabilitado (no aplica a APIs REST) y CORS configurado.
   * ¿Para qué? Spring Security, por defecto, bloquea TODAS las rutas. Necesitamos
   * abrir los endpoints de auth y Swagger sin requerir token.
   * ¿Impacto? Sin esta configuración, ninguna petición del frontend funcionaría.
   *
   * @param http Objeto de configuración HTTP de Spring Security
   * @return SecurityFilterChain configurado
   * @throws Exception Si hay error en la configuración de seguridad
   */
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // CSRF no es necesario en APIs REST stateless con JWT
        .csrf(AbstractHttpConfigurer::disable)

        // Configurar CORS usando el bean corsConfigurationSource()
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

        // Sin sesiones HTTP — el estado vive en el JWT (stateless)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        // Reglas de autorización por ruta
        .authorizeHttpRequests(auth -> auth
            // Endpoints públicos de autenticación
            .requestMatchers(HttpMethod.POST,
                "/api/v1/auth/register",
                "/api/v1/auth/login",
                "/api/v1/auth/refresh",
                "/api/v1/auth/forgot-password",
                "/api/v1/auth/reset-password",
                "/api/v1/auth/verify-email")
            .permitAll()

            // Swagger UI y OpenAPI docs (solo en desarrollo — ver OpenApiConfig)
            .requestMatchers(
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs/**")
            .permitAll()

            // Cualquier otra ruta requiere autenticación
            .anyRequest().authenticated());

    // TODO (Fase 3): agregar JwtAuthenticationFilter aquí con addFilterBefore()

    return http.build();
  }

  /**
   * ¿Qué? Configura los orígenes CORS permitidos para peticiones desde el
   * frontend.
   * ¿Para qué? Sin CORS configurado, el navegador bloquea las peticiones del
   * frontend
   * React (puerto 5173) al backend (puerto 8080) — "CORS policy error".
   * ¿Impacto? NUNCA usar allowedOrigins("*") en producción — abre la API a
   * cualquier dominio.
   *
   * @return CorsConfigurationSource con los orígenes permitidos
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    // En producción, reemplazar por el dominio real vía variable de entorno
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
