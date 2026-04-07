/**
 * Archivo: UserRepository.java
 * Descripción: Repositorio Spring Data JPA para operaciones de BD sobre la entidad User.
 * ¿Para qué? Proveer métodos de acceso a datos derivados (Spring genera el SQL automáticamente)
 *            y evitar SQL manual que podría ser vulnerable a inyección.
 * ¿Impacto? Spring Data JPA genera consultas parametrizadas — protección automática
 *            contra SQL injection (OWASP A03) al NO concatenar strings en queries.
 */
package com.nn.auth.repository;

import com.nn.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

  /**
   * ¿Qué? Busca un usuario por su email de forma case-insensitive.
   * ¿Para qué? El login debe funcionar independientemente de si el usuario
   * escribe "JUAN@EMAIL.COM" o "juan@email.com".
   * ¿Impacto? Sin IgnoreCase, "user@email.com" y "User@Email.Com" serían
   * tratados como usuarios distintos — confusión y problemas de UX.
   *
   * @param email Dirección de email (case-insensitive)
   * @return Optional con el User si existe, vacío si no
   */
  Optional<User> findByEmailIgnoreCase(String email);

  /**
   * ¿Qué? Verifica si ya existe un usuario con el email dado.
   * ¿Para qué? Validar unicidad antes del registro sin cargar el objeto User
   * completo.
   * ¿Impacto? Usar existsBy es más eficiente que findBy + isPresent() —
   * Spring genera un COUNT(*) en lugar de SELECT *.
   *
   * @param email Dirección de email a verificar (case-insensitive)
   * @return true si ya existe un usuario con ese email
   */
  boolean existsByEmailIgnoreCase(String email);
}
