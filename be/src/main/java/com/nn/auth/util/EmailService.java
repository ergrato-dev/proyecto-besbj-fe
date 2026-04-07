/**
 * Archivo: EmailService.java
 * Descripción: Servicio para envío de emails transaccionales — verificación de email
 *              y recuperación de contraseña.
 * ¿Para qué? Encapsular la lógica de envío de emails para que AuthService solo
 *            necesite llamar emailService.sendVerificationEmail(user, token) sin
 *            conocer detalles de JavaMailSender ni templates HTML.
 * ¿Impacto? En desarrollo apunta a Mailpit (localhost:1025) — los emails no salen
 *           a internet y se pueden ver en http://localhost:8025. En producción,
 *           apuntar a un servicio real (SendGrid, AWS SES, etc.) via MAIL_HOST.
 */
package com.nn.auth.util;

import com.nn.auth.config.AppProperties;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * ¿Qué? Servicio Spring que usa JavaMailSender para enviar emails HTML.
 * ¿Para qué? Abstraer el envío de correos y permitir cambiarlo en el futuro
 * (ej: usar un template engine como Thymeleaf) sin tocar AuthService.
 * ¿Impacto? El @Async hace el envío en un hilo separado — el endpoint de
 * registro no espera a que el email se envíe para responder al cliente.
 */
// Registra esta clase como bean de servicio — sus métodos públícos son usados
// por AuthService para enviar emails sin conocer los detalles de
// JavaMailSender.
@Service

