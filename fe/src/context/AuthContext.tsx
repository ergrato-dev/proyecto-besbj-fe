/**
 * Archivo: context/AuthContext.tsx
 * Descripción: Contexto de React que gestiona el estado de autenticación global.
 * ¿Para qué? Proveer a toda la aplicación acceso al usuario autenticado,
 *            a los tokens JWT y a las acciones de auth (login, logout, register).
 * ¿Impacto? Sin este contexto, cada componente tendría que reimplementar
 *           la lógica de auth, causando duplicación de código e inconsistencias.
 *           Con él, un componente en cualquier nivel del árbol puede saber
 *           si el usuario está autenticado con solo llamar useAuth().
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  refreshAccessToken,
  extractErrorMessage,
} from "../api/auth";
import { setAccessToken } from "../api/axios";
import type {
  UserResponse,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "../types/auth";

/* ------------------------------------------------------------------ */
/* Clave para localStorage — namespaced para evitar colisiones         */
/* ------------------------------------------------------------------ */

/**
 * La clave bajo la que se guarda el refresh token en localStorage.
 * localStorage es persistente entre recargas de página.
 * NOTA de seguridad: en producción se prefieren httpOnly cookies para el
 * refresh token, que JavaScript no puede leer (protección XSS).
 * Para este proyecto educativo, localStorage es suficiente.
 */
const REFRESH_TOKEN_KEY = "nn-auth-refresh-token";

/* ------------------------------------------------------------------ */
/* Tipo del contexto                                                    */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Define qué datos y acciones expone el AuthContext.
 * ¿Para qué? TypeScript verifica en compile time que los consumidores del
 *            contexto usen correctamente las funciones y los tipos.
 */
export interface AuthContextType {
  /** Usuario autenticado, o null si no hay sesión activa */
  user: UserResponse | null;
  /** true mientras se verifica el token al cargar la app */
  isLoading: boolean;
  /** true si hay un usuario autenticado */
  isAuthenticated: boolean;
  /** Inicia sesión. Lanza Error si las credenciales son incorrectas. */
  login: (data: LoginRequest) => Promise<void>;
  /** Registra un nuevo usuario. Devuelve los datos del usuario creado. */
  register: (data: RegisterRequest) => Promise<UserResponse>;
  /** Cierra la sesión y limpia todos los tokens. */
  logout: () => void;
}

