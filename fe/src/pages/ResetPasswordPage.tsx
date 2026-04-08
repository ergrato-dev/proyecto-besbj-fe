/**
 * Archivo: pages/ResetPasswordPage.tsx
 * Descripción: Página para establecer la nueva contraseña usando el token del email.
 * ¿Para qué? Completar el flujo de recuperación de contraseña.
 *            El usuario llega aquí al hacer clic en el enlace del email de recuperación.
 * ¿Impacto? El token en la URL identifica y autentifica la solicitud.
 *           Si el token expiró (>1 hora) o ya se usó, el backend devuelve 400.
 */

import { useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/layout/AuthLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { resetPassword, extractErrorMessage } from "../api/auth";

export default function ResetPasswordPage() {
  // useSearchParams lee los query params de la URL: /reset-password?token=abc123
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  // Validación local: las contraseñas coinciden antes de enviar al backend
  const passwordsMatch = newPassword === confirmPassword;

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!passwordsMatch) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  // Sin token en la URL — probablemente acceso directo sin seguir el email
  if (!token) {
    return (
      <AuthLayout title={t("auth.resetPassword.invalidTitle")}>
        <Alert variant="error">
          {t("auth.resetPassword.invalidMessage")}
        </Alert>
        <div className="mt-4 flex justify-end">
          <Link to="/forgot-password">
            <Button variant="primary">{t("auth.resetPassword.requestNewLink")}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
}

  if (success) {
    return (
      <AuthLayout title={t("auth.resetPassword.successTitle")} subtitle={t("auth.resetPassword.successSubtitle")}>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.resetPassword.successMessage")}
          </p>
          <Link to="/login">
            <Button variant="primary">{t("auth.resetPassword.goToLogin")}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("auth.resetPassword.title")}
      subtitle={t("auth.resetPassword.subtitle")}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <InputField
          id="newPassword"
          label={t("auth.resetPassword.newPassword")}
          type="password"
          autoComplete="new-password"
          required
          placeholder={t("common.passwordPlaceholder")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <InputField
          id="confirmPassword"
          label={t("auth.resetPassword.confirmPassword")}
          type="password"
          autoComplete="new-password"
          required
          placeholder={t("common.passwordPlaceholder")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={
            confirmPassword && !passwordsMatch
              ? t("common.passwordsMismatch")
              : undefined
          }
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!newPassword || !confirmPassword || !passwordsMatch}
            className="w-full sm:w-auto px-8"
          >
            {t("auth.resetPassword.submit")}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
