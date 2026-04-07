/**
 * Archivo: ChangePasswordRequest.java
 * Descripción: DTO de entrada para el endpoint POST /api/v1/auth/change-password.
 * ¿Para qué? Recibir la contraseña actual y la nueva para cambiarla de forma segura.
 * ¿Impacto? Requerir la contraseña actual previene que un atacante con sesión
 *           robada cambie la contraseña sin conocer la original (OWASP A07).
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * ¿Qué? DTO para cambio de contraseña autenticado.
 *
 * @param currentPassword Contraseña actual — se verifica con BCrypt.matches()
 * @param newPassword     Nueva contraseña en texto plano — se hashea con BCrypt
 */
public record ChangePasswordRequest(

    @NotBlank(message = "La contraseña actual es requerida") String currentPassword,

    @NotBlank(message = "La nueva contraseña es requerida") @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres") @Pattern(regexp = ".*[A-Z].*", message = "La nueva contraseña debe contener al menos una letra mayúscula") @Pattern(regexp = ".*[a-z].*", message = "La nueva contraseña debe contener al menos una letra minúscula") @Pattern(regexp = ".*\\d.*", message = "La nueva contraseña debe contener al menos un número") String newPassword

) {
}
