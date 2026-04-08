/**
 * Archivo: pages/TermsPage.tsx
 * Descripción: Términos y condiciones de uso del sistema NN Auth.
 * ¿Para qué? Definir las reglas de uso del sistema para los usuarios.
 *            Es obligatorio tener términos en cualquier sistema con cuentas de usuario.
 * ¿Impacto? Los usuarios deben aceptar los términos al registrarse (implícitamente).
 */

import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function TermsPage() {
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

        <article className="prose prose-gray max-w-none dark:prose-invert">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Términos y condiciones
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Última actualización: abril 2026
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                1. Propósito del sistema
              </h2>
              <p className="mt-2">
                NN Auth System es un proyecto educativo desarrollado en el marco del
                programa SENA. Su propósito es demostrar la implementación de un
                sistema de autenticación completo con Spring Boot (Java 21) y React.
                No está destinado a uso en producción con datos reales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                2. Uso aceptable
              </h2>
              <p className="mt-2">
                Los usuarios se comprometen a utilizar el sistema exclusivamente
                con fines de aprendizaje y prueba. Está prohibido intentar vulnerar
                la seguridad del sistema, realizar ataques de fuerza bruta, o usar
                el servicio para actividades que violen las leyes aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                3. Datos de prueba
              </h2>
              <p className="mt-2">
                Al ser un proyecto educativo, se recomienda no utilizar datos
                personales reales. Use emails y contraseñas de prueba. Los datos
                almacenados pueden ser eliminados en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                4. Responsabilidad
              </h2>
              <p className="mt-2">
                El sistema se provee "tal como está" con fines educativos. No se
                garantiza disponibilidad continua ni se asume responsabilidad por
                pérdida de datos.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
