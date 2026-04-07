/**
 * Archivo: RefreshTokenRequest.java
 * Descripción: DTO de entrada para el endpoint POST /api/v1/auth/refresh.
 * ¿Para qué? Recibir el refresh token para emitir un nuevo access token.
 * ¿Impacto? El cliente envía el refresh token en el body (no en el header
 *           Authorization) — este DTO lo recibe y lo valida como no vacío.
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * ¿Qué? DTO con el refresh token del cliente.
 *
 * @param refreshToken El JWT de tipo "refresh" emitido en el login
 */
public record RefreshTokenRequest(

    @NotBlank(message = "El refresh token es requerido") String refreshToken

) {
}
