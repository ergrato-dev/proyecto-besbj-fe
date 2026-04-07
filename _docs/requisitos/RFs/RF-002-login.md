# RF-002 — Inicio de Sesión

**Historia de usuario relacionada**: HU-002

---

## Descripción

El sistema debe permitir a un usuario registrado y verificado iniciar sesión
con su email y contraseña. Si las credenciales son válidas, el backend
genera y devuelve un `access_token` (15 min) y un `refresh_token` (7 días).

---

## Reglas de Negocio

**RN-010** — El email debe tener un formato válido (`@Email`).

**RN-011** — El sistema busca el usuario por email (case-insensitive).
Si no existe, devuelve un mensaje genérico sin indicar que el email no existe.

**RN-012** — El sistema verifica la contraseña con `BCryptPasswordEncoder.matches()`.
Si no coincide, devuelve un mensaje genérico idéntico al de RN-011.

**RN-013** — Si `isEmailVerified == false`, el login es rechazado con mensaje
que indica que el usuario debe verificar su email.

**RN-014** — Si `isActive == false`, el login es rechazado con mensaje genérico.

**RN-015** — Tras login exitoso, el evento se registra en `AuditLogger`
(timestamp, user ID, IP del request).

**RN-016** — El endpoint tiene rate limiting de máximo 10 requests por IP
cada 15 minutos (Bucket4j). Pasado el límite: `429 Too Many Requests`.

---

## Inputs

### Request — `POST /api/v1/auth/login`

```json
{
  "email": "juan.perez@ejemplo.com",
  "password": "Segura123"
}
```

### DTO Java

```java
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
```

---

## Outputs

### 200 OK — Login exitoso

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

### 401 Unauthorized — Credenciales inválidas (email o password)

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales inválidas"
}
```

### 403 Forbidden — Email no verificado

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Debes verificar tu email antes de iniciar sesión"
}
```

### 429 Too Many Requests — Rate limit excedido

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Demasiados intentos. Intenta de nuevo en 15 minutos."
}
```
