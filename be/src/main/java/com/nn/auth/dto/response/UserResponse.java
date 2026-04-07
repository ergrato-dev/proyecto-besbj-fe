/**
 * Archivo: UserResponse.java
 * Descripción: DTO de respuesta con los datos públicos del usuario.
 * ¿Para qué? Exponer solo los campos seguros del usuario — NUNCA el hashedPassword
 *            ni datos internos de la entidad JPA.
 * ¿Impacto? Si se devolviera la entidad User directamente, se expondría el hash
 *           de la contraseña en la respuesta — vulnerabilidad grave de exposición
 *           de datos sensibles (OWASP A02: Cryptographic Failures).
 */
package com.nn.auth.dto.response;

import com.nn.auth.entity.User;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * ¿Qué? DTO de respuesta con los datos públicos del usuario.
 *
 * @param id            UUID del usuario — seguro para exponer (no es
 *                      secuencial)
 * @param email         Email del usuario
 * @param fullName      Nombre completo
 * @param emailVerified Si el email fue verificado
 * @param active        Si la cuenta está activa
 * @param createdAt     Timestamp de creación
 */
public record UserResponse(
    UUID id,
    String email,
    String fullName,
    boolean emailVerified,
    boolean active,
    OffsetDateTime createdAt) {

  /**
   * ¿Qué? Factory method que convierte una entidad User en un UserResponse.
   * ¿Para qué? Centralizar la conversión User → DTO para que no haya lógica
   * de mapeo dispersa en múltiples servicios.
   * ¿Impacto? Si se agrega un campo nuevo a la respuesta, solo se modifica aquí.
   *
   * @param user Entidad JPA del usuario desde la BD
   * @return UserResponse con solo los campos públicos
   */
  public static UserResponse from(User user) {
    return new UserResponse(
        user.getId(),
        user.getEmail(),
        user.getFullName(),
        user.isEmailVerified(),
        user.isActive(),
        user.getCreatedAt());
  }
}
