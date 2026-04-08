/**
 * Archivo: pages/PrivacyPage.tsx
 * Descripción: Política de privacidad del sistema NN Auth.
 * ¿Para qué? Informar a los usuarios qué datos se recopilan y cómo se usan.
 *            Es un requisito legal en sistemas con cuentas de usuario.
 */

import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function PrivacyPage() {
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
            Política de privacidad
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Última actualización: abril 2026
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Datos que recopilamos
              </h2>
              <p className="mt-2">
                Al crear una cuenta, recopilamos: nombre completo, dirección de
                email y contraseña. La contraseña se almacena hasheada con BCrypt
                — nunca en texto plano.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cómo usamos los datos
              </h2>
              <p className="mt-2">
                Los datos se usan exclusivamente para autenticación dentro del
                sistema. No se comparten con terceros. Este es un proyecto
                educativo — los datos son para demostración técnica.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Almacenamiento en el navegador
              </h2>
              <p className="mt-2">
                El sistema usa <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">localStorage</code>{" "}
                para guardar el refresh token (necesario para mantener la sesión
                entre recargas de página) y la preferencia de tema (claro/oscuro).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Contacto
              </h2>
              <p className="mt-2">
                Para cualquier consulta sobre privacidad, visita nuestra{" "}
                <Link to="/contact" className="text-accent-600 underline hover:text-accent-700 dark:text-accent-400">
                  página de contacto
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
