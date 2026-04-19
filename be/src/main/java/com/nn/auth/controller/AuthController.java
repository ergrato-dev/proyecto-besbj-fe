/**
 * Archivo: AuthController.java
 * Descripción: Controller REST que expone los 7 endpoints de autenticación bajo /api/v1/auth/.
 * ¿Para qué? Actuar como capa HTTP — recibir peticiones, delegar a AuthService y
 *            retornar respuestas con los códigos HTTP correctos.
 * ¿Impacto? El controller NO contiene lógica de negocio. Si se pone lógica aquí,
 *           viola la separación de responsabilidades y hace el código inprobable.
 *           Un error en los códigos HTTP (ej: 200 en vez de 201 para registro)
 *           confunde al frontend y a las herramientas de testing.
 */
package com.nn.auth.controller;

import com.nn.auth.dto.request.ChangePasswordRequest;
import com.nn.auth.dto.request.ForgotPasswordRequest;
import com.nn.auth.dto.request.LoginRequest;
import com.nn.auth.dto.request.RefreshTokenRequest;
import com.nn.auth.dto.request.RegisterRequest;
import com.nn.auth.dto.request.ResetPasswordRequest;
import com.nn.auth.dto.request.VerifyEmailRequest;
import com.nn.auth.dto.response.MessageResponse;
import com.nn.auth.dto.response.TokenResponse;
import com.nn.auth.dto.response.UserResponse;
import com.nn.auth.entity.User;
import com.nn.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * ¿Qué? Controller REST con los endpoints de autenticación.
 * ¿Para qué? Exponer la API de auth bajo el prefijo /api/v1/auth/ con los
 * verbos HTTP y códigos de estado correctos.
 */
// Combina @Controller + @ResponseBody: marca esta clase como controller HTTP
// y hace que cada método retorne su valor directamente como JSON en el cuerpo
// de la respuesta, sin buscar una vista o template.
@RestController

// Prefijo de URL compartido por todos los métodos de esta clase.
// Evita repetir "/api/v1/auth" en cada @PostMapping — principio DRY.
@RequestMapping("/api/v1/auth")

// Lombok genera el constructor con todos los campos `final` de la clase.
// Equivale a escribir: public AuthController(AuthService authService) {
// this.authService = authService; }
// Patrón preferido sobre @Autowired — hace las dependencias explícitas y
// probables.
@RequiredArgsConstructor

// Swagger: agrupa todos los endpoints de esta clase bajo la sección
// "Autenticación"
// en la interfaz de Swagger UI (http://localhost:8080/swagger-ui.html).
@Tag(name = "Autenticación", description = "Endpoints para registro, login, tokens y gestión de contraseña")
public class AuthController {

