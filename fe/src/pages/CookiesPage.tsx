/**
 * Archivo: pages/CookiesPage.tsx
 * Descripción: Política de cookies del sistema NN Auth.
 * ¿Para qué? Informar al usuario qué datos se guardan en el navegador.
 *            La diferencia entre cookies y localStorage también es educativa.
 */

import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400"
          >
            ← Volver al inicio
          </Link>
        </div>

        <article>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Política de cookies
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Última actualización: abril 2026
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ¿Usamos cookies?
              </h2>
              <p className="mt-2">
                El sistema <strong>no usa cookies HTTP</strong>. En su lugar, usa
                <code className="mx-1 rounded bg-gray-100 px-1 dark:bg-gray-800">localStorage</code>
                del navegador para el refresh token y la preferencia de tema.
              </p>
              <p className="mt-2 text-sm">
                <strong>Diferencia técnica:</strong> localStorage es accesible
                solo por JavaScript del mismo origen. Las cookies HTTP pueden ser
                marcadas como <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">HttpOnly</code>,
                haciéndolas inaccesibles a JavaScript — más seguras contra XSS.
                En un sistema de producción real, el refresh token debería ir en
                una cookie HttpOnly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Almacenamiento local utilizado
              </h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Clave</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Propósito</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">nn-auth-refresh-token</td>
                      <td className="px-4 py-2">Mantener sesión activa</td>
                      <td className="px-4 py-2">7 días</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">nn-auth-theme</td>
                      <td className="px-4 py-2">Preferencia de tema</td>
                      <td className="px-4 py-2">Indefinido</td>
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
