/**
 * Archivo: TestcontainersConfig.java
 * Descripción: Configuración compartida de Testcontainers para todos los tests de integración.
 * ¿Para qué? Centralizar la definición del contenedor PostgreSQL efímero para que
 *            todos los tests de integración compartan el mismo contenedor —
 *            más eficiente que levantar uno por clase de test.
 * ¿Impacto? Con @ServiceConnection Spring Boot conecta automáticamente la datasource
 *           al contenedor sin necesidad de @DynamicPropertySource manual —
 *           más limpio y menos propenso a errores de configuración.
 */
package com.nn.auth;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * ¿Qué? Configuración de test que define el contenedor PostgreSQL para
 * Testcontainers.
 * ¿Para qué? @TestConfiguration crea beans SOLO en el contexto de tests — no
 * afecta
 * a la aplicación en producción/desarrollo.
 * ¿Impacto? @ServiceConnection + PostgreSQLContainer hace que Spring Boot
 * autoconfigure
 * la datasource apuntando al puerto aleatorio del contenedor efímero —
 * los tests de integración usan una BD real sin tocar la de desarrollo.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

  /**
   * ¿Qué? Define el contenedor PostgreSQL 17 que Testcontainers levanta antes
   * de los tests y destruye al terminar.
   * ¿Para qué? Proveer una BD real para tests de integración — sin mocks,
   * JPA y Flyway se ejecutan contra PostgreSQL real.
   * ¿Impacto? El contenedor se reutiliza entre tests de la misma JVM (singleton)
   * para evitar el overhead de levantar un contenedor por test.
   *
   * @return PostgreSQLContainer configurado con imagen oficial postgres:17-alpine
   */
  @Bean
  @ServiceConnection
  PostgreSQLContainer<?> postgresContainer() {
    return new PostgreSQLContainer<>(DockerImageName.parse("postgres:17-alpine"))
        .withDatabaseName("nn_auth_test_db")
        .withUsername("test_user")
        .withPassword("test_password")
        // Reusar el contenedor entre tests de la misma JVM — más rápido
        .withReuse(true);
  }
}
