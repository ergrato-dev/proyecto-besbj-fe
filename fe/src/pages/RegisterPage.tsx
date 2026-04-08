/**
 * Archivo: pages/RegisterPage.tsx
 * Descripción: Página de registro de nuevos usuarios.
 * ¿Para qué? Crear una cuenta nueva con email, nombre completo y contraseña.
 * ¿Impacto? Después del registro exitoso, el usuario recibe un email de verificación.
 *           No puede hacer login hasta verificar su email — previene registros falsos.
 */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/layout/AuthLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * ¿Qué? Envía los datos de registro al backend.
   * ¿Para qué? Crear la cuenta y disparar el envío del email de verificación.
   * ¿Impacto? En caso de éxito, se muestra un mensaje pidiendo verificar el email
   *           en lugar de redirigir — el usuario no puede hacer login todavía.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const user = await register({ fullName, email, password });
      setSuccessMessage(t("auth.register.successMessage", { email: user.email }));
      // Limpiar el formulario
      setFullName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("auth.register.errorDefault"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
        {successMessage && (
          <Alert variant="success">{successMessage}</Alert>
        )}

        <InputField
          id="fullName"
          label={t("common.fullName")}
          type="text"
          autoComplete="name"
          required
          placeholder={t("auth.register.fullNamePlaceholder")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

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
            autoComplete="new-password"
            required
            placeholder={t("common.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Reglas de contraseña — info preventiva antes del error */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t("auth.register.passwordHint")}
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!fullName || !email || !password}
            className="w-full sm:w-auto px-8"
          >
            {t("auth.register.submit")}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("auth.register.haveAccount")}{" "}
        <Link
          to="/login"
          className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
