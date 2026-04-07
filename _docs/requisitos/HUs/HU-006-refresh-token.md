# HU-006 — Renovación de Token (Refresh)

**Como** usuario con sesión activa cuyo `access_token` ha expirado,
**quiero** que el sistema renueve mi token automáticamente usando el `refresh_token`,
**para** mantener mi sesión sin tener que volver a iniciar sesión manualmente.

---

## Criterios de Aceptación

**CA-006.1** — Cuando el interceptor de Axios recibe un error `401` en una petición,
intenta automáticamente renovar el token antes de reintentar la petición original.

**CA-006.2** — La renovación se realiza enviando el `refresh_token` al endpoint
`POST /api/v1/auth/refresh`.

**CA-006.3** — Si el `refresh_token` es válido (no expirado, no manipulado), el servidor
responde con un nuevo `access_token` (15 minutos).

**CA-006.4** — Si el `refresh_token` ha expirado (después de 7 días) o es inválido,
el servidor responde con `401` y el usuario es redirigido al login.

**CA-006.5** — El nuevo `access_token` se almacena en el estado de la app React
y la petición original se reintenta automáticamente con el nuevo token.

**CA-006.6** — Las peticiones concurrentes que fallan simultáneamente con `401`
no generan múltiples intentos de refresh (se encolan y esperan el resultado del
primer refresh).

---

## Endpoint

`POST /api/v1/auth/refresh`

---

## Notas técnicas (Spring Boot)

- Request: `RefreshTokenRequest { refreshToken }`
- El backend verifica la firma y expiración del `refresh_token` con `JwtUtil`
- Si válido: genera nuevo `access_token` y lo devuelve
- Si expirado/inválido: responde `401 Unauthorized`
- El `refresh_token` en sí **no** se rota en esta versión inicial
  (puede mejorarse en una iteración futura)
- Respuesta: `TokenResponse { accessToken, refreshToken, tokenType: "Bearer" }`
- Ver `_docs/referencia-tecnica/api-endpoints.md` → `POST /api/v1/auth/refresh`
