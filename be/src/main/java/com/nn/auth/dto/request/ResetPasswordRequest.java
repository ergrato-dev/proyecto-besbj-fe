/**
 * Archivo: ResetPasswordRequest.java
 * Descripción: DTO de entrada para POST /api/v1/auth/reset-password.
 * ¿Para qué? Recibir el token de recuperación (enviado por email) y la nueva
 *            contraseña para restablecerla.
 * ¿Impacto? El token se valida en el servicio: no expirado + no usado previamente.
 *           Si no se valida el "used", un token capturado puede usarse múltiples
 *           veces — OWASP A04: Insecure Design.
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * ¿Qué? DTO para restablecer la contraseña con token de recuperación.
 *
 * @param token       UUID del token de recuperación recibido por email
 * @param newPassword Nueva contraseña en texto plano — se hashea con BCrypt
 */
public record ResetPasswordRequest(

    @NotBlank(message = "El token de recuperación es requerido") String token,

    @NotBlank(message = "La nueva contraseña es requerida") @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres") @Pattern(regexp = ".*[A-Z].*", message = "La nueva contraseña debe contener al menos una letra mayúscula") @Pattern(regexp = ".*[a-z].*", message = "La nueva contraseña debe contener al menos una letra minúscula") @Pattern(regexp = ".*\\d.*", message = "La nueva contraseña debe contener al menos un número") String newPassword

) {
}
