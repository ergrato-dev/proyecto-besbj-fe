/**
 * Archivo: RegisterRequest.java
 * Descripción: DTO de entrada para el endpoint POST /api/v1/auth/register.
 * ¿Para qué? Recibir y validar los datos del nuevo usuario antes de procesarlos.
 *            Bean Validation (@NotBlank, @Email, @Size) actúa como primera línea
 *            de defensa — equivalente a Pydantic en FastAPI.
 * ¿Impacto? Sin validación aquí, el servicio recibiría datos sucios (emails inválidos,
 *           contraseñas débiles) que podrían llegar a la BD o al encoder BCrypt.
 */
package com.nn.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * ¿Qué? Record Java (inmutable) con los campos necesarios para registrar un
 * usuario.
 * ¿Para qué? Los records de Java son ideales para DTOs — inmutables por
 * defecto,
 * generan equals/hashCode/toString automáticamente y son concisos.
 * ¿Impacto? Al ser inmutable, nadie puede modificar los datos de la petición
 * una vez creado el objeto — seguridad por diseño.
 *
 * @param email     Dirección de email — se usa como username en el sistema
 * @param firstName Nombre(s) del usuario — se almacena separado del apellido
 * @param lastName  Apellido(s) del usuario — permite ORDER BY en reportes
 * @param password  Contraseña en texto plano — se hashea con BCrypt en el
 *                  servicio
 */
public record RegisterRequest(

    /**
     * ¿Qué? Email del usuario — validado como email válido y no vacío.
     * ¿Para qué? Verificar formato antes de intentar insertar en la BD.
     * ¿Impacto? Sin @Email, strings como "no-es-un-email" pasarían a la BD
     * y la verificación de email enviaría a una dirección inválida.
     */
    @NotBlank(message = "El email es requerido") @Email(message = "Formato de email inválido") @Size(max = 255, message = "El email no puede superar 255 caracteres") String email,

    /**
     * ¿Qué? Nombre(s) del usuario — separado del apellido.
     * ¿Para qué? Almacenar como campo independiente permite filtrar y ordenar
     * por nombre en reportes sin parsing frágil.
     */
    @NotBlank(message = "El nombre es requerido") @Size(max = 150, message = "El nombre no puede superar 150 caracteres") String firstName,

    /**
     * ¿Qué? Apellido(s) del usuario — separado del nombre.
     * ¿Para qué? ORDER BY last_name en reportes nominales — imposible con fullName.
     */
    @NotBlank(message = "El apellido es requerido") @Size(max = 150, message = "El apellido no puede superar 150 caracteres") String lastName,

    /**
     * ¿Qué? Contraseña con requisitos mínimos de seguridad (OWASP A07).
     * ¿Para qué? Forzar contraseñas que resistan ataques de diccionario básicos.
     * ¿Impacto? Una contraseña como "abc" en BCrypt es técnicamente válida
     * pero trivialmente atacable — las reglas la rechazan antes de BCrypt.
     */
    @NotBlank(message = "La contraseña es requerida") @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") @Pattern(regexp = ".*[A-Z].*", message = "La contraseña debe contener al menos una letra mayúscula") @Pattern(regexp = ".*[a-z].*", message = "La contraseña debe contener al menos una letra minúscula") @Pattern(regexp = ".*\\d.*", message = "La contraseña debe contener al menos un número") String password

) {
}
