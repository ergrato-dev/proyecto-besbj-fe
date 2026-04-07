/**
 * Archivo: LoginRequest.java
 * Descripción: DTO de entrada para el endpoint POST /api/v1/auth/login.
 * ¿Para qué? Recibir credenciales del usuario para autenticación.
 * ¿Impacto? Solo validamos que no estén vacíos — NO validamos formato de email
 *           aquí intencionalmente: si el email no existe, devolvemos error genérico
 *           (OWASP: no revelar si el email está registrado o no).
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * ¿Qué? DTO de login con email y password.
 * ¿Para qué? Separar la representación HTTP (DTO) de la entidad JPA (User).
 * El controller nunca recibe un User directamente — siempre un DTO.
 *
 * @param email    Email del usuario (sin validación @Email — ver descripción)
 * @param password Contraseña en texto plano — se verifica con BCrypt.matches()
 */
public record LoginRequest(

    @NotBlank(message = "El email es requerido") String email,

    @NotBlank(message = "La contraseña es requerida") String password

) {
}
