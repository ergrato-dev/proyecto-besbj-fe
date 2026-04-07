# RF-001 — Registro de Usuario

**Historia de usuario relacionada**: HU-001

---

## Descripción

El sistema debe permitir a un visitante crear una cuenta proporcionando nombre
completo, email y contraseña. El backend valida los datos con Bean Validation,
hashea la contraseña con BCrypt, genera un token de verificación de email y
envía el email de confirmación antes de retornar la respuesta.

---

## Reglas de Negocio

**RN-001** — El email debe tener un formato válido según RFC 5322
(`@Email` de Jakarta Bean Validation).

**RN-002** — El email no puede estar ya registrado en la tabla `users`
(verificación case-insensitive con `existsByEmailIgnoreCase`).

**RN-003** — La contraseña debe tener mínimo 8 caracteres.

**RN-004** — La contraseña debe contener al menos una letra mayúscula.

**RN-005** — La contraseña debe contener al menos una letra minúscula.

**RN-006** — La contraseña debe contener al menos un número.

**RN-007** — La contraseña **nunca** se almacena en texto plano.
Siempre se hashea con `BCryptPasswordEncoder` (factor de costo mínimo 10).

**RN-008** — El usuario se crea con `isEmailVerified = false` y `isActive = true`.

**RN-009** — Se genera un `EmailVerificationToken` con UUID aleatorio y
`expiresAt = now() + 24 horas`.

---

## Inputs

### Request — `POST /api/v1/auth/register`

```json
{
  "email": "juan.perez@ejemplo.com",
  "fullName": "Juan Pérez",
  "password": "Segura123"
}
```

### DTO Java

```java
public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 2, max = 100) String fullName,
    @NotBlank @Size(min = 8)
    @Pattern(regexp = ".*[A-Z].*")
    @Pattern(regexp = ".*[a-z].*")
    @Pattern(regexp = ".*\\d.*") String password
) {}
```

---

## Outputs

### 201 Created — Registro exitoso

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "juan.perez@ejemplo.com",
  "fullName": "Juan Pérez",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2026-03-15T10:30:00Z"
}
```

### 400 Bad Request — Email ya registrado

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El email ya está registrado"
}
```

### 422 Unprocessable Entity — Validación Bean Validation

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 422,
  "errors": {
    "email": "Formato de email inválido",
    "password": "Debe contener al menos una mayúscula"
  }
}
```
