/**
 * Archivo: api/auth.ts
 * Descripción: Funciones para llamar cada endpoint de autenticación del backend.
 * ¿Para qué? Encapsular cada petición HTTP en una función tipada y reutilizable.
 *            Los componentes React llaman estas funciones en lugar de usar
 *            axios directamente — separa la lógica HTTP de la lógica UI.
 * ¿Impacto? Si cambia un endpoint del backend (ruta, método, body),
 *           solo se actualiza la función aquí, no en cada componente que la usa.
 */
import type {
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UserResponse,
  TokenResponse,
  MessageResponse,
} from "../types/auth";
import apiClient from "./axios";

/**
 * ¿Qué? Extrae el mensaje de error de una respuesta de Axios.
 * ¿Para qué? El backend devuelve { message: "..." } en errores — este helper
 *            lo extrae para mostrar al usuario. Si no hay mensaje del backend,
 *            devuelve un mensaje genérico (no revelar detalles internos).
 * ¿Impacto? Sin esto, el usuario vería "Request failed with status code 400"
 *           de Axios en lugar de "El email ya está registrado".
 */
export function extractErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message
  ) {
    return String(
      (error as { response: { data: { message: string } } }).response.data
        .message,
    );
  }
  return "Ha ocurrido un error inesperado. Intenta de nuevo.";
}

/* ------------------------------------------------------------------ */
/* Endpoints públicos — no requieren Authorization header              */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Registra un nuevo usuario en el sistema.
 * ¿Para qué? Permite crear una cuenta con email, nombre y contraseña.
 * ¿Impacto? El backend hashea la contraseña y envía un email de verificación.
 *           El usuario NO puede hacer login hasta verificar su email.
 */
export async function registerUser(
  data: RegisterRequest,
): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>(
    "/api/v1/auth/register",
    data,
  );
  return response.data;
}

/**
 * ¿Qué? Autentica al usuario con email y contraseña.
 * ¿Para qué? Validar credenciales y obtener los tokens JWT para sesiones futuras.
 * ¿Impacto? Devuelve accessToken (15 min) y refreshToken (7 días).
 *           El accessToken va en memoria, el refreshToken en localStorage.
 */
export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/api/v1/auth/login",
    data,
  );
  return response.data;
}

/**
 * ¿Qué? Obtiene un nuevo accessToken usando el refreshToken.
 * ¿Para qué? El accessToken dura 15 min. Cuando expira, en lugar de pedir
 *            al usuario que vuelva a hacer login, se usa el refreshToken
 *            (7 días) para obtener uno nuevo silenciosamente.
 * ¿Impacto? Si el refreshToken también expiró, el backend devuelve 401
 *           y el usuario debe hacer login de nuevo — comportamiento correcto.
 */
export async function refreshAccessToken(
  data: RefreshRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/api/v1/auth/refresh",
    data,
  );
  return response.data;
}

/**
 * ¿Qué? Solicita el envío del email de recuperación de contraseña.
 * ¿Para qué? Cuando el usuario olvidó su contraseña, inicia el flujo
 *            de recuperación por email.
 * ¿Impacto? SIEMPRE devuelve 200 con el mismo mensaje, exista o no el email.
 *           Esto evita el "enumeration attack" — un atacante no puede saber
 *           qué emails están registrados probando este endpoint.
 */
export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>(
    "/api/v1/auth/forgot-password",
    data,
  );
  return response.data;
}

/**
 * ¿Qué? Establece la nueva contraseña usando el token del email de recuperación.
 * ¿Para qué? Completa el flujo de recuperación — el token valida que el usuario
 *            controla el email y que la solicitud no expiró (válido 1 hora).
 * ¿Impacto? El token se marca como "usado" en el backend — no se puede reutilizar.
 */
export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>(
    "/api/v1/auth/reset-password",
    data,
  );
  return response.data;
}

/**
 * ¿Qué? Verifica la dirección de email usando el token del email de bienvenida.
 * ¿Para qué? Confirma que el usuario es dueño del email con el que se registró.
 * ¿Impacto? Hasta verificar el email, el usuario no puede hacer login.
 *           Esto previene el registro con emails ajenos.
 */
export async function verifyEmail(
  data: VerifyEmailRequest,
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>(
    "/api/v1/auth/verify-email",
    data,
  );
  return response.data;
}

/* ------------------------------------------------------------------ */
/* Endpoints protegidos — requieren Authorization: Bearer <accessToken> */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Obtiene el perfil del usuario actualmente autenticado.
 * ¿Para qué? Cargar los datos del usuario para mostrarlos en el Dashboard.
 *            El interceptor de Axios agrega el header Authorization automáticamente.
 * ¿Impacto? Si el accessToken expiró, el backend devuelve 401.
 *           AuthContext detecta esto y usa el refreshToken para renovarlo.
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/api/v1/users/me");
  return response.data;
}

/**
 * ¿Qué? Cambia la contraseña del usuario autenticado.
 * ¿Para qué? Permite al usuario actualizar su contraseña cuando ya sabe la actual.
 *            Es diferente al reset-password (que usa un token por email).
 * ¿Impacto? El backend verifica que currentPassword coincida con el hash almacenado
 *           antes de cambiarla. Requiere estar autenticado (Authorization header).
 */
export async function changePassword(
  data: ChangePasswordRequest,
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>(
    "/api/v1/auth/change-password",
    data,
  );
  return response.data;
}
