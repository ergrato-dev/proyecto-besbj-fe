/**
 * Archivo: pages/DashboardPage.tsx
 * Descripción: Página principal del usuario autenticado — muestra su perfil y acciones.
 * ¿Para qué? Dar al usuario un punto centralizado para ver su información
 *            y acceder a las operaciones disponibles (cambiar contraseña, cerrar sesión).
 * ¿Impacto? Ruta protegida — ProtectedRoute redirige a /login si no hay sesión activa.
 */

import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ---- Saludo ---- */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hola, {user?.fullName} 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Bienvenido a tu dashboard de NN Auth System
          </p>
        </div>

        {/* ---- Tarjeta de perfil ---- */}
        <section
          aria-labelledby="profile-heading"
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
        >
          <h2
            id="profile-heading"
            className="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            Información de cuenta
          </h2>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Nombre
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.fullName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.email}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Email verificado
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm">
                {user?.emailVerified ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verificado
                  </span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Pendiente
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Estado
              </dt>
              <dd className="mt-1 text-sm">
                {user?.active ? (
                  <span className="text-green-600 dark:text-green-400">Activo</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Inactivo</span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Miembro desde
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        {/* ---- Acciones — alineadas a la derecha ---- */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/change-password")}
          >
            Cambiar contraseña
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </main>
    </div>
  );
}
