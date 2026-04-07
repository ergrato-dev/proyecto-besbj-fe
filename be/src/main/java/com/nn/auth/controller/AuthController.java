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
 * ¿Impacto? @RequiredArgsConstructor inyecta AuthService vía constructor —
 * patrón preferido sobre @Autowired (testeable y explícito).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
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
  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta. Envía un email de verificación al correo proporcionado.")
  public UserResponse register(@Valid @RequestBody RegisterRequest request) {
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
  @PostMapping("/login")
  @Operation(summary = "Iniciar sesión", description = "Autentica con email y contraseña. Retorna access token (15 min) y refresh token (7 días).")
  public TokenResponse login(@Valid @RequestBody LoginRequest request) {
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
  @PostMapping("/refresh")
  @Operation(summary = "Renovar access token", description = "Usa el refresh token para obtener un nuevo access token sin volver a iniciar sesión.")
  public TokenResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
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
  @PostMapping("/change-password")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Cambiar contraseña", description = "Requiere autenticación. Cambia la contraseña verificando la contraseña actual.")
  public MessageResponse changePassword(
      @AuthenticationPrincipal User user,
      @Valid @RequestBody ChangePasswordRequest request) {
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
  @PostMapping("/forgot-password")
  @Operation(summary = "Solicitar recuperación de contraseña", description = "Envía un email con enlace de recuperación si el email está registrado. "
      +
      "La respuesta es siempre la misma por seguridad.")
  public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    return authService.forgotPassword(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/reset-password
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Restablece la contraseña usando el token recibido por email.
   * ¿Para qué? Completar el flujo de recuperación.
   *
   * @param request DTO con el token de recuperación y la nueva contraseña
   * @return MessageResponse confirmando el restablecimiento
   */
  @PostMapping("/reset-password")
  @Operation(summary = "Restablecer contraseña con token", description = "Valida el token de recuperación (1 hora, un solo uso) y actualiza la contraseña.")
  public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    return authService.resetPassword(request);
  }

  // -------------------------------------------------------------------------
  // POST /api/v1/auth/verify-email
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Verifica el email con el token recibido al registrarse.
   * ¿Para qué? Activar la cuenta del usuario y permitirle hacer login.
   *
   * @param request DTO con el token de verificación de email
   * @return MessageResponse confirmando la activación
   */
  @PostMapping("/verify-email")
  @Operation(summary = "Verificar dirección de email", description = "Valida el token de verificación (24 horas) y activa la cuenta del usuario.")
  public MessageResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
    return authService.verifyEmail(request);
  }
}
