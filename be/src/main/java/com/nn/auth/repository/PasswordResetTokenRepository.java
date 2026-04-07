/**
 * Archivo: PasswordResetTokenRepository.java
 * Descripción: Repositorio Spring Data JPA para tokens de recuperación de contraseña.
 * ¿Para qué? Buscar tokens válidos (no usados, no expirados) al procesar un reset,
 *            y eliminar tokens antiguos del usuario al crear uno nuevo.
 * ¿Impacto? Si no se eliminan tokens anteriores antes de crear uno nuevo, la tabla
 *            crece indefinidamente y un atacante podría intentar tokens viejos.
 */
package com.nn.auth.repository;

import com.nn.auth.entity.PasswordResetToken;
import com.nn.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

// Marca esta interfaz como bean de acceso a datos.
// Spring Data JPA genera automáticamente las implementaciones de los métodos
// declarados: findByToken(), deleteByUser(), etc. — sin escribir una línea de SQL.
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

  /**
   * ¿Qué? Busca un token por su valor de string.
   * ¿Para qué? Localizar la solicitud de reset cuando el usuario hace clic en el
   * enlace.
   * ¿Impacto? Se debe verificar adicionalmente que !used && !isExpired() antes de
   * aceptar el token — un Optional vacío significa que el token no existe.
   *
   * @param token El UUID del token recibido en la petición
   * @return Optional con el token si existe en BD
   */
  Optional<PasswordResetToken> findByToken(String token);

  /**
   * ¿Qué? Elimina todos los tokens de reset de un usuario específico.
   * ¿Para qué? Limpiar tokens anteriores antes de crear uno nuevo en
   * forgot-password.
   * Así cada usuario tiene máximo un token de reset activo a la vez.
   * ¿Impacto? Sin esta limpieza, un atacante que obtenga un token viejo podría
   * usarlo si aún no ha expirado — reducir la superficie de ataque.
   *
   * @param user El usuario cuyos tokens se eliminan
   */
  void deleteByUser(User user);
}