// Lombok: genera el constructor con JavaMailSender y AppProperties como
// parámetros.
@RequiredArgsConstructor
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);
  private static final String FROM_ADDRESS = "noreply@nn-auth.dev";
  private static final String FROM_NAME = "NN Auth System";

  private final JavaMailSender mailSender;
  private final AppProperties appProperties;

  // -------------------------------------------------------------------------
  // Email de verificación de cuenta
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Envía el email de verificación al registrarse — contiene un enlace
   * con el token UUID para activar la cuenta.
   * ¿Para qué? Confirmar que el usuario tiene acceso real al email registrado —
   * impide registros con emails ajenos o inexistentes.
   * ¿Impacto? Si no se envía, el usuario no puede verificar su email y nunca
   * podrá hacer login (isEnabled() = false mientras emailVerified = false).
   *
   * @param toEmail  Dirección de email del destinatario
   * @param fullName Nombre del usuario para personalizar el email
   * @param token    UUID del token de verificación (expira en 24h)
   */
  // Ejecuta este método en un hilo separado del thread pool de Spring.
  // El llamador (AuthService.register) retorna inmediatamente sin esperar el
  // email.
  // Requiere @EnableAsync en NnAuthSystemApplication para funcionar.
  @Async
  public void sendVerificationEmail(String toEmail, String fullName, String token) {
    String verificationUrl = appProperties.frontendUrl() + "/verify-email?token=" + token;
    String subject = "Verifica tu cuenta en NN Auth System";
    String body = buildVerificationEmailBody(fullName, verificationUrl);
    sendEmail(toEmail, subject, body);
  }

  // -------------------------------------------------------------------------
  // Email de recuperación de contraseña
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Envía el email de recuperación de contraseña con un token válido 1
   * hora.
   * ¿Para qué? Permitir al usuario restablecer su contraseña sin conocer la
   * actual.
   * ¿Impacto? OWASP A07: el enlace usa un token UUID opaco (no predecible).
   * Expira en 1 hora y es de un solo uso — previene ataques de replay.
   *
   * @param toEmail  Dirección de email del destinatario
   * @param fullName Nombre para personalizar el email
   * @param token    UUID del token de recuperación (expira en 1 hora)
   */
  // Mismo patrón async: AuthService.forgotPassword retorna la respuesta genérica
  // sin bloquear el hilo HTTP — el email viaja en paralelo.
  @Async
  public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
    String resetUrl = appProperties.frontendUrl() + "/reset-password?token=" + token;
    String subject = "Recupera tu contraseña en NN Auth System";
    String body = buildPasswordResetEmailBody(fullName, resetUrl);
    sendEmail(toEmail, subject, body);
  }

  // -------------------------------------------------------------------------
  // Método central de envío
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Método interno que construye el MimeMessage y lo envía vía
   * JavaMailSender.
   * ¿Para qué? Centralizar el manejo de excepciones de envío sin que los métodos
   * públicos (@Async) se rompan — un email fallido no debe tumbar la app.
   * ¿Impacto? Los errores se loggean pero NO se propagan — el usuario se registró
   * correctamente aunque el email fallara; puede solicitar reenvío.
   *
   * @param to      Dirección de email del destinatario
   * @param subject Asunto del email
   * @param body    Cuerpo HTML del email
   */
  private void sendEmail(String to, String subject, String body) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(FROM_ADDRESS, FROM_NAME);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(body, true); // true = HTML habilitado

      mailSender.send(message);
      log.info("Email enviado a: {} | Asunto: {}", to, subject);

    } catch (Exception e) {
      log.error("Error al enviar email a: {} | Asunto: {} | Error: {}", to, subject, e.getMessage());
      // No lanzamos la excepción — el email falla de forma silenciosa
      // El usuario puede solicitar reenvío del email de verificación
    }
  }

  // -------------------------------------------------------------------------
  // Templates HTML de los emails
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Construye el HTML del email de verificación con el enlace.
   * ¿Para qué? Tener un template limpio y accesible — diseño consistente
   * con el sistema de colores amber del proyecto (Stack: Spring Boot).
   *
   * @param fullName        Nombre del usuario para personalizar
   * @param verificationUrl URL completa del enlace de verificación
   * @return String con el HTML completo del email
   */
  private String buildVerificationEmailBody(String fullName, String verificationUrl) {
    return """
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; background: #f9fafb;
                     margin: 0; padding: 40px 0;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff;
                      border-radius: 8px; overflow: hidden;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

            <!-- Cabecera con acento amber -->
            <div style="background: #d97706; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                NN Auth System
              </h1>
            </div>

            <!-- Cuerpo -->
            <div style="padding: 40px 32px;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">
                Hola, %s
              </h2>
              <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
                Gracias por registrarte. Para activar tu cuenta y comenzar a usar
                el sistema, verifica tu dirección de email haciendo clic en el
                siguiente botón:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="%s"
                   style="display: inline-block; background: #d97706; color: #ffffff;
                          text-decoration: none; padding: 14px 32px; border-radius: 6px;
                          font-weight: 600; font-size: 16px;">
                  Verificar mi email
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="color: #d97706; font-size: 13px; word-break: break-all; margin: 0 0 24px;">
                %s
              </p>

              <p style="color: #9ca3af; font-size: 13px; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                Este enlace expira en 24 horas. Si no creaste esta cuenta, ignora este email.
              </p>
            </div>
          </div>
        </body>
        </html>
        """.formatted(fullName, verificationUrl, verificationUrl);
  }

  /**
   * ¿Qué? Construye el HTML del email de recuperación de contraseña.
   * ¿Para qué? Misma estructura que el de verificación, pero con mensaje
   * y enlace para resetear la contraseña.
   *
   * @param fullName Nombre del usuario
   * @param resetUrl URL completa del enlace de reset (expira en 1 hora)
   * @return String con el HTML completo del email
   */
  private String buildPasswordResetEmailBody(String fullName, String resetUrl) {
    return """
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recupera tu contraseña</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; background: #f9fafb;
                     margin: 0; padding: 40px 0;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff;
                      border-radius: 8px; overflow: hidden;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

            <!-- Cabecera con acento amber -->
            <div style="background: #d97706; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                NN Auth System
              </h1>
            </div>

            <!-- Cuerpo -->
            <div style="padding: 40px 32px;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">
                Hola, %s
              </h2>
              <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                Haz clic en el siguiente botón para crear una nueva contraseña:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="%s"
                   style="display: inline-block; background: #d97706; color: #ffffff;
                          text-decoration: none; padding: 14px 32px; border-radius: 6px;
                          font-weight: 600; font-size: 16px;">
                  Restablecer contraseña
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="color: #d97706; font-size: 13px; word-break: break-all; margin: 0 0 24px;">
                %s
              </p>

              <p style="color: #9ca3af; font-size: 13px; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email:
                tu contraseña no será modificada.
              </p>
            </div>
          </div>
        </body>
        </html>
        """.formatted(fullName, resetUrl, resetUrl);
  }
}
