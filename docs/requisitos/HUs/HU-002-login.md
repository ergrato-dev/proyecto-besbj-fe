# HU-002 — Inicio de Sesión

**Como** usuario registrado con email verificado,
**quiero** iniciar sesión con mi email y contraseña,
**para** obtener acceso a las funcionalidades protegidas del sistema.

---

## Criterios de Aceptación

**CA-002.1** — El formulario de login muestra campos para email y contraseña.

**CA-002.2** — Si el email o la contraseña son incorrectos, el sistema muestra
un mensaje genérico ("Credenciales inválidas") sin indicar cuál de los dos falló.

**CA-002.3** — Si el usuario no ha verificado su email, el login es rechazado con
un mensaje que indica que debe verificar su cuenta.

**CA-002.4** — Si el usuario está inactivo (`is_active = false`), el login es
rechazado con un mensaje genérico.

**CA-002.5** — Tras un login exitoso, el sistema devuelve un `access_token`
(duración 15 minutos) y un `refresh_token` (duración 7 días).

**CA-002.6** — Tras un login exitoso, el usuario es redirigido al Dashboard.

**CA-002.7** — Los tokens son almacenados en el estado de la aplicación React
(no en `localStorage` — ver seguridad).

**CA-002.8** — El endpoint tiene rate limiting: máximo 10 intentos por IP cada 15 minutos
(protección anti brute-force via Bucket4j).

---

## Endpoint

`POST /api/v1/auth/login`

---

## Notas técnicas (Spring Boot)

- Validación de credenciales con `BCryptPasswordEncoder.matches(plain, hash)`
- Verificar `isEmailVerified == true` y `isActive == true` antes de generar tokens
- Tokens generados con `JwtUtil.generateAccessToken()` y `JwtUtil.generateRefreshToken()`
- Rate limiting configurado con Bucket4j en `AuthController` via AOP
- Respuesta: `TokenResponse { accessToken, refreshToken, tokenType: "Bearer" }`
- Ver `docs/referencia-tecnica/api-endpoints.md` → `POST /api/v1/auth/login`
