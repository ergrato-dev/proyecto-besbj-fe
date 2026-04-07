# HU-003 — Ver Perfil de Usuario

**Como** usuario autenticado,
**quiero** ver mi información de perfil (nombre, email, estado),
**para** confirmar que mis datos están almacenados correctamente en el sistema.

---

## Criterios de Aceptación

**CA-003.1** — El Dashboard muestra el nombre completo y el email del usuario autenticado.

**CA-003.2** — El Dashboard muestra el estado de verificación del email
(`Verificado` / `No verificado`).

**CA-003.3** — Si el `access_token` ha expirado, el interceptor de Axios intenta
renovarlo automáticamente usando el `refresh_token` antes de redirigir al login.

**CA-003.4** — Si el usuario no está autenticado e intenta acceder al Dashboard
directamente por URL, es redirigido a `/login` (Route Guard).

**CA-003.5** — La respuesta del servidor **nunca** incluye el campo `hashedPassword`.

**CA-003.6** — El Dashboard muestra la fecha de creación de la cuenta en formato legible.

---

## Endpoint

`GET /api/v1/users/me`

---

## Notas técnicas (Spring Boot)

- Endpoint protegido por `JwtAuthenticationFilter` (OncePerRequestFilter)
- El filtro extrae el email del JWT y lo carga en el `SecurityContext`
- El controller usa `@AuthenticationPrincipal` o extrae del contexto de seguridad
- Respuesta: `UserResponse` (sin `hashedPassword`)
- Ver `_docs/referencia-tecnica/api-endpoints.md` → `GET /api/v1/users/me`
