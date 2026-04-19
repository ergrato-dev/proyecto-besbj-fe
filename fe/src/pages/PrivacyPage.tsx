/**
 * Archivo: pages/PrivacyPage.tsx
 * Descripción: Política de privacidad del sistema NN Auth.
 * ¿Para qué? Informar a los usuarios qué datos se recopilan, cómo se usan y
 *            qué derechos tienen — es un requisito legal en sistemas con cuentas de usuario.
 * ¿Impacto? Sin política de privacidad publicada, el sistema incumple el Art. 15
 *           de la Ley 1581/2012 (protección de datos personales en Colombia).
 *           Los usuarios deben aceptarla al registrarse para dar consentimiento válido.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";

export default function PrivacyPage() {
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
            {t("legal.privacy.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {t("legal.lastUpdated")}
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.privacy.s1.heading")}
              </h2>
              <p className="mt-2">{t("legal.privacy.s1.p1")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.privacy.s2.heading")}
              </h2>
              <p className="mt-2">{t("legal.privacy.s2.p1")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.privacy.s3.heading")}
              </h2>
              <p className="mt-2">
                {t("legal.privacy.s3.p1")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("legal.privacy.s4.heading")}
              </h2>
              <p className="mt-2">
                {t("legal.privacy.s4.p1")}{" "}
                <Link to="/contact" className="text-accent-600 underline hover:text-accent-700 dark:text-accent-400">
                  {t("nav.links.contact").toLowerCase()}
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
