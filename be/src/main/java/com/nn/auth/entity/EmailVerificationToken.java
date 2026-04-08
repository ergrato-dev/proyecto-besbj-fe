/**
 * Archivo: EmailVerificationToken.java
 * Descripción: Entidad JPA que representa un token de verificación de email.
 * ¿Para qué? Confirmar que el usuario tiene acceso real al email con el que se registró,
 *            enviando un enlace de un solo uso con expiración de 24 horas.
 * ¿Impacto? Sin verificación de email, alguien puede registrarse con el email de otra
 *            persona. La cuenta queda bloqueada (isEnabled=false) hasta verificar.
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
@Table(name = "email_verification_tokens")
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
public class EmailVerificationToken {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "uuid", updatable = false, nullable = false)
  private UUID id;

  /**
   * ¿Qué? Relación con el usuario que debe verificar su email.
   * ¿Para qué? Saber a qué usuario corresponde el token al procesar
   * /verify-email.
   */
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  /**
   * ¿Qué? El token UUID incluido en el enlace de verificación enviado por email.
   * ¿Para qué? Identificar la solicitud de verificación de forma segura y
   * aleatoria.
   * ¿Impacto? Un token predecible permitiría a un atacante verificar cuentas
   * ajenas
   * sin tener acceso al email — vaciaría el propósito de la verificación.
   */
  @Column(nullable = false, unique = true, length = 255)
  private String token;

  /**
   * ¿Qué? Timestamp de expiración — 24 horas desde su creación.
   * ¿Para qué? Si el usuario no verifica en 24h, el token expira y debe
   * solicitarse
   * un nuevo enlace de verificación.
   * ¿Impacto? Sin expiración, un enlace de verificación de hace meses podría
   * validar
   * una cuenta de un usuario que ya no controla ese email.
   */
  @Column(name = "expires_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime expiresAt;

  /**
   * ¿Qué? Bandera de uso único — previene doble verificación con el mismo token.
   * ¿Para qué? Invalidar el token tras el primer uso exitoso.
   */
  // @Builder.Default preserva el valor por defecto `= false` al usar el builder.
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
   * ¿Qué? Marca el token como usado — llamar tras verificar el email
   * exitosamente.
   * ¿Para qué? Invalidar el token para que el enlace del email no funcione dos
   * veces.
   */
  public void markAsUsed() {
    this.used = true;
  }

  /**
   * ¿Qué? Verifica si el token de verificación ha expirado.
   * ¿Para qué? Centralizar la lógica de expiración en la entidad.
   *
   * @return true si el token ya expiró (más de 24h desde su creación)
   */
  public boolean isExpired() {
    return OffsetDateTime.now().isAfter(expiresAt);
  }
}
