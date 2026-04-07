/**
 * Archivo: MessageResponse.java
 * Descripción: DTO de respuesta genérico para operaciones que no devuelven datos.
 * ¿Para qué? Proveer un cuerpo JSON consistente en respuestas 200/201 que solo
 *            confirman que la operación fue exitosa (forgot-password, verify-email, etc.).
 * ¿Impacto? Sin un body en la respuesta, el frontend no puede mostrar feedback
 *           al usuario. Un JSON vacío {} también es confuso — mensaje explícito es mejor.
 */
package com.nn.auth.dto.response;

/**
 * ¿Qué? DTO de respuesta con un mensaje de confirmación.
 *
 * @param message Mensaje descriptivo del resultado de la operación
 */
public record MessageResponse(String message) {

  /**
   * ¿Qué? Factory method para crear respuestas de mensaje en una línea.
   *
   * @param message Texto del mensaje a devolver al cliente
   * @return MessageResponse con el mensaje dado
   */
  public static MessageResponse of(String message) {
    return new MessageResponse(message);
  }
}
