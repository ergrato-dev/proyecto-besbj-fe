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
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/layout/AuthLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

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
        error instanceof Error ? error.message : t("auth.login.title"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Mensaje de error del backend */}
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <InputField
          id="email"
          label={t("common.email")}
          type="email"
          autoComplete="email"
          required
          placeholder={t("common.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <InputField
            id="password"
            label={t("common.password")}
            type="password"
            autoComplete="current-password"
            required
            placeholder={t("common.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Link de recuperación alineado a la derecha */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
            >
              {t("auth.login.forgotPassword")}
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
            {t("auth.login.submit")}
          </Button>
        </div>
      </form>

      {/* Link a registro */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("auth.login.noAccount")}{" "}
        <Link
          to="/register"
          className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          {t("auth.login.registerLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
