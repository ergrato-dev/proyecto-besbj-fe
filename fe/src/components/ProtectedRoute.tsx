/**
 * Archivo: components/ProtectedRoute.tsx
 * Descripción: Componente que protege rutas que requieren autenticación.
 * ¿Para qué? Redirigir al usuario a /login si intenta acceder a una página
 *            que requiere estar autenticado (ej: /dashboard, /change-password).
 * ¿Impacto? Sin este componente, un usuario no autenticado podría acceder
 *           directamente a /dashboard escribiendo la URL — vulnerabilidad de
 *           acceso no autorizado. Con este componente, React Router redirige
 *           antes de renderizar cualquier contenido protegido.
 *
 * NOTA: Esta protección es del lado del cliente (frontend).
 * El backend TAMBIÉN protege sus endpoints con JWT — si alguien llama
 * directamente a la API sin token, recibe 401. La protección del frontend
 * es solo para mejorar la experiencia de usuario.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  /** Componente de página a mostrar si el usuario está autenticado */
  children: React.ReactNode;
}

/**
 * ¿Qué? Wrapper de ruta que verifica autenticación antes de renderizar.
 * ¿Para qué? Proteger páginas como Dashboard y ChangePassword de acceso anónimo.
 * ¿Impacto? isLoading: mientras se verifica el token al cargar la app,
 *           muestra una pantalla de carga en lugar de redirigir al login
 *           (sin esto, el usuario vería el login brevemente aunque tenga sesión activa).
 *
 * state={{ from: location }} — guarda la URL que el usuario intentó visitar.
 * Después del login, se puede redirigir de vuelta a esa URL (mejor UX).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mientras AuthProvider verifica el refresh token, mostrar pantalla de carga
  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900"
        aria-label="Cargando sesión"
        aria-live="polite"
      >
        <svg
          aria-hidden="true"
          className="h-10 w-10 animate-spin text-accent-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Usuario no autenticado — redirigir a login guardando la ruta de origen
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuario autenticado — renderizar el contenido protegido
  return <>{children}</>;
}
