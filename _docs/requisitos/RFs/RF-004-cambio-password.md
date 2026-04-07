# RF-004 — Cambio de Contraseña

**Historia de usuario relacionada**: HU-004

---

## Descripción

El sistema debe permitir a un usuario autenticado cambiar su contraseña
proporcionando la contraseña actual y la nueva. El endpoint requiere
un `access_token` válido en el header.

---

## Reglas de Negocio

**RN-021** — El endpoint requiere autenticación: `Authorization: Bearer <access_token>`.

**RN-022** — La contraseña actual se verifica con `BCryptPasswordEncoder.matches()`.
Si no coincide, se devuelve error genérico.

**RN-023** — La nueva contraseña debe cumplir los mismos criterios que el registro:
≥8 chars, 1 mayúscula, 1 minúscula, 1 número.

**RN-024** — La nueva contraseña se hashea con BCrypt antes de persistirse.

**RN-025** — El evento se registra en `AuditLogger` con timestamp y user ID.

---

## Inputs

### Request — `POST /api/v1/auth/change-password`

Header: `Authorization: Bearer <access_token>`

```json
{
  "currentPassword": "Segura123",
  "newPassword": "NuevaSegura456"
}
```

---

## Outputs

### 200 OK

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

### 400 Bad Request — Contraseña actual incorrecta

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "La contraseña actual es incorrecta"
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
