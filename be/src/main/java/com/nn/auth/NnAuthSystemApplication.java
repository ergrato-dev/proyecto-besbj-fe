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

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class NnAuthSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(NnAuthSystemApplication.class, args);
	}
}
