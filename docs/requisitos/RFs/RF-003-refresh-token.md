# RF-003 — Renovación de Token (Refresh)

**Historia de usuario relacionada**: HU-006

---

## Descripción

El sistema debe permitir renovar el `access_token` usando un `refresh_token`
válido, sin requerir que el usuario vuelva a ingresar sus credenciales.

---

## Reglas de Negocio

**RN-017** — El `refresh_token` debe ser un JWT válido firmado con el secret
del sistema.

**RN-018** — Si el `refresh_token` ha expirado (después de 7 días), el sistema
devuelve `401` y el usuario debe volver a hacer login.

**RN-019** — Si el `refresh_token` es inválido o manipulado, el sistema
devuelve `401`.

**RN-020** — Al recibir un `refresh_token` válido, el sistema genera y devuelve
un nuevo `access_token` con expiración de 15 minutos.

---

## Inputs

### Request — `POST /api/v1/auth/refresh`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Outputs

### 200 OK — Token renovado

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

### 401 Unauthorized — Token expirado o inválido

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token de refresco inválido o expirado"
}
```
