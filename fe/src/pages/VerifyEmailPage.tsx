/**
 * Archivo: pages/VerifyEmailPage.tsx
 * Descripción: Página de verificación de email tras el registro.
 * ¿Para qué? El usuario llega aquí al hacer clic en el enlace del email de bienvenida.
 *            La página extrae el token de la URL y llama al backend automáticamente.
 * ¿Impacto? Sin verificación de email, cualquiera podría registrarse con el email
 *           de otra persona y hacerse pasar por ella dentro del sistema.
 */

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { verifyEmail, extractErrorMessage } from "../api/auth";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { t } = useTranslation();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "",
  );

  /**
   * ¿Qué? Llama al backend para verificar el token al montar el componente.
   * ¿Por qué useEffect? Es un side effect (llamada a API) que ocurre al montar.
   *                     No va en el render — el render debe ser puro.
   * ¿Impacto? Si el token ya fue usado o expiró (>24h), el backend devuelve 400.
   */
  useEffect(() => {
    if (!token) return;

    async function doVerify() {
      try {
        await verifyEmail({ token });
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(extractErrorMessage(error));
      }
    }

    void doVerify();
  }, [token]); // Solo se ejecuta si cambia el token (normalmente solo una vez al montar)

  if (status === "loading") {
    return (
      <AuthLayout title={t("auth.verifyEmail.loadingTitle")}>
        <div className="flex justify-center py-8">
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
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout title={t("auth.verifyEmail.successTitle")} subtitle={t("auth.verifyEmail.successSubtitle")}>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.verifyEmail.successMessage")}
          </p>
          <Link to="/login">
            <Button variant="primary" className="px-8">
              {t("auth.verifyEmail.goToLogin")}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("auth.verifyEmail.errorTitle")}>
      <Alert variant="error">{errorMessage || t("auth.verifyEmail.invalidLinkError")}</Alert>
      <div className="mt-6 flex justify-end">
        <Link to="/login">
          <Button variant="secondary">{t("auth.verifyEmail.backToLogin")}</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
