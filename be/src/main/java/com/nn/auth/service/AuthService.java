/**
 * Archivo: AuthService.java
 * Descripción: Servicio central que contiene toda la lógica de negocio de autenticación.
 * ¿Para qué? Separar la lógica HTTP (AuthController) de la lógica de negocio —
 *            principio de Single Responsibility. Los controllers coordinan,
 *            los servicios deciden.
 * ¿Impacto? Este es el archivo más crítico del sistema. Un error aquí puede
 *           permitir accesos no autorizados, filtrar datos sensibles o romper
 *           el flujo de registro/login para todos los usuarios.
 */
package com.nn.auth.service;

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
import com.nn.auth.entity.EmailVerificationToken;
import com.nn.auth.entity.PasswordResetToken;
import com.nn.auth.entity.User;
import com.nn.auth.repository.EmailVerificationTokenRepository;
import com.nn.auth.repository.PasswordResetTokenRepository;
import com.nn.auth.repository.UserRepository;
import com.nn.auth.security.JwtService;
import com.nn.auth.util.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * ¿Qué? Servicio Spring con toda la lógica de los 7 flujos de autenticación.
 * ¿Para qué? Centralizar las reglas de negocio en un solo lugar probable y
 * mantenible — los controllers son solo fachadas HTTP.
 */
// Registra esta clase como bean de la capa de servicio.
// @Service comunica la intención: aquí vive la lógica de negocio, no HTTP ni
// BD.
@Service

