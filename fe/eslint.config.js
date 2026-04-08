/**
 * Archivo: eslint.config.js
 * Descripción: Configuración de ESLint para TypeScript y React.
 * ¿Para qué? Detectar errores de código, malas prácticas y problemas de estilo
 *            antes de que lleguen al navegador o al repositorio.
 * ¿Impacto? Sin este archivo, `pnpm lint` no reportaría nada — el código podría
 *            tener errores tipados silenciosos que solo aparecen en runtime.
 */
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/*
  tseslint.config() — función helper de typescript-eslint que combina
  configuraciones de ESLint con reglas de TypeScript.
  Genera una configuración flat (formato moderno de ESLint 9+).
*/
export default tseslint.config(
  // Ignorar la carpeta dist — no tiene sentido lintar el código compilado.
  { ignores: ["dist"] },

  {
    // Extiende las reglas recomendadas de JS puro y TypeScript strict.
    // "recommended" detecta errores comunes. "strict" agrega más verificaciones.
    extends: [js.configs.recommended, ...tseslint.configs.strict],

    // Solo aplica estas reglas a archivos TypeScript/TSX.
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      // ES2020 habilita las características modernas (optional chaining, etc.)
      ecmaVersion: 2020,
      // "browser" define variables globales del navegador: window, document, etc.
      // Sin esto, ESLint marcaría `document` como variable no definida.
      globals: globals.browser,
    },

    plugins: {
      // react-hooks: detecta violaciones de las reglas de hooks de React.
      // Ejemplo: llamar un hook dentro de un if() o un bucle — prohibido.
      "react-hooks": reactHooks,

      // react-refresh: detecta componentes que no se pueden actualizar con HMR.
      // Avisa si un archivo exporta tanto un componente como algo más.
      "react-refresh": reactRefresh,
    },

    rules: {
      // Activa todas las reglas recomendadas de react-hooks de una vez.
      ...reactHooks.configs.recommended.rules,

      // Avisa si un componente no puede actualizarse con Fast Refresh (HMR).
      // Solo exportar componentes (sin constantes ni funciones mezcladas).
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
