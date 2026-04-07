# HU-005 — Recuperación de Contraseña

**Como** usuario que olvidó su contraseña,
**quiero** solicitar un email de recuperación y establecer una nueva contraseña,
**para** recuperar el acceso a mi cuenta sin necesidad de soporte manual.

---

## Criterios de Aceptación

### Paso 1 — Solicitar email de recuperación

**CA-005.1** — El formulario `ForgotPasswordPage` muestra un campo de email.

**CA-005.2** — Independientemente de si el email existe o no en el sistema, la respuesta
es siempre idéntica: "Si el email está registrado, recibirás un enlace de recuperación."
(protección anti-enumeration, OWASP A07).

**CA-005.3** — Si el email existe, se genera un token de reset único y se envía
por email un enlace con el formato: `{FRONTEND_URL}/reset-password?token={token}`.

**CA-005.4** — El token expira en **1 hora** y puede usarse una sola vez.

### Paso 2 — Restablecer la contraseña

**CA-005.5** — Al abrir el enlace, `ResetPasswordPage` lee el token de la URL
(`?token=...`) y muestra un formulario con dos campos: nueva contraseña
y confirmación.

**CA-005.6** — Si el token no existe, ha expirado o ya fue usado, el sistema
muestra un mensaje de error claro y sugiere solicitar un nuevo enlace.

**CA-005.7** — Tras restablecer la contraseña correctamente, el token queda
marcado como `used = true` y no puede reutilizarse.

**CA-005.8** — Tras el restablecimiento exitoso, el usuario es redirigido al login.

---

## Endpoints

- `POST /api/v1/auth/forgot-password` — Paso 1
- `POST /api/v1/auth/reset-password` — Paso 2

---

## Notas técnicas (Spring Boot)

### Paso 1
- Request: `ForgotPasswordRequest { email }`
- Token: UUID aleatorio almacenado en `password_reset_tokens` con `expires_at = now + 1h`
- Si el email no existe: responder con 200 y mensaje genérico (sin lanzar excepción)
- Email enviado vía `EmailService` → `JavaMailSender` / `MockMailSender`

### Paso 2
- Request: `ResetPasswordRequest { token, newPassword }`
- Verificar: token existe + `expires_at > now()` + `used == false`
- Hash nuevo password con `BCryptPasswordEncoder.encode()`
- Marcar token como `used = true`
- Respuesta: `MessageResponse { message: "Contraseña restablecida correctamente" }`

- Ver `_docs/referencia-tecnica/api-endpoints.md` → `POST /api/v1/auth/forgot-password`
  y `POST /api/v1/auth/reset-password`
