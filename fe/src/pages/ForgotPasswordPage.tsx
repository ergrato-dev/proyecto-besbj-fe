/**
 * Archivo: pages/ForgotPasswordPage.tsx
 * Descripción: Página para solicitar el email de recuperación de contraseña.
 * ¿Para qué? Iniciar el flujo de reset cuando el usuario olvidó su contraseña.
 * ¿Impacto? El backend siempre responde con el mismo mensaje, exista o no el email.
 *           Esto implementa el principio de "no revelar si el email está registrado"
 *           — también conocido como prevención de "user enumeration attack".
 */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { forgotPassword, extractErrorMessage } from "../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      // Mostrar siempre el mismo mensaje de éxito (anti-enumeration)
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  // Estado de éxito — el email se ha enviado (o el email no existe, pero no lo revelamos)
  if (submitted) {
    return (
      <AuthLayout
        title="Revisa tu email"
        subtitle="Instrucciones enviadas"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Si existe una cuenta con el email <strong>{email}</strong>, recibirás
            un enlace de recuperación en los próximos minutos. Revisa también
            tu carpeta de spam.
          </p>
          <Link
            to="/login"
            className="text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
          >
            Volver al login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace por email"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!email}
            className="w-full sm:w-auto px-8"
          >
            Enviar enlace
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          to="/login"
          className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
        >
          Volver al login
        </Link>
      </p>
    </AuthLayout>
  );
}