/* ------------------------------------------------------------------ */
/* Creación del contexto                                               */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Instancia del contexto de React con valor inicial undefined.
 * ¿Para qué? undefined como valor inicial fuerza a usar el hook useAuth()
 *            que lanza un error claro si se usa fuera del AuthProvider,
 *            en lugar de fallar silenciosamente con valores vacíos.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/* Provider — envuelve la app y provee el contexto                     */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Componente proveedor que envuelve la app y mantiene el estado de auth.
 * ¿Para qué? Todo componente hijo puede acceder al estado de auth sin prop drilling.
 *            Prop drilling = pasar props manualmente por muchos niveles de componentes.
 * ¿Impacto? Debe estar en el nivel más alto del árbol de componentes (en App.tsx)
 *           para que ProtectedRoute y Navbar puedan consumir el contexto.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ------------------------------------------------------------------ */
  /* Auto-refresh al montar — restaurar sesión desde refreshToken        */
  /* ------------------------------------------------------------------ */

  /**
   * ¿Qué? Al cargar la app, intenta renovar el accessToken con el refreshToken guardado.
   * ¿Para qué? Si el usuario cierra y reabre el navegador, el accessToken (en memoria)
   *            se perdió. El refreshToken (en localStorage) persiste, así que podemos
   *            obtener un nuevo accessToken silenciosamente sin que el usuario tenga
   *            que hacer login de nuevo — mejor experiencia de usuario.
   * ¿Impacto? Si el refreshToken también expiró (>7 días sin uso), el refresh falla
   *           y el usuario debe hacer login. Comportamiento correcto por seguridad.
   */
  useEffect(() => {
    async function tryRestoreSession() {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        // No hay refresh token — sesión nueva, no intentar restaurar
        setIsLoading(false);
        return;
      }

      try {
        // Intentar obtener nuevo access token con el refresh token guardado
        const tokens: TokenResponse = await refreshAccessToken({
          refreshToken: storedRefreshToken,
        });

        // Guardar el nuevo access token en memoria y en el módulo axios
        setAccessToken(tokens.accessToken);

        // El backend puede rotar el refresh token — guardar el nuevo
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

        // Cargar los datos del usuario con el nuevo access token
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        // El refresh token expiró o no es válido — limpiar y pedir login
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
      } finally {
        // isLoading: false en cualquier caso — la app puede renderizarse
        setIsLoading(false);
      }
    }

    void tryRestoreSession();
  }, []); // [] — se ejecuta solo una vez al montar el Provider

  /* ------------------------------------------------------------------ */
  /* Acciones de autenticación                                           */
  /* ------------------------------------------------------------------ */

  /**
   * ¿Qué? Autentica al usuario, guarda los tokens y carga sus datos.
   * ¿Para qué? LoginPage llama esta función. Si tiene éxito, el usuario
   *            queda autenticado y isAuthenticated pasa a true.
   * ¿Impacto? Si el backend devuelve 401 (credenciales incorrectas),
   *           la función lanza un Error que LoginPage captura y muestra al usuario.
   */
  async function login(data: LoginRequest): Promise<void> {
    try {
      const tokens = await loginUser(data);

      // Access token: en memoria (se pierde al recargar — correcto, es corta duración)
      setAccessToken(tokens.accessToken);

      // Refresh token: en localStorage (persiste 7 días para restaurar sesión)
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      // Cargar datos del usuario con el nuevo access token
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * ¿Qué? Registra un nuevo usuario y devuelve sus datos.
   * ¿Para qué? RegisterPage llama esta función. Después del registro exitoso,
   *            el usuario debe verificar su email antes de poder hacer login.
   * ¿Impacto? Si el email ya existe o la contraseña es débil, el backend
   *           devuelve 400/409. La función lanza un Error con el mensaje del backend.
   */
  async function register(data: RegisterRequest): Promise<UserResponse> {
    try {
      return await registerUser(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * ¿Qué? Cierra la sesión: limpia el access token en memoria y el refresh token en localStorage.
   * ¿Para qué? El usuario puede cerrar sesión explícitamente desde el Dashboard o Navbar.
   * ¿Impacto? Después de logout, isAuthenticated pasa a false y ProtectedRoute
   *           redirige al usuario a /login inmediatamente.
   *           NOTA: no llamamos al backend — los tokens JWT son stateless, expiran solos.
   *           En un sistema más robusto, se podría agregar un endpoint POST /logout
   *           que agregue el token a una blocklist en Redis.
   */
  function logout(): void {
    setAccessToken(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Export del contexto (para pruebas unitarias que necesiten mockearlo) */
/* ------------------------------------------------------------------ */
export { AuthContext };

/* ------------------------------------------------------------------ */
/* Hook useAuth — la forma principal de consumir el contexto           */
/* ------------------------------------------------------------------ */

/**
 * ¿Qué? Hook personalizado que expone el AuthContext de forma segura.
 * ¿Para qué? Centralizar la lógica de auth — cualquier componente puede
 *            llamar useAuth() para acceder al user, login, logout, etc.
 * ¿Impacto? El throw garantiza un mensaje de error claro si alguien usa
 *           useAuth() fuera de AuthProvider, en lugar de un null silencioso.
 *
 * Ejemplo de uso:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth() debe usarse dentro de un <AuthProvider>. " +
        "Asegúrate de que AuthProvider envuelve el componente en App.tsx.",
    );
  }

  return context;
}
