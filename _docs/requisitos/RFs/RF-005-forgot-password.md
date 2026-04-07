# RF-005 — Recuperación de Contraseña (Solicitud)

**Historia de usuario relacionada**: HU-005

---

## Descripción

El sistema debe permitir a un usuario solicitar un email para recuperar su
contraseña. La respuesta es siempre idéntica independientemente de si el
email existe o no (protección anti-enumeration).

---

## Reglas de Negocio

**RN-026** — El email debe tener formato válido (`@Email`).

**RN-027** — La respuesta HTTP es siempre `200 OK` con el mismo mensaje,
independientemente de si el email existe en la BD.

**RN-028** — Si el email existe, se genera un `PasswordResetToken` con
UUID aleatorio y `expiresAt = now() + 1 hora`.

**RN-029** — Si ya existe un token de reset previo para el mismo usuario,
el token anterior sigue válido hasta su expiración (no se invalida).

**RN-030** — El email enviado contiene un enlace:
`{FRONTEND_URL}/reset-password?token={uuid}`

**RN-031** — El endpoint tiene rate limiting (Bucket4j) para prevenir abuso.

---

## Inputs

### Request — `POST /api/v1/auth/forgot-password`

```json
{
  "email": "juan.perez@ejemplo.com"
}
```

---

## Outputs

### 200 OK — Siempre (independiente de si el email existe)

```json
{
  "message": "Si el email está registrado, recibirás un enlace de recuperación en los próximos minutos."
}
```
