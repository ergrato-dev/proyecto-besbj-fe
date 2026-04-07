# RF-006 — Restablecimiento de Contraseña

**Historia de usuario relacionada**: HU-005

---

## Descripción

El sistema debe permitir a un usuario establecer una nueva contraseña
usando el token de recuperación recibido por email.

---

## Reglas de Negocio

**RN-032** — El token debe existir en la tabla `password_reset_tokens`.

**RN-033** — El token no debe haber expirado (`expiresAt > now()`).

**RN-034** — El token no debe haber sido usado previamente (`used == false`).

**RN-035** — La nueva contraseña debe cumplir los criterios de validación:
≥8 chars, 1 mayúscula, 1 minúscula, 1 número.

**RN-036** — Si el token es válido, la contraseña del usuario se actualiza
con el hash BCrypt de la nueva contraseña.

**RN-037** — Tras el restablecimiento exitoso, el token se marca como
`used = true` (no puede reutilizarse).

---

## Inputs

### Request — `POST /api/v1/auth/reset-password`

```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newPassword": "NuevaSegura456"
}
```

---

## Outputs

### 200 OK — Contraseña restablecida

```json
{
  "message": "Contraseña restablecida correctamente. Ya puedes iniciar sesión."
}
```

### 400 Bad Request — Token inválido, expirado o ya usado

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo."
}
```

### 422 Unprocessable Entity — Validación de contraseña

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 422,
  "errors": {
    "newPassword": "Debe contener al menos una mayúscula"
  }
}
```
