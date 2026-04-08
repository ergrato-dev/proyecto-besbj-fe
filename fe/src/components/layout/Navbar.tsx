/**
 * Archivo: components/layout/Navbar.tsx
 * Descripción: Barra de navegación superior con logo, links, toggle de tema y botones de auth.
 * ¿Para qué? Proveer navegación global consistente en todas las páginas de la app.
 *            Muestra distintas opciones según si el usuario está autenticado o no.
 * ¿Impacto? Es el elemento visual más visible de la app. Un bug aquí (ej: logout
 *           que no limpia bien el estado) afecta la seguridad de toda la sesión.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useAuth } from "../../hooks/useAuth";

/**
 * ¿Qué? Clave de localStorage para la preferencia de tema del usuario.
 * ¿Por qué "nn-auth-theme"? El prefijo "nn-auth-" evita colisiones con
 * otras apps que puedan correr en el mismo dominio (localhost:5173).
 */
const THEME_KEY = "nn-auth-theme";

/**
 * ¿Qué? Barra de navegación con logo, links, botón de tema y acciones de auth.
 * ¿Para qué? Permitir al usuario navegar entre páginas y gestionar su sesión.
 * ¿Impacto? sticky top-0 z-50 — la navbar siempre visible al hacer scroll.
 *           backdrop-blur — efecto visual moderno de vidrio esmerilado (sin gradientes).
 */
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  // ¿Qué? Hook de traducción para todos los textos de la navbar.
  // ¿Para qué? t() retorna el texto en el idioma activo.
  // ¿Impacto? Al cambiar idioma, la navbar se actualiza automáticamente sin recarga.
  const { t } = useTranslation();

  /* ------------------------------------------------------------------ */
  /* Estado del tema — sincronizado con localStorage y clase del DOM     */
  /* ------------------------------------------------------------------ */

  /**
   * ¿Qué? Estado del tema actual (dark/light).
   * Inicializado leyendo localStorage para que coincida con lo que el script
   * anti-FOUC de index.html aplicó antes de que React montara.
   */
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  /**
   * ¿Qué? Sincroniza el tema: aplica/quita la clase .dark en <html> y guarda en localStorage.
   * ¿Por qué useEffect? Las operaciones DOM (classList) son side effects — no deben estar
   * en el render. useEffect se ejecuta después del render, momento correcto para el DOM.
   */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                             */
  /* ------------------------------------------------------------------ */

  function handleLogout(): void {
    logout();
    // Redirigir al login después de cerrar sesión
    navigate("/login");
  }

  function toggleTheme(): void {
    setIsDark((prev) => !prev);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        {/* ---- Logo + nombre ---- */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"
          aria-label="NN Auth System — ir al inicio"
        >
          <Logo size={32} />
          <span className="hidden sm:block">{t("nav.brand")}</span>
        </Link>

        {/* ---- Links secondarios (visibles en pantallas medianas+) ---- */}
        <div className="hidden items-center gap-6 text-sm text-gray-600 dark:text-gray-400 md:flex">
          <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white">
            {t("nav.links.terms")}
          </Link>
          <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white">
            {t("nav.links.privacy")}
          </Link>
          <Link to="/contact" className="hover:text-gray-900 dark:hover:text-white">
            {t("nav.links.contact")}
          </Link>
        </div>

        {/* ---- Acciones del lado derecho ---- */}
        <div className="flex items-center gap-2">
          {/* Selector de idioma */}
          <LanguageSwitcher />

          {/* Botón de toggle de tema — icono sol/luna */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? t("nav.themeToggle.toLight") : t("nav.themeToggle.toDark")}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            {isDark ? (
              /* Sol — modo claro */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              /* Luna — modo oscuro */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            /* Usuario autenticado: mostrar saludo + acciones */
            <>
              <span className="hidden text-sm text-gray-600 dark:text-gray-400 sm:block">
                {user ? `${user.firstName} ${user.lastName}` : ""}
              </span>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-sm">
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="text-sm">
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            /* Usuario anónimo: mostrar botones de login y registro */
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-sm">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="text-sm">
                  {t("nav.register")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
