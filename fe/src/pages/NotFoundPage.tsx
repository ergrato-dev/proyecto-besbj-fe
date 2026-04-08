/**
 * Archivo: pages/NotFoundPage.tsx
 * Descripción: Página 404 — se muestra cuando ninguna ruta coincide con la URL.
 * ¿Para qué? Dar feedback claro al usuario cuando accede a una URL que no existe.
 * ¿Impacto? Sin esta página, el usuario vería una pantalla en blanco o un error
 *           confuso. Una página 404 bien diseñada dirige al usuario de vuelta al inicio.
 */

import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-8xl font-bold text-accent-600 dark:text-accent-400">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Página no encontrada
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          La URL que buscas no existe o fue movida.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button variant="primary" className="px-8">
              Ir al inicio
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
