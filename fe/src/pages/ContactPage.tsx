/**
 * Archivo: pages/ContactPage.tsx
 * Descripción: Página de contacto del sistema NN Auth.
 * ¿Para qué? Proporcionar canales de comunicación y contexto del proyecto educativo.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400"
          >
            {t("contact.backToHome")}
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("contact.title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {t("contact.subtitle")}
        </p>

        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t("contact.about.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("contact.about.text")}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t("contact.stack.title")}
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• {t("contact.stack.backend")}</li>
              <li>• {t("contact.stack.frontend")}</li>
              <li>• {t("contact.stack.security")}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t("contact.repo.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("contact.repo.text")}{" "}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">ergrato-dev</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
