# HU-001 — Registro de Usuario

**Como** visitante del sistema,
**quiero** registrarme con mi nombre, email y contraseña,
**para** crear una cuenta y poder acceder al sistema NN Auth.

---

## Criterios de Aceptación

**CA-001.1** — El formulario de registro muestra campos para nombre completo, email y contraseña.

**CA-001.2** — El sistema valida que el email tenga formato válido antes de enviar la solicitud.

**CA-001.3** — El sistema valida que la contraseña tenga al menos 8 caracteres, una mayúscula,
una minúscula y un número.

**CA-001.4** — Si el email ya está registrado, el sistema muestra un mensaje de error genérico
que no revela si el email existe (protección OWASP A07).

**CA-001.5** — Al registrarse correctamente, el sistema envía un email de verificación y
muestra un mensaje indicando que el usuario debe confirmar su email.

**CA-001.6** — La cuenta creada tiene el estado `is_email_verified = false` hasta que
el usuario confirme su email.

**CA-001.7** — La contraseña se almacena como hash BCrypt — nunca en texto plano.

**CA-001.8** — Tras el registro exitoso, el usuario es redirigido a una página que
indica "Revisa tu email para verificar tu cuenta".

---

## Endpoint

`POST /api/v1/auth/register`

---

## Notas técnicas (Spring Boot)

- Validación con `@Valid` + Bean Validation sobre `RegisterRequest` (Java record)
- Hash con `BCryptPasswordEncoder.encode(password)`
- Token de verificación: UUID aleatorio, expira en 24 horas
- Email enviado vía `JavaMailSender` (perfil docker) o `MockMailSender` (perfil noDocker)
- Respuesta: `UserResponse` (sin `hashedPassword`)
- Ver `docs/referencia-tecnica/api-endpoints.md` → `POST /api/v1/auth/register`
