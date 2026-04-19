# RF-008 — Obtener Perfil del Usuario Autenticado

**Historia de usuario relacionada**: HU-003

---

## Descripción

El sistema debe devolver los datos del usuario autenticado actualmente.
El endpoint requiere un `access_token` válido en el header de la petición.

---

## Reglas de Negocio

**RN-044** — El endpoint requiere autenticación: `Authorization: Bearer <access_token>`.

**RN-045** — El `JwtAuthenticationFilter` extrae el email del token y carga
el usuario desde la BD para colocarlo en el `SecurityContext`.

**RN-046** — Si el `access_token` está ausente, expirado o es inválido,
el sistema devuelve `401 Unauthorized`.

**RN-047** — La respuesta **nunca** incluye el campo `hashedPassword`.

**RN-048** — Si el usuario fue eliminado de la BD pero el token aún es válido,
el sistema devuelve `401 Unauthorized` (el filtro verifica en BD).

---

## Inputs

### Request — `GET /api/v1/users/me`

Header: `Authorization: Bearer <access_token>`

Body: (vacío)

---

## Outputs

### 200 OK — Perfil del usuario

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "juan.perez@ejemplo.com",
  "fullName": "Juan Pérez",
  "isActive": true,
  "isEmailVerified": true,
  "createdAt": "2026-03-15T10:30:00Z"
}
```

### 401 Unauthorized — Token ausente o inválido

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token de acceso inválido o expirado"
}
```
