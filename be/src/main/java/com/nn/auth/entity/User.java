/**
 * Archivo: User.java
 * Descripción: Entidad JPA que representa a un usuario registrado en el sistema.
 * ¿Para qué? Mapear la tabla `users` de PostgreSQL y servir como principal de
 *            Spring Security — es el centro de todo el sistema de autenticación.
 * ¿Impacto? Un error en esta entidad (campo mal mapeado, constraint incorrecta) puede
 *            causar que Flyway valide el esquema y la app no arranque —
 *            o peor, que se almacenen datos incorrectos en BD.
 */
package com.nn.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

// Marca esta clase como una entidad JPA — Hibernate la mapeará a una tabla de la BD.
// Sin @Entity, JPA ignora esta clase completamente y no genera ni valida la tabla.
@Entity

// Especifica el nombre exacto de la tabla en PostgreSQL.
// Sin @Table, JPA usaría el nombre de la clase ("user") — que además es palabra
// reservada en SQL.
@Table(name = "users")

// Lombok: genera getters públicos para todos los campos (getName(), getEmail(),
// etc.).
// Se usa @Getter en lugar de @Data para no generar setters — la entidad es
// inmutable por diseño.
@Getter

// Lombok: genera el patrón Builder — permite crear objetos User con sintaxis
// fluida:
// User.builder().email(...).fullName(...).build()
@Builder

// Lombok: genera el constructor sin parámetros. JPA lo requiere
// obligatoriamente
// para reconstruir objetos al leer filas de la BD (via reflexión).
@NoArgsConstructor

// Lombok: genera el constructor con todos los campos como parámetros.
// @Builder lo necesita internamente para inicializar el objeto completo.
@AllArgsConstructor
public class User implements UserDetails {

  /**
   * ¿Qué? Identificador único del usuario — UUID v4 generado por PostgreSQL.
   * ¿Para qué? Usar UUID en lugar de SERIAL (entero secuencial) evita exponer
   * el número total de usuarios y dificulta la enumeración de IDs.
   * ¿Impacto? Si se usa SERIAL, un atacante puede estimar cuántos usuarios
   * hay y hacer IDOR (Insecure Direct Object Reference) con IDs conocidos.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "uuid", updatable = false, nullable = false)
  private UUID id;

  /**
   * ¿Qué? Email del usuario — único en la tabla, sirve como username.
   * ¿Para qué? Identificar unívocamente al usuario en el login y en toda la API.
   * ¿Impacto? Si no se valida unicidad aquí Y en el servicio, un segundo registro
   * con el mismo email podría causar conflictos de datos.
   */
  @Column(nullable = false, unique = true, length = 255)
  private String email;

  /**
   * ¿Qué? Nombre completo del usuario — solo para mostrar en la UI.
   * ¿Para qué? Personalizar la interfaz (ej: "Hola, Juan García") sin necesitar
   * otro endpoint de perfil complejo.
   */
  @Column(name = "full_name", nullable = false, length = 255)
  private String fullName;

  /**
   * ¿Qué? Hash BCrypt de la contraseña — NUNCA la contraseña en texto plano.
   * ¿Para qué? Almacenar la contraseña de forma segura — incluso si la BD es
   * comprometida, el atacante no obtiene la contraseña original.
   * ¿Impacto? Si se almacena en texto plano, una filtración expone las
   * contraseñas
   * de TODOS los usuarios — muchos reusan contraseñas en otros servicios.
   */
  @Column(name = "hashed_password", nullable = false, length = 255)
  private String hashedPassword;

  /**
   * ¿Qué? Bandera que indica si la cuenta está activa (no bloqueada/eliminada).
   * ¿Para qué? Permitir deshabilitar cuentas sin borrarlas de la BD —
   * útil para moderación y auditoría.
   * ¿Impacto? Si no se verifica en el login, una cuenta deshabilitada podría
   * seguir autenticándose.
   */
  // Lottery: sin @Builder.Default, el @Builder de Lombok ignoraría el `= true`
  // y generaría active=false en cada usuario creado con el builder — bug
  // silencioso.
  @Builder.Default
  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  /**
   * ¿Qué? Bandera que indica si el email fue verificado tras el registro.
   * ¿Para qué? Confirmar que el usuario tiene acceso real al email registrado —
   * evita registros con emails falsos o ajenos.
   * ¿Impacto? Sin verificación, alguien puede registrarse con el email de otra
   * persona y hacerse pasar por ella.
   */
  // @Builder.Default preserva el valor por defecto `= false` cuando se usa el
  // builder.
  // Sin esto, @Builder ignoraría el inicializador — emailVerified sería false de
  // todas
  // formas aquí, pero la documentación de intención es más clara con
  // @Builder.Default.
  @Builder.Default
  @Column(name = "is_email_verified", nullable = false)
  private boolean emailVerified = false;

