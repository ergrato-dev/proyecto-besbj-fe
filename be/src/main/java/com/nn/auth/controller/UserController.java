/**
 * Archivo: UserController.java
 * Descripción: Controller REST para el endpoint GET /api/v1/users/me.
 * ¿Para qué? Proveer al frontend los datos del usuario autenticado para mostrar
 *            en el dashboard o personalizando la interfaz.
 * ¿Impacto? Este endpoint requiere un JWT válido — si se llama sin token o con
 *           token expirado, Spring Security devuelve 401 automáticamente.
 */
package com.nn.auth.controller;

import com.nn.auth.dto.response.UserResponse;
import com.nn.auth.entity.User;
import com.nn.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ¿Qué? Controller para operaciones sobre el usuario autenticado.
 * ¿Para qué? Separar los endpoints de usuario de los de autenticación —
 * mantiene AuthController enfocado solo en auth.
 */
// Combina @Controller + @ResponseBody: respuestas directamente como JSON.
@RestController

// Prefijo de URL para todos los métodos de esta clase.
@RequestMapping("/api/v1/users")

// Lombok: genera el constructor con AuthService como parámetro.
@RequiredArgsConstructor

// Swagger: agrupa este endpoint bajo la sección "Usuarios" en Swagger UI.
@Tag(name = "Usuarios", description = "Endpoints para gestión del perfil del usuario autenticado")
public class UserController {

  private final AuthService authService;

  /**
   * ¿Qué? Retorna el perfil del usuario autenticado en el contexto actual.
   * ¿Para qué? El frontend lo usa al cargar el dashboard para mostrar el nombre
   * y email del usuario, y para saber si el email está verificado.
   * ¿Impacto? @AuthenticationPrincipal inyecta el User del SecurityContext —
   * es imposible que devuelva datos de otro usuario.
   * Si el token expiró, Spring Security devuelve 401 antes de llegar aquí.
   *
   * @param user Usuario autenticado inyectado desde el SecurityContext por Spring
   *             Security
   * @return UserResponse con datos públicos del usuario (sin hashedPassword)
   */
  // Mapea peticiones HTTP GET en /api/v1/users/me a este método.
  @GetMapping("/me")
  // Swagger: muestra el candado y exige el Bearer token para poder probar el
  // endpoint.
  @SecurityRequirement(name = "bearerAuth")
  // Documenta que este endpoint requiere autenticación y retorna el perfil del
  // usuario.
  @Operation(summary = "Obtener perfil del usuario autenticado", description = "Requiere autenticación. Retorna los datos públicos del usuario actual.")
  public UserResponse getProfile(
      @AuthenticationPrincipal // Inyecta el User del SecurityContext — garantizado por
                               // JwtAuthenticationFilter.
      User user) {
    // ¿Qué? Obtiene el perfil desde el servicio usando el email del usuario
    // autenticado.
    // ¿Para qué? Mantener la lógica en el servicio — el controller solo coordina.
    // ¿Impacto? Pasar user.getEmail() en lugar del user directamente permite que
    // el servicio recargue los datos frescos de la BD si fuera necesario.
    return authService.getProfile(user.getEmail());
  }
}
