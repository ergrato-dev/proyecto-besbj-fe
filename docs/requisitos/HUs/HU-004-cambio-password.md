# HU-004 — Cambio de Contraseña

**Como** usuario autenticado,
**quiero** cambiar mi contraseña proporcionando la contraseña actual y la nueva,
**para** actualizar mis credenciales de acceso sin perder mi sesión activa.

---

## Criterios de Aceptación

**CA-004.1** — El formulario muestra tres campos: contraseña actual, nueva contraseña
y confirmación de la nueva contraseña.

**CA-004.2** — El sistema verifica que la contraseña actual sea correcta antes de
permitir el cambio.

**CA-004.3** — Si la contraseña actual es incorrecta, muestra un mensaje de error
sin indicar la razón específica (protección anti-enumeration).

**CA-004.4** — La nueva contraseña debe cumplir los mismos criterios de validación:
≥8 caracteres, 1 mayúscula, 1 minúscula, 1 número.

**CA-004.5** — Si la nueva contraseña y su confirmación no coinciden, el error se
muestra en el frontend antes de enviar la petición (validación client-side).

**CA-004.6** — Tras el cambio exitoso, el sistema muestra un mensaje de confirmación.

**CA-004.7** — La nueva contraseña se almacena como hash BCrypt — nunca en texto plano.

**CA-004.8** — El endpoint requiere autenticación (`Authorization: Bearer <token>`).

---

## Endpoint

`POST /api/v1/auth/change-password`

---

## Notas técnicas (Spring Boot)

- Request: `ChangePasswordRequest { currentPassword, newPassword }`
- Autenticación: `JwtAuthenticationFilter` extrae el usuario del token → `SecurityContext`
- Verificar `currentPassword` con `BCryptPasswordEncoder.matches()`
- Hash de `newPassword` con `BCryptPasswordEncoder.encode()`
- Registrar evento en `AuditLogger`
- Respuesta: `MessageResponse { message: "Contraseña actualizada correctamente" }`
- Ver `docs/referencia-tecnica/api-endpoints.md` → `POST /api/v1/auth/change-password`
