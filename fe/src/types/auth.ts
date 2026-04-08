/**
 * Archivo: types/auth.ts
 * Descripción: Tipos TypeScript para todas las peticiones y respuestas de la API de auth.
 * ¿Para qué? Dar forma a los datos que viajan entre el frontend y el backend.
 *            Equivale a los schemas de Pydantic en FastAPI — definen el "contrato" de la API.
 * ¿Impacto? Sin tipos, TypeScript no puede detectar errores de propiedad o de tipo
 *           en tiempo de compilación, y los errores aparecen en runtime (más difíciles de depurar).
 */

/* ------------------------------------------------------------------ */
/* Requests — datos que el frontend envía al backend                   */
/* ------------------------------------------------------------------ */

/**
 * Datos para registrar un nuevo usuario.
 * Debe coincidir con RegisterRequest.java en el backend.
 */
export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Datos para iniciar sesión.
 * Debe coincidir con LoginRequest.java en el backend.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Datos para cambiar la contraseña de un usuario autenticado.
 * Requiere Authorization: Bearer <accessToken>.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Datos para solicitar el email de recuperación de contraseña.
 * El backend siempre responde igual, exista o no el email (seguridad).
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Datos para establecer la nueva contraseña con el token del email.
 * El token viene de la URL: /reset-password?token=...
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Datos para verificar la dirección de email después del registro.
 * El token viene de la URL: /verify-email?token=...
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Datos para renovar el access token usando el refresh token.
 * El refresh token se almacena en localStorage y dura 7 días.
 */
export interface RefreshRequest {
  refreshToken: string;
}

/* ------------------------------------------------------------------ */
/* Responses — datos que el backend devuelve al frontend               */
/* ------------------------------------------------------------------ */

/**
 * Datos del usuario autenticado.
 * hashed_password NUNCA se incluye en la respuesta (buena práctica de seguridad).
 * Debe coincidir con UserResponse.java en el backend.
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: string; // ISO 8601 — ej: "2026-04-07T10:00:00Z"
}

/**
 * Tokens devueltos después de login o refresh exitoso.
 * accessToken: duración 15 min — se guarda en memoria (React state).
 * refreshToken: duración 7 días — se guarda en localStorage.
 * tokenType: siempre "Bearer" — indica cómo enviar el token en el header.
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/**
 * Respuesta genérica para operaciones que solo necesitan confirmar éxito.
 * Ej: forgot-password, change-password, verify-email.
 */
export interface MessageResponse {
  message: string;
}

/**
 * Estructura del error que devuelve el GlobalExceptionHandler del backend.
 * ¿Para qué? Extraer el mensaje legible para mostrar al usuario.
 * ¿Impacto? Si el backend cambia esta estructura, hay que actualizar este tipo.
 */
export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
