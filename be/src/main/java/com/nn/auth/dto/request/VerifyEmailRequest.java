/**
 * Archivo: VerifyEmailRequest.java
 * Descripción: DTO de entrada para POST /api/v1/auth/verify-email.
 * ¿Para qué? Recibir el token de verificación de email enviado al registrarse.
 * ¿Impacto? Sin verificación de email, cualquiera puede registrarse con el email
 *           de otra persona — este flujo confirma la titularidad del email.
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * ¿Qué? DTO con el token de verificación de email.
 *
 * @param token UUID del token de verificación recibido por email al registrarse
 */
public record VerifyEmailRequest(

    @NotBlank(message = "El token de verificación es requerido") String token

) {
}