  private final AuthService authService;

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/register
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Registra un nuevo usuario y envía email de verificación.
   * ¿Para qué? Crear la cuenta del usuario en el sistema.
   * ¿Impacto? @ResponseStatus(CREATED) devuelve 201 — correcto semánticamente
   * ya que se crea un nuevo recurso (User). 200 sería incorrecto aquí.
   *
   * @param request DTO validado con email, fullName y password
   * @return UserResponse con los datos públicos del nuevo usuario
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/register a este método.
  @PostMapping("/register")
  // Establece el código de respuesta exitosa como 201 Created.
  // 201 indica que se creó un recurso nuevo — semánticamente correcto para
  // registro.
  // Si se usara 200 OK sería incorrecto pues 200 implica "acción realizada", no
  // "recurso creado".
  @ResponseStatus(HttpStatus.CREATED)
  // Swagger: añade descripción legible a este endpoint en /swagger-ui.html.
  @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta. Envía un email de verificación al correo proporcionado.")
  public UserResponse register(
      @Valid // Activa Bean Validation sobre el DTO — verifica email, fullName y password.
      @RequestBody // Spring deserializa el JSON del cuerpo de la petición a RegisterRequest.
      RegisterRequest request) {
    // ¿Qué? Delega al servicio — el controller no toma decisiones de negocio.
    return authService.register(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/login
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Autentica al usuario y devuelve access + refresh tokens.
   * ¿Para qué? Iniciar sesión — tras este endpoint el cliente tiene los tokens
   * para hacer peticiones autenticadas.
   *
   * @param request DTO con email y password
   * @return TokenResponse con access token (15 min) y refresh token (7 días)
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/login a este método.
  @PostMapping("/login")
  // Swagger: documenta que este endpoint no requiere autenticación previa.
  @Operation(summary = "Iniciar sesión", description = "Autentica con email y contraseña. Retorna access token (15 min) y refresh token (7 días).")
  public TokenResponse login(
      @Valid // Verifica que email y password cumplan las restricciones del DTO.
      @RequestBody // Mapea el JSON de la petición al objeto LoginRequest.
      LoginRequest request) {
    return authService.login(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/refresh
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Emite un nuevo access token usando un refresh token válido.
   * ¿Para qué? Renovar el acceso sin requerir al usuario que ingrese sus
   * credenciales cada 15 minutos.
   *
   * @param request DTO con el refresh token
   * @return TokenResponse con nuevo access token (mismo refresh token)
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/refresh a este método.
  @PostMapping("/refresh")
  // Documenta el endpoint de renovación de tokens en Swagger UI.
  @Operation(summary = "Renovar access token", description = "Usa el refresh token para obtener un nuevo access token sin volver a iniciar sesión.")
  public TokenResponse refreshToken(
      @Valid // Verifica que el campo refreshToken no esté en blanco.
      @RequestBody // Mapea el JSON de la petición al objeto RefreshTokenRequest.
      RefreshTokenRequest request) {
    return authService.refreshToken(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/change-password (requiere autenticación)
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Cambia la contraseña del usuario autenticado, verificando la actual.
   * ¿Para qué? Permitir al usuario cambiar su contraseña conociendo la actual.
   * ¿Impacto? @AuthenticationPrincipal inyecta el User cargado por
   * JwtAuthenticationFilter — es el usuario del token, no uno elegido.
   * Esto previene que un usuario cambie la contraseña de otro (IDOR).
   *
   * @param user    Usuario autenticado inyectado por Spring Security
   * @param request DTO con contraseña actual y nueva
   * @return MessageResponse confirmando el cambio
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/change-password a este método.
  @PostMapping("/change-password")
  // Swagger: muestra el candado en la UI y exige que se ingrese el Bearer token
  // antes de probar este endpoint. Sin esto, Swagger no envía el header
  // Authorization.
  @SecurityRequirement(name = "bearerAuth")
  // Documenta que este endpoint requiere autenticación.
  @Operation(summary = "Cambiar contraseña", description = "Requiere autenticación. Cambia la contraseña verificando la contraseña actual.")
  public MessageResponse changePassword(
      @AuthenticationPrincipal // Inyecta el User del SecurityContext — el usuario que tiene el token activo.
      User user, // Es imposible que sea el usuario equivocado: lo pone JwtAuthenticationFilter.
      @Valid // Verifica que currentPassword y newPassword cumplan las restricciones.
      @RequestBody // Mapea el JSON de la petición a ChangePasswordRequest.
      ChangePasswordRequest request) {
    return authService.changePassword(user, request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/forgot-password
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Envía email de recuperación si el email está registrado.
   * ¿Para qué? Iniciar el flujo de recuperación de contraseña.
   * ¿Impacto? La respuesta es siempre idéntica — no revela si el email existe.
   *
   * @param request DTO con el email
   * @return MessageResponse genérico (idéntico independientemente del resultado)
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/forgot-password a este método.
  @PostMapping("/forgot-password")
  // Documenta el endpoint. La descripción explica por qué la respuesta es siempre
  // igual.
  @Operation(summary = "Solicitar recuperación de contraseña", description = "Envía un email con enlace de recuperación si el email está registrado. "
      +
      "La respuesta es siempre la misma por seguridad.")
  public MessageResponse forgotPassword(
      @Valid // Verifica que el email tenga formato válido antes de procesarlo.
      @RequestBody // Mapea el JSON de la petición a ForgotPasswordRequest.
      ForgotPasswordRequest request) {
    return authService.forgotPassword(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/reset-password
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Restablece la contraseña usando el token recibido por email.
   * ¿Para qué? Completar el flujo de recuperación de contraseña que inició
   * en /forgot-password.
   * ¿Impacto? El token se valida como no expirado (1 hora) y no usado (single-use).
   * Si se aceptaran tokens ya usados, un atacante que intercepte el email
   * podría resetear la contraseña después de que el usuario lo hizo — OWASP A04.
   *
   * @param request DTO con el token de recuperación y la nueva contraseña
   * @return MessageResponse confirmando el restablecimiento
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/reset-password a este método.
  @PostMapping("/reset-password")
  // Documenta el flujo de reset: el token que llega fue enviado por email en
  // /forgot-password.
  @Operation(summary = "Restablecer contraseña con token", description = "Valida el token de recuperación (1 hora, un solo uso) y actualiza la contraseña.")
  public MessageResponse resetPassword(
      @Valid // Verifica que el token y newPassword cumplan las restricciones del DTO.
      @RequestBody // Mapea el JSON de la petición a ResetPasswordRequest.
      ResetPasswordRequest request) {
    return authService.resetPassword(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/verify-email
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Verifica el email con el token recibido al registrarse.
   * ¿Para qué? Activar la cuenta del usuario y permitirle hacer login.
   * ¿Impacto? Sin verificar el email, la cuenta queda con isEnabled()=false
   * y el login devuelve 401. Verificar confirma que el usuario controla
   * realmente ese email — barrera contra registros con emails ajenos.
   *
   * @param request DTO con el token de verificación de email
   * @return MessageResponse confirmando la activación
   */
  // Mapea peticiones HTTP POST en /api/v1/auth/verify-email a este método.
  @PostMapping("/verify-email")
  // Documenta que el token fue enviado por email al registrarse y expira en 24h.
  @Operation(summary = "Verificar dirección de email", description = "Valida el token de verificación (24 horas) y activa la cuenta del usuario.")
  public MessageResponse verifyEmail(
      @Valid // Verifica que el campo token no esté en blanco.
      @RequestBody // Mapea el JSON de la petición a VerifyEmailRequest.
      VerifyEmailRequest request) {
    return authService.verifyEmail(request);
  }
}
