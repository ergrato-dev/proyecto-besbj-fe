/**
 * Archivo: pages/LandingPage.tsx
 * Descripción: Página de inicio pública con presentación del sistema NN Auth.
 * ¿Para qué? Dar la bienvenida a usuarios nuevos, explicar qué hace el sistema
 *            y dirigirlos a registrarse o iniciar sesión.
 * ¿Impacto? Es la primera impresión del sistema. Un diseño claro y profesional
 *           transmite confianza en la seguridad del sistema de autenticación.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

/* ------------------------------------------------------------------ */
/* Componente principal                                                 */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const { t } = useTranslation();

  /* Datos de features — dentro del componente para acceder a t() */
  const features = [
    {
      key: "register",
      title: t("landing.features.register.title"),
      description: t("landing.features.register.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      key: "jwt",
      title: t("landing.features.jwt.title"),
      description: t("landing.features.jwt.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
    {
      key: "email",
      title: t("landing.features.email.title"),
      description: t("landing.features.email.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "recovery",
      title: t("landing.features.recovery.title"),
      description: t("landing.features.recovery.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  /* Datos del stack — dentro del componente para acceder a t() */
  const stackItems = [
    { key: "springBoot", name: t("landing.stack.springBoot.name"), detail: t("landing.stack.springBoot.detail") },
    { key: "react", name: t("landing.stack.react.name"), detail: t("landing.stack.react.detail") },
    { key: "postgres", name: t("landing.stack.postgres.name"), detail: t("landing.stack.postgres.detail") },
    { key: "tailwind", name: t("landing.stack.tailwind.name"), detail: t("landing.stack.tailwind.detail") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        {/* Badge de stack */}
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700 dark:border-accent-800 dark:bg-accent-950 dark:text-accent-300">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          {t("landing.badge")}
        </span>

        {/* Logo grande central */}
        <div className="mb-6 flex justify-center">
          <Logo size={72} />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          {t("landing.title")}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          {t("landing.subtitle")}
        </p>

        {/* CTAs — botones alineados al centro en hero */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register">
            <Button variant="primary" className="px-8 py-3 text-base">
              {t("landing.ctaRegister")}
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="px-8 py-3 text-base">
              {t("landing.ctaLogin")}
            </Button>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {t("landing.featuresTitle")}
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {t("landing.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.key}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Icono con color accent */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Stack tecnológico                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t("landing.stackTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stackItems.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-900"
            >
              <p className="font-semibold text-accent-600 dark:text-accent-400">
                {item.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>{t("landing.footer.credit")}</span>
          </div>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">
              {t("landing.footer.links.terms")}
            </Link>
            <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">
              {t("landing.footer.links.privacy")}
            </Link>
            <Link to="/cookies" className="hover:text-gray-600 dark:hover:text-gray-300">
              {t("landing.footer.links.cookies")}
            </Link>
            <Link to="/contact" className="hover:text-gray-600 dark:hover:text-gray-300">
              {t("landing.footer.links.contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
