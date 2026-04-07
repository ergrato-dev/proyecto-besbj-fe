/**
 * Archivo: GlobalExceptionHandler.java
 * Descripción: Manejador centralizado de excepciones de la API REST.
 * ¿Para qué? Capturar excepciones en cualquier Controller y devolver respuestas HTTP
 *            consistentes y pedagógicas en lugar de stack traces del servidor.
 * ¿Impacto? Sin este handler, Spring devuelve el stack trace completo al cliente
 *            — expone detalles internos del sistema (riesgo de seguridad OWASP A05).
 */
package com.nn.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * ¿Qué? Maneja errores de validación de Bean Validation (@Valid en DTOs).
   * ¿Para qué? Devolver todos los errores de campo en una sola respuesta 400
   * para que el frontend muestre mensajes de validación por campo.
   * ¿Impacto? Sin esto, el cliente recibe un 400 genérico sin saber qué campo
   * falló.
   *
   * @param ex Excepción con los errores de validación por campo
   * @return ProblemDetail 400 con mapa de campo → mensaje de error
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ProblemDetail handleValidationErrors(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
      errors.put(fieldError.getField(), fieldError.getDefaultMessage());
    }

    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    detail.setTitle("Error de validación");
    detail.setDetail("Uno o más campos no cumplen las restricciones requeridas");
    detail.setProperty("errors", errors);
    detail.setProperty("timestamp", Instant.now());
    return detail;
  }

  /**
   * ¿Qué? Maneja errores de autenticación (token inválido, expirado, etc.).
   * ¿Para qué? Devolver 401 con mensaje genérico — no revelar detalles del error.
   * ¿Impacto? Un mensaje como "Usuario no encontrado" da pistas al atacante
   * sobre qué emails existen — viola OWASP A04.
   *
   * @param ex Excepción de autenticación de Spring Security
   * @return ProblemDetail 401 con mensaje genérico
   */
  @ExceptionHandler(AuthenticationException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public ProblemDetail handleAuthenticationException(AuthenticationException ex) {
    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
    detail.setTitle("No autorizado");
    detail.setDetail(ex.getMessage() != null ? ex.getMessage() : "Credenciales inválidas o token expirado");
    detail.setProperty("timestamp", Instant.now());
    return detail;
  }

  /**
   * ¿Qué? Maneja errores de lógica de negocio — token inválido, email ya usado,
   * etc.
   * ¿Para qué? Devolver 400 con el mensaje descriptivo del error de negocio.
   * ¿Impacto? Permite al frontend mostrar mensajes de error específicos al
   * usuario.
   *
   * @param ex Excepción de argumento/estado inválido lanzada por AuthService
   * @return ProblemDetail 400 con el mensaje del error
   */
  @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ProblemDetail handleBusinessException(RuntimeException ex) {
    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    detail.setTitle("Solicitud inválida");
    detail.setDetail(ex.getMessage());
    detail.setProperty("timestamp", Instant.now());
    return detail;
  }

  /**
   * ¿Qué? Maneja acceso denegado (usuario autenticado pero sin permisos).
   * ¿Para qué? Devolver 403 en lugar de dejar que Spring devuelva un redirect de
   * login.
   * ¿Impacto? Permite al frontend distinguir entre "no autenticado" (401) y
   * "autenticado pero sin permisos" (403).
   *
   * @param ex Excepción de acceso denegado
   * @return ProblemDetail 403
   */
  @ExceptionHandler(AccessDeniedException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public ProblemDetail handleAccessDeniedException(AccessDeniedException ex) {
    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
    detail.setTitle("Acceso denegado");
    detail.setDetail("No tienes permisos para realizar esta acción");
    detail.setProperty("timestamp", Instant.now());
    return detail;
  }

  /**
   * ¿Qué? Captura cualquier excepción no manejada por los handlers anteriores.
   * ¿Para qué? Evitar que stack traces internos lleguen al cliente en producción.
   * ¿Impacto? Loggear el error para debugging pero devolver solo un 500 genérico.
   *
   * @param ex Excepción inesperada
   * @return ProblemDetail 500 genérico
   */
  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ProblemDetail handleGenericException(Exception ex) {
    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    detail.setTitle("Error interno del servidor");
    detail.setDetail("Ocurrió un error inesperado. Por favor intenta de nuevo.");
    detail.setProperty("timestamp", Instant.now());
    return detail;
  }
}
