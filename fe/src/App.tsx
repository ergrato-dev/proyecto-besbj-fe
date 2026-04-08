/**
 * Archivo: App.tsx
 * Descripción: Componente raíz de la aplicación — define el sistema de rutas.
 * ¿Para qué? Centralizar todas las rutas de la app en un solo lugar.
 *            Cada ruta mapea una URL a un componente de página.
 * ¿Impacto? Agregar una ruta aquí la hace accesible en el navegador.
 *            Olvidar agregar una ruta significa que la URL devuelve 404.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";

/*
  Placeholder temporal — las páginas reales se crean en Fase 6.
  Este componente mínimo verifica que React Router funciona correctamente.
*/
function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/*
          accent-600 usa el token definido en index.css (@theme inline).
          Aquí es amber-600 porque este es el stack Spring Boot Java.
          En otro stack (ej: FastAPI), sería emerald-600 — sin cambiar este archivo.
        */}
        <h1 className="text-3xl font-bold text-accent-600">{name}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          NN Auth System — Spring Boot + React
        </p>
      </div>
    </div>
  );
}

/**
 * ¿Qué? Componente raíz que envuelve toda la app con BrowserRouter y define las rutas.
 * ¿Para qué? BrowserRouter habilita la navegación del lado del cliente (SPA).
 *            Sin él, React Router no puede leer ni modificar la URL del navegador.
 * ¿Impacto? Cambiar BrowserRouter por HashRouter cambiaría las URLs de /login a /#/login.
 *           En producción con BrowserRouter se necesita configurar el servidor para
 *           devolver index.html en todas las rutas (actualmente Vite lo hace solo).
 */
export default function App() {
  return (
    /*
      BrowserRouter — usa la History API del navegador para gestionar la URL.
      No recarga la página al navegar entre rutas.
    */
    <BrowserRouter>
      {/*
        Routes — contenedor de todas las rutas. Solo renderiza la primera
        ruta que coincide con la URL actual. Sin él, todas las rutas
        coincidentes se renderizarían a la vez.
      */}
      <Routes>
        {/* Fase 6: aquí irán todas las rutas reales */}
        <Route
          path="/"
          element={<PlaceholderPage name="Landing Page — próximamente" />}
        />
        <Route
          path="/login"
          element={<PlaceholderPage name="Login Page — próximamente" />}
        />
        <Route
          path="/register"
          element={<PlaceholderPage name="Register Page — próximamente" />}
        />
        <Route
          path="/dashboard"
          element={<PlaceholderPage name="Dashboard — próximamente" />}
        />
        {/*
          Ruta comodín — captura cualquier URL que no coincida con las anteriores.
          Equivale al 404. En Fase 6 se reemplaza por un componente NotFoundPage.
        */}
        <Route
          path="*"
          element={<PlaceholderPage name="404 — Página no encontrada" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
