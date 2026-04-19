/**
 * Archivo: pages/CookiesPage.tsx
 * Descripción: Política de cookies del sistema NN Auth.
 * ¿Para qué? Informar al usuario qué datos se guardan en el navegador
 *            y con qué propósito — cookies de sesión vs. localStorage de preferencias.
 *            La distinción cookies/localStorage tiene valor pedagógico en este proyecto.
 * ¿Impacto? Este sistema NO usa cookies HTTP para tokens (los tokens van en memoria
 *           y localStorage, no en cookies). La política explica esto para evitar
 *           confusión con sistemas que sí usan cookies httpOnly para auth.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";

export default function CookiesPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400"
          >
            {t("legal.backToHome")}
          </Link>
        </div>

        <article>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("legal.cookies.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {t("legal.lastUpdated")}
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.cookies.s1.heading")}
              </h2>
              <p className="mt-2">
                {t("legal.cookies.s1.p1")}
              </p>
              <p className="mt-2 text-sm">
                {t("legal.cookies.s1.p2Technical")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.cookies.s2.heading")}
              </h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">{t("legal.cookies.s2.col.key")}</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">{t("legal.cookies.s2.col.purpose")}</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">{t("legal.cookies.s2.col.duration")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">nn-auth-refresh-token</td>
                      <td className="px-4 py-2">{t("legal.cookies.s2.rows.refreshToken.purpose")}</td>
                      <td className="px-4 py-2">{t("legal.cookies.s2.rows.refreshToken.duration")}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">nn-auth-theme</td>
                      <td className="px-4 py-2">{t("legal.cookies.s2.rows.theme.purpose")}</td>
                      <td className="px-4 py-2">{t("legal.cookies.s2.rows.theme.duration")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
