/**
 * Archivo: components/layout/AuthLayout.tsx
 * Descripción: Layout centrado para las páginas de autenticación (login, registro, etc.).
 * ¿Para qué? Todas las páginas de auth comparten la misma estructura visual:
 *            fondo, card centrada, logo y título. Este componente evita repetirla.
 * ¿Impacto? Si se quiere cambiar el estilo del fondo de auth (ej: agregar un patrón),
 *           solo se modifica aquí y todas las páginas de auth se actualizan.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../ui/Logo";

interface AuthLayoutProps {
  /** Título de la página que se muestra bajo el logo (ej: "Iniciar sesión") */
  title: string;
  /** Subtítulo opcional bajo el título (ej: "Bienvenido de vuelta") */
  subtitle?: string;
  /** Formulario o contenido de la página de auth */
  children: ReactNode;
}

/**
 * ¿Qué? Layout de pantalla completa centrado para formularios de autenticación.
 * ¿Para qué? Proveer una estructura visual consistente: logo arriba, card blanca
 *            centrada, contenido de la página dentro.
 * ¿Impacto? min-h-screen asegura que el card esté centrado incluso en pantallas grandes.
 *           p-4 en móvil / sm:p-0 en pantallas mayores — diseño mobile-first.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      {/* ---- Logo + nombre del sistema ---- */}
      <Link
        to="/"
        className="mb-8 flex items-center gap-3"
        aria-label="NN Auth System — ir al inicio"
      >
        <Logo size={44} />
        <span className="text-xl font-semibold text-gray-900 dark:text-white">
          NN Auth System
        </span>
      </Link>

      {/* ---- Card de formulario ---- */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Título y subtítulo de la página */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Contenido de la página (formulario, mensajes, etc.) */}
        {children}
      </div>

      {/* ---- Links legales al pie del formulario ---- */}
      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-400">
          {t("legal.authFooter.terms")}
        </Link>
        {" · "}
        <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-400">
          {t("legal.authFooter.privacy")}
        </Link>
        {" · "}
        <Link to="/cookies" className="hover:text-gray-600 dark:hover:text-gray-400">
          {t("legal.authFooter.cookies")}
        </Link>
      </p>
    </div>
  );
}
