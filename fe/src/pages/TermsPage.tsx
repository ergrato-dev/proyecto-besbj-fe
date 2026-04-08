/**
 * Archivo: pages/TermsPage.tsx
 * Descripción: Términos y condiciones de uso del sistema NN Auth.
 * ¿Para qué? Definir las reglas de uso del sistema para los usuarios.
 *            Es obligatorio tener términos en cualquier sistema con cuentas de usuario.
 * ¿Impacto? Los usuarios deben aceptar los términos al registrarse (implícitamente).
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";

export default function TermsPage() {
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

        <article className="prose prose-gray max-w-none dark:prose-invert">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("legal.terms.title")}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t("legal.lastUpdated")}
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.terms.s1.heading")}
              </h2>
              <p className="mt-2">{t("legal.terms.s1.p1")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.terms.s2.heading")}
              </h2>
              <p className="mt-2">{t("legal.terms.s2.p1")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.terms.s3.heading")}
              </h2>
              <p className="mt-2">{t("legal.terms.s3.p1")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.terms.s4.heading")}
              </h2>
              <p className="mt-2">{t("legal.terms.s4.p1")}</p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
