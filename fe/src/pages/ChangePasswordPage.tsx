/**
 * Archivo: pages/ChangePasswordPage.tsx
 * Descripción: Página para cambiar la contraseña de un usuario autenticado.
 * ¿Para qué? Permitir al usuario actualizar su contraseña desde el Dashboard,
 *            sin necesidad de hacer logout ni de un email de recuperación.
 *            A diferencia del reset, aquí el usuario debe saber su contraseña actual.
 * ¿Impacto? Ruta protegida — solo accesible con JWT válido. El backend verifica
 *           que currentPassword coincida antes de actualizar.
 */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { changePassword, extractErrorMessage } from "../api/auth";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordsMatch = newPassword === confirmPassword;

  /**
   * ¿Qué? Envía la contraseña actual y la nueva al backend para actualizarla.
   * ¿Para qué? El backend verifica que currentPassword coincide con el hash
   *            almacenado antes de actualizar — el usuario prueba identidad sin JWT extra.
   * ¿Impacto? Si las contraseñas nuevas no coinciden, el return temprano evita
   *           la llamada al backend — validación del lado del cliente como primera línea.
   *           El backend hace su propia validación — nunca confiar solo en el frontend.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!passwordsMatch) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await changePassword({ currentPassword, newPassword });
      setSuccessMessage(result.message);
      // Limpiar formulario después del éxito
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("auth.changePassword.backToDashboard")}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <h1 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
            {t("auth.changePassword.title")}
          </h1>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {t("auth.changePassword.subtitle")}
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <InputField
              id="currentPassword"
              label={t("auth.changePassword.currentPassword")}
              type="password"
              autoComplete="current-password"
              required
              placeholder={t("common.passwordPlaceholder")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <InputField
              id="newPassword"
              label={t("auth.changePassword.newPassword")}
              type="password"
              autoComplete="new-password"
              required
              placeholder={t("common.passwordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <InputField
              id="confirmPassword"
              label={t("auth.changePassword.confirmPassword")}
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

            {/* Botón alineado a la derecha (regla del proyecto) */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  !passwordsMatch
                }
                className="px-8"
              >
                {t("auth.changePassword.submit")}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
