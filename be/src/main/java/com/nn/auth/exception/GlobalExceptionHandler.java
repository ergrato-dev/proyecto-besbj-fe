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

// Extiende @ControllerAdvice (captura excepciones de todos los controllers)
// + @ResponseBody (retorna directamente JSON, sin buscar vistas).
// Es el punto único donde se manejan TODOS los errores de la API — sin esto,
// Spring devolvería stack traces del servidor al cliente en caso de error (OWASP A05).
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
  // Le dice a Spring: «cuando cualquier controller lance
  // MethodArgumentNotValidException,
  // ejecuta ESTE método en lugar de la respuesta de error genérica por defecto».
  @ExceptionHandler(MethodArgumentNotValidException.class)
  // Establece el código HTTP de respuesta como 400 Bad Request.
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
  // Intercepta cualquier AuthenticationException lanzada en los controllers o
  // filtros.
  @ExceptionHandler(AuthenticationException.class)
  // 401 Unauthorized = el cliente no ha demostrado su identidad (falta o mal
  // token).
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
  // Acepta una lista de tipos de excepción — ambos mapean al mismo handler.
  @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })
  // 400 Bad Request = el cliente envió datos o solicitó una operación inválida.
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
  // Intercepta AccessDeniedException: usuario autenticado pero sin permisos.
  @ExceptionHandler(AccessDeniedException.class)
  // 403 Forbidden = la identidad es conocida pero no tiene permiso para este
  // recurso.
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
  // Captura de último recurso: cualquier excepción no manejada por los handlers
  // anteriores.
  // Spring busca el handler más específico primero — este es el menos específico
  // (Exception).
  @ExceptionHandler(Exception.class)
  // 500 Internal Server Error = algo falló en el servidor (no en el cliente).
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ProblemDetail handleGenericException(Exception ex) {
    ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    detail.setTitle("Error interno del servidor");
    detail.setDetail("Ocurrió un error inesperado. Por favor intenta de nuevo.");
    detail.setProperty("timestamp", Instant.now());
    return detail;
  }
}