  /** Timestamp de creación — se establece una sola vez en @PrePersist. */
  @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime createdAt;

  /** Timestamp de última modificación — se actualiza en cada @PreUpdate. */
  @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime updatedAt;

  // -------------------------------------------------------------------------
  // Ciclo de vida JPA — timestamps automáticos
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Se ejecuta automáticamente antes de `INSERT` en la BD.
   * ¿Para qué? Establecer los timestamps de creación y actualización
   * sin depender de la BD ni del código del servicio.
   * ¿Impacto? Si no se inicializan aquí, las columnas NOT NULL fallarían
   * al insertar — causando un DataIntegrityViolationException.
   */
  // JPA llama a este método automáticamente justo antes de ejecutar el INSERT en
  // la BD.
  // No hace falta llamarlo desde ningún servicio — JPA lo gestiona solo.
  @PrePersist
  protected void onCreate() {
    OffsetDateTime now = OffsetDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  /**
   * ¿Qué? Se ejecuta automáticamente antes de `UPDATE` en la BD.
   * ¿Para qué? Mantener `updated_at` sincronizado con la última modificación
   * real.
   * ¿Impacto? Sin esto, `updated_at` quedaría congelado en la fecha de creación,
   * imposibilitando auditar cuándo se cambió la contraseña.
   */
  // JPA llama a este método automáticamente justo antes de ejecutar el UPDATE en
  // la BD.
  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = OffsetDateTime.now();
  }

  // -------------------------------------------------------------------------
  // Métodos de modificación (no usar @Setter de Lombok para encapsular lógica)
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Actualiza el hash de contraseña del usuario.
   * ¿Para qué? Centralizar el cambio de contraseña — siempre debe recibir
   * un hash BCrypt, nunca texto plano.
   * ¿Impacto? Si el servicio pasa texto plano aquí, se almacena sin hashear.
   *
   * @param newHashedPassword Nuevo hash BCrypt de la contraseña
   */
  public void updatePassword(String newHashedPassword) {
    this.hashedPassword = newHashedPassword;
  }

  /**
   * ¿Qué? Marca el email del usuario como verificado.
   * ¿Para qué? Se llama tras validar el token de verificación de email.
   * ¿Impacto? Sin llamar a este método, el usuario no podrá hacer login
   * (isEnabled() retorna false hasta que emailVerified sea true).
   */
  public void markEmailAsVerified() {
    this.emailVerified = true;
  }

  /**
   * ¿Qué? Deshabilita la cuenta del usuario.
   * ¿Para qué? Bloquear el acceso sin eliminar el historial del usuario.
   */
  public void deactivate() {
    this.active = false;
  }

  // -------------------------------------------------------------------------
  // Implementación de UserDetails (Spring Security)
  // -------------------------------------------------------------------------

  /**
   * ¿Qué? Retorna los roles/permisos del usuario para Spring Security.
   * ¿Para qué? Permitir uso de @PreAuthorize("hasRole('USER')") en controllers.
   * ¿Impacto? Si retorna vacío, Spring Security bloquea TODAS las rutas
   * autenticadas — el usuario nunca tendría acceso.
   */
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_USER"));
  }

  /**
   * Retorna el hash BCrypt — Spring Security lo compara internamente con
   * BCrypt.matches().
   */
  @Override
  public String getPassword() {
    return hashedPassword;
  }

  /** El "username" en Spring Security es el email en este sistema. */
  @Override
  public String getUsername() {
    return email;
  }

  /** Siempre true — no manejamos expiración de credenciales. */
  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  /**
   * ¿Qué? La cuenta está habilitada solo si está activa Y el email fue
   * verificado.
   * ¿Para qué? Bloquear el login si el usuario no verificó su email o fue
   * deshabilitado.
   * ¿Impacto? Sin esta verificación, usuarios sin email verificado podrían
   * acceder
   * a recursos protegidos — vacía el propósito de la verificación de email.
   */
  @Override
  public boolean isEnabled() {
    return active && emailVerified;
  }

  /** La cuenta nunca expira — usamos `active` para bloquear manualmente. */
  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  /** La cuenta no está bloqueada mientras `active` sea true. */
  @Override
  public boolean isAccountNonLocked() {
    return active;
  }
}
