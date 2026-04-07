/**
 * Archivo: ApplicationConfig.java
 * Descripción: Beans globales de configuración para la aplicación NN Auth System.
 * ¿Para qué? Centralizar la creación de beans reutilizables (BCryptPasswordEncoder)
 *            que otros componentes inyectarán vía constructor.
 * ¿Impacto? Si BCryptPasswordEncoder no está definido como bean, Spring Security
 *            no podrá hashear ni comparar contraseñas, bloqueando el login y registro.
 */
package com.nn.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

  /**
   * ¿Qué? Crea un BCryptPasswordEncoder con factor de trabajo por defecto (10).
   * ¿Para qué? Hashear contraseñas antes de almacenarlas y verificarlas en el
   * login.
   * ¿Impacto? BCrypt con factor 10 es resistente a ataques de fuerza bruta.
   * NUNCA almacenar contraseñas en texto plano.
   *
   * @return PasswordEncoder configurado con BCrypt
   */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
