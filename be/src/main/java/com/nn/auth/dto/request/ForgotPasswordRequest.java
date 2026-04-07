/**
 * Archivo: ForgotPasswordRequest.java
 * Descripción: DTO de entrada para POST /api/v1/auth/forgot-password.
 * ¿Para qué? Recibir el email para generar y enviar el token de recuperación.
 * ¿Impacto? La respuesta de este endpoint es siempre idéntica (200 con mensaje
 *           genérico), sin importar si el email existe o no — OWASP A01:
 *           no revelar qué emails están registrados en el sistema.
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * ¿Qué? DTO con el email para solicitar recuperación de contraseña.
 *
 * @param email Dirección de email del usuario que olvidó su contraseña
 */
public record ForgotPasswordRequest(

    @NotBlank(message = "El email es requerido") @Email(message = "Formato de email inválido") String email

) {
}
