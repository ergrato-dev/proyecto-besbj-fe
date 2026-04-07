/**
 * Archivo: EmailVerificationTokenRepository.java
 * Descripción: Repositorio Spring Data JPA para tokens de verificación de email.
 * ¿Para qué? Buscar tokens válidos al procesar /verify-email y limpiar tokens
 *            anteriores cuando se reenvía el email de verificación.
 * ¿Impacto? Manejar correctamente estos tokens es esencial para cerrar el ciclo
 *            de registro — sin ello, ningún usuario podría activar su cuenta.
 */
package com.nn.auth.repository;

import com.nn.auth.entity.EmailVerificationToken;
import com.nn.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

// Marca esta interfaz como bean de acceso a datos.
// Spring Data JPA deriva las consultas SQL a partir de los nombres de los métodos:
// findByToken() → SELECT * FROM email_verification_tokens WHERE token = ?
// deleteByUser() → DELETE FROM email_verification_tokens WHERE user_id = ?
@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

  /**
   * ¿Qué? Busca un token de verificación por su valor de string.
   * ¿Para qué? Procesar la verificación cuando el usuario hace clic en el enlace
   * del email.
   * ¿Impacto? Se debe verificar !used && !isExpired() antes de marcar el email
   * como verificado — un token encontrado no garantiza que sea válido.
   *
   * @param token El UUID del token recibido en la petición
   * @return Optional con el token si existe en BD
   */
  Optional<EmailVerificationToken> findByToken(String token);

  /**
   * ¿Qué? Elimina todos los tokens de verificación de un usuario.
   * ¿Para qué? Limpiar tokens anteriores antes de crear uno nuevo al reenviar
   * el email de verificación.
   * ¿Impacto? Sin limpieza, un usuario que solicite reenvío múltiples veces
   * acumula tokens — cualquiera de ellos podría activar la cuenta.
   *
   * @param user El usuario cuyos tokens de verificación se eliminan
   */
  void deleteByUser(User user);
}
