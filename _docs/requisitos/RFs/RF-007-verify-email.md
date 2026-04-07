# RF-007 — Verificación de Email

**Historia de usuario relacionada**: HU-001

---

## Descripción

El sistema debe permitir a un usuario confirmar su dirección de email
haciendo clic en el enlace enviado tras el registro. Sin esta verificación,
el usuario no puede iniciar sesión.

---

## Reglas de Negocio

**RN-038** — El token debe existir en la tabla `email_verification_tokens`.

**RN-039** — El token no debe haber expirado (`expiresAt > now()`).
Los tokens de verificación expiran a las 24 horas.

**RN-040** — El token no debe haber sido usado previamente (`used == false`).

**RN-041** — Si el token es válido, el usuario asociado se actualiza con
`isEmailVerified = true`.

**RN-042** — Tras la verificación exitosa, el token se marca como `used = true`.

**RN-043** — Si el token ha expirado, el sistema indica al usuario que solicite
un nuevo email de verificación (enlace para reenviar, no implementado en fase 1).

---

## Inputs

### Request — `POST /api/v1/auth/verify-email`

```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

El token se extrae de la URL: `/verify-email?token=a1b2c3d4-...`
y el frontend lo envía al backend via este endpoint.

---

## Outputs

### 200 OK — Email verificado

```json
{
  "message": "Email verificado correctamente. Ya puedes iniciar sesión."
}
```

### 400 Bad Request — Token inválido, expirado o ya usado

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El enlace de verificación ha expirado o ya fue utilizado."
}
```
