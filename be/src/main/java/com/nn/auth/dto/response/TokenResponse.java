/**
 * Archivo: TokenResponse.java
 * Descripción: DTO de respuesta para login y refresh — contiene los tokens JWT.
 * ¿Para qué? Devolver al cliente los tokens necesarios para autenticarse en
 *            peticiones subsiguientes, sin exponer datos internos del User.
 * ¿Impacto? NUNCA incluir datos sensibles aquí (contraseñas, IDs internos).
 *           Solo los tokens y su tipo — el frontend los almacena en memoria
 *           (no en localStorage para evitar XSS — OWASP A03).
 */
package com.nn.auth.dto.response;

/**
 * ¿Qué? DTO de respuesta con los tokens JWT tras login o refresh exitoso.
 *
 * @param accessToken  JWT de corta duración (15 min) — enviar en Authorization:
 *                     Bearer
 * @param refreshToken JWT de larga duración (7 días) — solo para renovar access
 *                     token
 * @param tokenType    Tipo de token — siempre "Bearer" según RFC 6750
 */
public record TokenResponse(
    String accessToken,
    String refreshToken,
    String tokenType) {

  /**
   * ¿Qué? Factory method con tokenType predeterminado "Bearer".
   * ¿Para qué? Simplificar la creación en el servicio sin repetir "Bearer" cada
   * vez.
   *
   * @param accessToken  JWT de acceso
   * @param refreshToken JWT de refresco
   * @return TokenResponse con tokenType = "Bearer"
   */
  public static TokenResponse of(String accessToken, String refreshToken) {
    return new TokenResponse(accessToken, refreshToken, "Bearer");
  }
}
