/**
 * Archivo: NnAuthSystemApplication.java
 * Descripción: Punto de entrada de la aplicación NN Auth System.
 * ¿Para qué? Inicializar el contexto de Spring Boot y arrancar el servidor embebido Tomcat.
 * ¿Impacto? Es la clase raíz que dispara todo el escaneo de componentes (@Component,
 *            @Service, @Repository, @Controller) — sin ella no arranca nada.
 */
package com.nn.auth;

import com.nn.auth.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

// Combina tres anotaciones en una:
//   @Configuration      → esta clase puede definir beans
//   @EnableAutoConfiguration → Spring Boot configura automáticamente todo lo que detecta en el classpath
//   @ComponentScan      → escanea este paquete (y sub-paquetes) para registrar @Component, @Service, @Repository, @Controller
// Sin @SpringBootApplication no arranca nada — es el punto de entrada de todo.
@SpringBootApplication

// Activa el mapeo de properties del application.yml a la clase AppProperties.
// Sin esta línea, Spring Boot ignora @ConfigurationProperties y ningún valor
// del .yml se inyectaría en AppProperties — la app fallaría al arrancar.
@EnableConfigurationProperties(AppProperties.class)

// Activa el soporte de métodos asíncronos (@Async) en toda la aplicación.
// Sin esta anotación, los métodos marcados con @Async (ej: EmailService)
// se ejecutarían de forma SÍNCRONA en el mismo hilo — sin hilo separado.
@EnableAsync
public class NnAuthSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(NnAuthSystemApplication.class, args);
	}
}