// Lombok: genera el constructor con todos los campos `final` — inyección por
// constructor.
// Cada dependencia (repositorios, encoder, jwtService, emailService) se inyecta
// sin necesidad de escribir el constructor manualmente.
@RequiredArgsConstructor
public class AuthService {

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);

  private final UserRepository userRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final EmailService emailService;
  private final UserDetailsService userDetailsService;

  // -------------------------------------------------------------------------
  // 1. Registro
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Registra un nuevo usuario: valida unicidad, hashea contraseña,
   * crea el usuario, genera token de verificación y envía el email.
   * ¿Para qué? Es el primer paso del flujo de onboarding — sin este método
   * no hay usuarios en el sistema.
   * ¿Impacto? @Transactional garantiza atomicidad: si la inserción del token
   * falla, el usuario tampoco se crea — no quedan usuarios sin token.
   *
   * @param request DTO validado con email, firstName, lastName y password (texto
   *                plano)
   * @return UserResponse con los datos públicos del nuevo usuario
   * @throws IllegalArgumentException Si el email ya está registrado
   */
  // Envuelve todo el método en una transacción de BD.
  // Si cualquier operación falla (ej: save del token lanza excepción), se hace
  // rollback automático: ni el usuario ni el token quedan a medias en la BD.
  @Transactional
  public UserResponse register(RegisterRequest request) {

    // Paso 1: Verificar que el email no esté ya en uso
    // Usamos existsByEmailIgnoreCase para ser case-insensitive (OWASP A01)
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      // Mensaje genérico para no confirmar si el email existe (OWASP A01)
      throw new IllegalArgumentException("No se pudo completar el registro. Intenta con otro email.");
    }

    // Paso 2: Crear y persistir el usuario con contraseña hasheada
    User user = User.builder()
        .email(request.email().toLowerCase().trim())
        .firstName(request.firstName().trim())
        .lastName(request.lastName().trim())
        .hashedPassword(passwordEncoder.encode(request.password()))
        .build();

    userRepository.save(user);
    log.info("Usuario registrado: {} (id: {})", user.getEmail(), user.getId());

    // Paso 3: Crear token de verificación de email (UUID, expira en 24 horas)
    String tokenValue = UUID.randomUUID().toString();
    EmailVerificationToken verificationToken = EmailVerificationToken.builder()
        .user(user)
        .token(tokenValue)
        .expiresAt(OffsetDateTime.now().plusHours(24))
        .build();

    emailVerificationTokenRepository.save(verificationToken);

    // Paso 4: Enviar email de verificación de forma asíncrona (@Async)
    emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), tokenValue);

    return UserResponse.from(user);
  }

  // -------------------------------------------------------------------------
  // 2. Login
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Autentica al usuario: verifica credenciales, estado de cuenta y emite
   * tokens.
   * ¿Para qué? Es la puerta de entrada al sistema — tras el login el cliente
   * tiene access y refresh tokens para hacer peticiones autenticadas.
   * ¿Impacto? Si el mensaje de error revela si el email existe o no, un atacante
   * puede enumerar usuarios válidos (OWASP A01) — siempre mensaje genérico.
   *
   * @param request DTO con email y password
   * @return TokenResponse con access token (15 min) y refresh token (7 días)
   * @throws BadCredentialsException Si las credenciales son incorrectas
   */
  public TokenResponse login(LoginRequest request) {

    // Paso 1: Buscar usuario por email (case-insensitive)
    User user = userRepository
        .findByEmailIgnoreCase(request.email())
        .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

    // Paso 2: Verificar contraseña con BCrypt.matches()
    if (!passwordEncoder.matches(request.password(), user.getHashedPassword())) {
      log.warn("Intento de login fallido para: {}", request.email());
      throw new BadCredentialsException("Credenciales inválidas");
    }

    // Paso 3: Verificar que el email fue verificado
    if (!user.isEmailVerified()) {
      throw new IllegalStateException(
          "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
    }

    // Paso 4: Verificar que la cuenta está activa
    if (!user.isActive()) {
      throw new IllegalStateException("Tu cuenta ha sido deshabilitada. Contacta al soporte.");
    }

    // Paso 5: Generar tokens JWT
    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);

    log.info("Login exitoso para: {}", user.getEmail());
    return TokenResponse.of(accessToken, refreshToken);
  }

  // -------------------------------------------------------------------------
  // 3. Renovar access token
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Emite un nuevo access token a partir de un refresh token válido.
   * ¿Para qué? El access token dura 15 min — sin este endpoint el usuario
   * tendría que loguearse cada 15 minutos.
   * ¿Impacto? Si se acepta un access token como refresh token, se anula la
   * separación de propósitos — OWASP A07 Identification Failures.
   *
   * @param request DTO con el refresh token
   * @return TokenResponse con nuevo access token (el refresh token se reutiliza)
   * @throws BadCredentialsException Si el refresh token es inválido o expirado
   */
  public TokenResponse refreshToken(RefreshTokenRequest request) {

    String refreshToken = request.refreshToken();

    // Paso 1: Verificar que es un refresh token (no un access token)
    if (!jwtService.isRefreshToken(refreshToken)) {
      throw new BadCredentialsException("Token inválido para esta operación");
    }

    // Paso 2: Extraer el email del refresh token
    String email;
    try {
      email = jwtService.extractEmail(refreshToken);
    } catch (Exception e) {
      throw new BadCredentialsException("Token de refresco inválido o expirado");
    }

    // Paso 3: Cargar el usuario y emitir nuevo access token
    User user = (User) userDetailsService.loadUserByUsername(email);

    if (!jwtService.isTokenValid(refreshToken, user)) {
      throw new BadCredentialsException("Token de refresco inválido o expirado");
    }

    String newAccessToken = jwtService.generateAccessToken(user);
    return TokenResponse.of(newAccessToken, refreshToken); // mismo refresh token
  }

  // -------------------------------------------------------------------------
  // 4. Cambio de contraseña (autenticado)
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Cambia la contraseña del usuario autenticado, verificando la actual
   * primero.
   * ¿Para qué? Requiere la contraseña actual como factor adicional — si alguien
   * roba la sesión, no puede cambiar la contraseña sin conocer la original.
   * ¿Impacto? Sin este requisito, un token robado permitiría cambiar la
   * contraseña
   * y hacer un account takeover completo — OWASP A07.
   *
   * @param user    Usuario autenticado (cargado por Spring Security desde el JWT)
   * @param request DTO con contraseña actual y nueva contraseña
   * @return MessageResponse confirmando el cambio
   * @throws BadCredentialsException Si la contraseña actual es incorrecta
   */
  // Transacción para garantizar que el save() del usuario sea atómico.
  @Transactional
  public MessageResponse changePassword(User user, ChangePasswordRequest request) {

    // Verificar contraseña actual
    if (!passwordEncoder.matches(request.currentPassword(), user.getHashedPassword())) {
      throw new BadCredentialsException("La contraseña actual es incorrecta");
    }

    // Actualizar contraseña (el método de la entidad encapsula la mutación)
    user.updatePassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);

    log.info("Contraseña actualizada para: {}", user.getEmail());
    return MessageResponse.of("Contraseña actualizada correctamente");
  }

  // -------------------------------------------------------------------------
  // 5. Solicitar recuperación de contraseña
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Genera un token de recuperación y envía el email — siempre responde
   * igual.
   * ¿Para qué? Iniciar el flujo de recuperación de contraseña de un usuario que
   * olvidó sus credenciales.
   * ¿Impacto? La respuesta es idéntica si el email existe o no (OWASP A01:
   * no revelar qué emails están registrados en el sistema).
   * El token expira en 1 hora y es de un solo uso.
   *
   * @param request DTO con el email del usuario
   * @return MessageResponse genérico (siempre el mismo, sin importar si el email
   *         existe)
   */
  // Transacción: deleteByUser + save del nuevo token deben ser atómicos.
  // Si el save falla, el deleteByUser también se revierte — no se pierden tokens
  // viejos.
  @Transactional
  public MessageResponse forgotPassword(ForgotPasswordRequest request) {

    // Mensaje genérico para SIEMPRE, sin importar si el email existe
    final String genericMessage = "Si el email está registrado, recibirás un enlace de recuperación en breve.";

    userRepository.findByEmailIgnoreCase(request.email()).ifPresent(user -> {

      // Eliminar tokens anteriores de este usuario (limpiar tokens viejos)
      passwordResetTokenRepository.deleteByUser(user);

      // Generar nuevo token de recuperación (UUID, expira en 1 hora)
      String tokenValue = UUID.randomUUID().toString();
      PasswordResetToken resetToken = PasswordResetToken.builder()
          .user(user)
          .token(tokenValue)
          .expiresAt(OffsetDateTime.now().plusHours(1))
          .build();

      passwordResetTokenRepository.save(resetToken);

      // Enviar email de recuperación de forma asíncrona (@Async)
      emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), tokenValue);

      log.info("Token de recuperación generado para: {}", user.getEmail());
    });

    return MessageResponse.of(genericMessage);
  }

  // -------------------------------------------------------------------------
  // 6. Restablecer contraseña con token
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Valida el token de recuperación y actualiza la contraseña.
   * ¿Para qué? Completar el flujo de recuperación iniciado en forgotPassword().
   * ¿Impacto? El token se marca como usado (used=true) después de validarlo —
   * si no se hace, el mismo token puede usarse varias veces para
   * resetear la contraseña (OWASP A04: Insecure Design).
   *
   * @param request DTO con el token de recuperación y la nueva contraseña
   * @return MessageResponse confirmando el cambio
   * @throws IllegalArgumentException Si el token es inválido, expirado o ya usado
   */
  // Transacción: actualizar la contraseña y marcar el token como usado deben
  // ocurrir
  // juntos. Si uno falla, el otro se revierte — evita estados inconsistentes en
  // la BD.
  @Transactional
  public MessageResponse resetPassword(ResetPasswordRequest request) {

    // Buscar el token en la BD
    PasswordResetToken resetToken = passwordResetTokenRepository
        .findByToken(request.token())
        .orElseThrow(() -> new IllegalArgumentException("Token de recuperación inválido o expirado"));

    // Verificar que el token no haya sido usado ya
    if (resetToken.isUsed()) {
      throw new IllegalArgumentException("Este token ya fue utilizado. Solicita uno nuevo.");
    }

    // Verificar que el token no haya expirado
    if (resetToken.isExpired()) {
      throw new IllegalArgumentException("El token de recuperación ha expirado. Solicita uno nuevo.");
    }

    // Actualizar contraseña del usuario
    User user = resetToken.getUser();
    user.updatePassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);

    // Marcar el token como usado (single-use — OWASP A04)
    resetToken.markAsUsed();
    passwordResetTokenRepository.save(resetToken);

    log.info("Contraseña restablecida para: {}", user.getEmail());
    return MessageResponse.of("Contraseña restablecida correctamente. Ya puedes iniciar sesión.");
  }

  // -------------------------------------------------------------------------
  // 7. Verificar email
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Valida el token de verificación de email y activa la cuenta del
   * usuario.
   * ¿Para qué? Confirmar que el usuario tiene acceso real al email registrado.
   * Tras la verificación, isEnabled() retorna true y puede hacer login.
   * ¿Impacto? Sin este paso, el usuario se registró pero no puede usar el sistema
   * —
   * es la barrera contra registros con emails falsos o ajenos.
   *
   * @param request DTO con el token de verificación de email
   * @return MessageResponse confirmando la activación
   * @throws IllegalArgumentException Si el token es inválido, expirado o ya usado
   */
  // Transacción: marcar emailVerified=true en el user y used=true en el token
  // deben
  // ser atómicos. Si uno falla, el otro se revierte — la cuenta no queda a
  // medias.
  @Transactional
  public MessageResponse verifyEmail(VerifyEmailRequest request) {

    // Buscar el token en la BD
    EmailVerificationToken verificationToken = emailVerificationTokenRepository
        .findByToken(request.token())
        .orElseThrow(() -> new IllegalArgumentException("Token de verificación inválido o expirado"));

    // Verificar que no haya sido usado
    if (verificationToken.isUsed()) {
      throw new IllegalArgumentException("Este token ya fue utilizado.");
    }

    // Verificar que no haya expirado (24 horas)
    if (verificationToken.isExpired()) {
      throw new IllegalArgumentException("El token de verificación ha expirado. Regístrate de nuevo.");
    }

    // Marcar email como verificado y activar cuenta
    User user = verificationToken.getUser();
    user.markEmailAsVerified();
    userRepository.save(user);

    // Marcar token como usado (single-use)
    verificationToken.markAsUsed();
    emailVerificationTokenRepository.save(verificationToken);

    log.info("Email verificado para: {}", user.getEmail());
    return MessageResponse.of("Email verificado correctamente. ¡Ya puedes iniciar sesión!");
  }

  // -------------------------------------------------------------------------
  // 8. Obtener perfil del usuario autenticado
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Retorna los datos públicos del usuario autenticado en el contexto
   * actual.
   * ¿Para qué? El endpoint GET /api/v1/users/me necesita acceder al usuario
   * cargado por el JwtAuthenticationFilter.
   * ¿Impacto? Si se expone info de otro usuario (no del autenticado), hay una
   * vulnerabilidad IDOR — aquí siempre se usa el usuario del contexto.
   *
   * @param email Email del usuario autenticado (extraído del SecurityContext)
   * @return UserResponse con los datos públicos del usuario
   * @throws UsernameNotFoundException Si el usuario no existe en la BD
   */
  public UserResponse getProfile(String email) {
    User user = userRepository
        .findByEmailIgnoreCase(email)
        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    return UserResponse.from(user);
  }
}
