/**
 * Archivo: pages/LoginPage.tsx
 * Descripción: Página de inicio de sesión con formulario de email y contraseña.
 * ¿Para qué? Permitir a usuarios registrados autenticarse en el sistema.
 * ¿Impacto? Es la puerta de entrada al sistema. Un formulario mal implementado
 *           (sin validación, sin feedback de errores) genera una mala experiencia
 *           y puede llevar al usuario a cometer errores de seguridad.
 */

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si ya está autenticado, redirigir al dashboard directamente
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Recuperar la URL de origen (si el usuario fue redirigido desde una ruta protegida)
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  /* ------------------------------------------------------------------ */
  /* Estado del formulario                                               */
  /* ------------------------------------------------------------------ */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /* Handler de submit                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * ¿Qué? Envía las credenciales al backend y redirige si el login es exitoso.
   * ¿Para qué? preventDefault() evita el comportamiento por defecto del formulario
   *            (recarga de página) — en SPAs toda la navegación es del lado del cliente.
   * ¿Impacto? Si login() lanza un Error, se muestra el mensaje en la UI sin crashear la app.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      // Login exitoso: redirigir a la URL de origen o al dashboard
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error al iniciar sesión",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Bienvenido de vuelta"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/*
          noValidate — desactiva la validación nativa del browser.
          Usamos la validación del backend para mensajes coherentes con el backend.
        */}

        {/* Mensaje de error del backend */}
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <InputField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          placeholder="usuario@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <InputField
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Link de recuperación alineado a la derecha */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {/* Botón submit alineado a la derecha (regla del proyecto) */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!email || !password}
            className="w-full sm:w-auto px-8"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>

      {/* Link a registro */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          Regístrate gratis
        </Link>
      </p>
    </AuthLayout>
  );
}
