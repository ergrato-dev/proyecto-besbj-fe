/**
 * Archivo: SecurityConfig.java
 * Descripción: Configuración principal de Spring Security — SecurityFilterChain, CORS y JWT.
 * ¿Para qué? Define qué endpoints son públicos y cuáles requieren autenticación JWT,
 *            y configura CORS para permitir peticiones desde el frontend React.
 * ¿Impacto? Un error aquí puede dejar la API completamente abierta (si se pone
 *            permitAll() en todo) o completamente bloqueada (si se niega todo).
 */
package com.nn.auth.config;

import com.nn.auth.repository.UserRepository;
import com.nn.auth.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// Marca esta clase como fuente de beans de configuración para el contexto de Spring.
@Configuration

// Activa la personalización de Spring Security en esta clase.
// Sin @EnableWebSecurity, Spring Boot usaría su configuración de seguridad
// por defecto (formulario de login, todas las rutas protegidas) — no sirve para
// una API REST.
@EnableWebSecurity
public class SecurityConfig {

  /**
   * ¿Qué? Provee el mecanismo para cargar un usuario por su email (username).
   * ¿Para qué? Spring Security necesita este bean para saber cómo obtener los
   * datos del usuario cuando valida credenciales. Sin él, genera
   * un usuario "user" con contraseña aleatoria en consola — no sirve.
   * ¿Impacto? El JwtAuthenticationFilter (Fase 3) llamará a este bean para
   * cargar el User del SecurityContext a partir del email en el token.
   *
   * @param userRepository Repositorio que consulta la tabla users en PostgreSQL
   * @return UserDetailsService configurado a buscar usuarios por email
   */
  // Registra el UserDetailsService como bean para que Spring Security lo detecte.
  // Spring Security lo usa internamente para cargar usuarios al validar tokens
  // JWT.
  @Bean
  public UserDetailsService userDetailsService(UserRepository userRepository) {
    return email -> userRepository
        .findByEmailIgnoreCase(email)
        .orElseThrow(() -> new UsernameNotFoundException(
            "Usuario no encontrado con email: " + email));
  }

  /**
   * ¿Qué? Define las reglas de seguridad HTTP: qué rutas son públicas, stateless
   * JWT,
   * CSRF deshabilitado (no aplica a APIs REST) y CORS configurado.
   * ¿Para qué? Spring Security, por defecto, bloquea TODAS las rutas. Necesitamos
   * abrir los endpoints de auth y Swagger sin requerir token.
   * ¿Impacto? Sin esta configuración, ninguna petición del frontend funcionaría.
   *
   * @param http      Objeto de configuración HTTP de Spring Security
   * @param jwtFilter Filtro que intercepta y valida tokens JWT en cada petición
   * @return SecurityFilterChain configurado
   * @throws Exception Si hay error en la configuración de seguridad
   */
  // Registra la cadena de filtros de seguridad como bean principal.
  // Spring Security la aplica a cada petición HTTP entrante, en orden.
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http,
      JwtAuthenticationFilter jwtFilter) throws Exception {
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
            .anyRequest().authenticated())

        // Manejo correcto de errores de autenticación y autorización (OWASP A07)
        // Sin esto, Spring Security devuelve 403 para peticiones sin token
        // (incorrecto).
        // HTTP spec: 401 = no autenticado, 403 = autenticado pero sin permiso.
        .exceptionHandling(handling -> handling
            .authenticationEntryPoint(
                (request, response, ex) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No autenticado"))
            .accessDeniedHandler(
                (request, response, ex) -> response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acceso denegado")))

        // Insertar el filtro JWT ANTES del filtro de autenticación estándar de Spring
        // para que el SecurityContext esté poblado cuando los controllers se ejecuten
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

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
  // Registra la configuración CORS como bean — Spring Security lo detecta
  // automáticamente por el nombre del bean (corsConfigurationSource).
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
