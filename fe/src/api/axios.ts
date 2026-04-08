/**
 * Archivo: api/axios.ts
 * Descripción: Instancia de Axios con interceptores JWT para comunicarse con el backend.
 * ¿Para qué? Centralizar la configuración HTTP — base URL, headers, manejo de tokens.
 *            Sin esto, cada llamada tendría que repetir la URL base y el header de auth.
 * ¿Impacto? Es el punto único de comunicación con la API. Un error aquí afecta
 *           todas las peticiones de la aplicación.
 */
import axios, { type AxiosInstance } from "axios";

/* ------------------------------------------------------------------ */
/* Token store — variable de módulo accesible por el interceptor       */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Variable de módulo que guarda el access token en memoria.
 * ¿Para qué? El interceptor de Axios necesita el token sin importar AuthContext
 *            (evita dependencias circulares entre context y api).
 * ¿Impacto? Al ser una variable de módulo (no React state), NO causa re-renders.
 *           Se reinicia a null al recargar la página — eso es correcto, ya que
 *           el access token es de corta duración y se renueva con el refresh token.
 */
let _accessToken: string | null = null;

/**
 * ¿Qué? Actualiza el token en memoria desde AuthContext.
 * ¿Para qué? Permite que AuthContext informe al interceptor qué token usar
 *            sin que el interceptor tenga que importar AuthContext (evita ciclos).
 */
export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

/**
 * ¿Qué? Devuelve el access token actual desde memoria.
 * ¿Para qué? AuthContext puede verificar si ya hay un token activo sin
 *            depender del estado React en el momento de inicialización.
 */
export function getAccessToken(): string | null {
  return _accessToken;
}

/* ------------------------------------------------------------------ */
/* Instancia de Axios                                                   */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Instancia de Axios preconfigurada con la URL base del backend.
 * ¿Para qué? Todas las funciones de api/auth.ts usan esta instancia,
 *            así no tienen que repetir la URL base ni los headers.
 * ¿Impacto? Si cambia la URL del backend, solo se cambia aquí (y en .env).
 *
 * import.meta.env.VITE_API_BASE_URL — variable de entorno de Vite.
 * Las variables VITE_* se inyectan en el bundle en tiempo de build.
 * NUNCA usar variables sin prefijo VITE_ — Vite no las expone al frontend
 * por seguridad (evita filtrar secrets del servidor).
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: evita que peticiones colgadas bloqueen la UI indefinidamente
  timeout: 10_000,
});

/* ------------------------------------------------------------------ */
/* Interceptor de request — adjunta el JWT en cada petición            */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Interceptor que agrega el header Authorization antes de cada petición.
 * ¿Para qué? Sin este interceptor, cada función de auth.ts tendría que
 *            agregar manualmente el header — código duplicado en todas partes.
 * ¿Impacto? Si _accessToken es null, la petición se envía sin Authorization.
 *           El backend responderá 401. Los endpoints públicos (login, register)
 *           no necesitan el token, así que esto es correcto.
 */
apiClient.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      // Bearer es el esquema estándar de autenticación JWT (RFC 6750)
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
