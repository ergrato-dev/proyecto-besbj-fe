/**
 * Archivo: pages/ContactPage.tsx
 * Descripción: Página de contacto del sistema NN Auth.
 * ¿Para qué? Proporcionar canales de comunicación y contexto del proyecto educativo.
 */

import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400"
          >
            ← Volver al inicio
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Contacto
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          NN Auth System es un proyecto educativo del programa SENA
        </p>

        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Sobre el proyecto
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Este sistema de autenticación fue desarrollado como proyecto de aprendizaje,
              implementando las mejores prácticas de seguridad con Spring Boot 3 (Java 21),
              React 19 y PostgreSQL 17. Cada línea de código está documentada con el
              principio ¿Qué? ¿Para qué? ¿Impacto?.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Stack tecnológico
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• <strong>Backend:</strong> Spring Boot 3 · Java 21 · PostgreSQL 17 · Flyway · JJWT</li>
              <li>• <strong>Frontend:</strong> React 19 · TypeScript 6 · Vite 8 · TailwindCSS 4</li>
              <li>• <strong>Seguridad:</strong> BCrypt · JWT stateless · Bucket4j rate limiting</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Repositorio
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              El código fuente del proyecto está disponible en GitHub bajo la
              organización <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">ergrato-dev</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
