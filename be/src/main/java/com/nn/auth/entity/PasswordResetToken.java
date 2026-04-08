/**
 * Archivo: PasswordResetToken.java
 * Descripción: Entidad JPA que representa un token de recuperación de contraseña.
 * ¿Para qué? Almacenar tokens de un solo uso con expiración para el flujo de
 *            "Olvidé mi contraseña" — vincular al usuario sin exponer su contraseña.
 * ¿Impacto? Si el token no tiene expiración o no se marca como `used`,
 *            un atacante que intercepte el email podría resetear la contraseña
 *            después de que el usuario ya lo hizo — violación OWASP A04.
 */
package com.nn.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

// Entidad JPA — Hibernate la mapeará a la tabla configurada en @Table.
@Entity
// Nombre exacto de la tabla en PostgreSQL.
@Table(name = "password_reset_tokens")
// Lombok: genera getters públicos para todos los campos.
@Getter
// Lombok: habilita el patrón Builder para crear instancias con sintaxis fluida.
@Builder
// Lombok: constructor sin parámetros requerido por JPA para reconstruir objetos
// desde la BD.
@NoArgsConstructor
// Lombok: constructor con todos los campos, requerido internamente por
// @Builder.
@AllArgsConstructor
public class PasswordResetToken {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "uuid", updatable = false, nullable = false)
  private UUID id;

  /**
   * ¿Qué? Relación con el usuario propietario del token.
   * ¿Para qué? Saber a qué usuario corresponde este token de reset
   * cuando llegue la petición de /reset-password.
   * ¿Impacto? EAGER para evitar LazyInitializationException al acceder
   * al usuario fuera de una sesión JPA activa en el servicio.
   */
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  /**
   * ¿Qué? El token UUID que se envía por email y se recibe en el endpoint.
   * ¿Para qué? Identificar la solicitud de reset sin exponer datos del usuario.
   * ¿Impacto? DEBE ser aleatorio (UUID) — un token predecible (como el email
   * hasheado) permitiría a un atacante generar tokens válidos sin
   * tener acceso al email.
   */
  @Column(nullable = false, unique = true, length = 255)
  private String token;

  /**
   * ¿Qué? Timestamp de expiración del token — máximo 1 hora desde su creación.
   * ¿Para qué? Limitar la ventana de tiempo en que el token es válido.
   * ¿Impacto? Sin expiración, un email de reset válido de hace 6 meses podría
   * usarse hoy — viola el principio de mínimo tiempo de exposición.
   */
  @Column(name = "expires_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime expiresAt;

  /**
   * ¿Qué? Bandera que indica si el token ya fue utilizado.
   * ¿Para qué? Evitar el reuso del token — un token de un solo uso es
   * obligatorio.
   * ¿Impacto? Sin este check, si el email fue interceptado, el atacante podría
   * resetear la contraseña incluso después de que el usuario lo hiciera.
   */
  // @Builder.Default preserva el valor por defecto `= false` al usar el builder.
  // Sin esto, Lombok @Builder ignoraría el inicializador y el campo sería null.
  @Builder.Default
  @Column(nullable = false)
  private boolean used = false;

  @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime createdAt;

  // JPA llama a este método automáticamente antes del INSERT — inicializa
  // createdAt.
  @PrePersist
  protected void onCreate() {
    this.createdAt = OffsetDateTime.now();
  }

  /**
   * ¿Qué? Marca el token como usado — llamar SIEMPRE tras el reset exitoso.
   * ¿Para qué? Invalidar el token para que no pueda reutilizarse.
   * ¿Impacto? Si no se llama, el mismo link de email podría usarse múltiples
   * veces.
   */
  public void markAsUsed() {
    this.used = true;
  }

  /**
   * ¿Qué? Verifica si el token ha expirado comparando con el momento actual.
   * ¿Para qué? Centralizar la lógica de expiración en la entidad.
   * ¿Impacto? Si no se verifica, tokens expirados serían aceptados — violación
   * OWASP A04.
   *
   * @return true si el token ya expiró
   */
  public boolean isExpired() {
    return OffsetDateTime.now().isAfter(expiresAt);
  }
}
