/**
 * Archivo: vitest.config.ts
 * Descripción: Configuración de Vitest — el test runner compatible con Vite.
 * ¿Para qué? Configurar el entorno de testing (jsdom para simular el DOM del
 *            navegador), el archivo de setup global y los plugins para
 *            transformar JSX/TypeScript en los tests.
 * ¿Impacto? Sin este archivo, Vitest usaría sus defaults (sin jsdom),
 *           haciendo que tests de componentes React fallen porque `document`
 *           y `window` no existen en el entorno Node.js puro.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // Plugin para transformar JSX/TSX — necesario para que Vitest entienda
    // los archivos .tsx de los componentes y páginas a testear.
    // No incluimos TailwindCSS aquí porque los tests no necesitan procesar CSS.
    react(),
  ],
  test: {
    // jsdom: simula el DOM del navegador (document, window, localStorage, etc.)
    // dentro de Node.js. Sin esto, los componentes React no pueden renderizarse
    // porque presuponen la existencia de un DOM.
    environment: "jsdom",

    // Archivo que se ejecuta ANTES de cada suite de tests.
    // Aquí registramos los matchers de @testing-library/jest-dom
    // (toBeInTheDocument, toHaveTextContent, toBeDisabled, etc.)
    setupFiles: ["./src/test/setup.ts"],
  },
});
