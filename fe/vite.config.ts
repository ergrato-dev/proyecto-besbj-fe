/**
 * Archivo: vite.config.ts
 * Descripción: Configuración de Vite — bundler y servidor de desarrollo.
 * ¿Para qué? Optimizar el proceso de desarrollo y producción del frontend React.
 * ¿Impacto? Un error aquí impide que la app arranque, compile o que TailwindCSS
 *            procese los estilos correctamente.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// defineConfig() provee autocompletado e inferencia de tipos en el config.
// Sin él, el archivo funcionaría igual pero perderíamos el tipado de las opciones.
export default defineConfig({
  plugins: [
    // Habilita el soporte de React: JSX transform, Fast Refresh (HMR).
    // Sin este plugin, Vite no sabe cómo transformar archivos .tsx/.jsx.
    react(),

    // Integra TailwindCSS 4 directamente como plugin de Vite.
    // TailwindCSS 4 ya no necesita un archivo tailwind.config.js separado —
    // la configuración vive en index.css con directivas @theme.
    tailwindcss(),
  ],
  server: {
    // Puerto del dev server. Debe coincidir con FRONTEND_URL en el backend.
    port: 5173,
  },
});
