/**
 * Archivo: src/test/setup.ts
 * Descripción: Setup global de Vitest — se ejecuta antes de cada suite de tests.
 * ¿Para qué? Registrar los matchers de @testing-library/jest-dom en el entorno
 *            de Vitest, habilitando assertions específicas del DOM como:
 *            toBeInTheDocument(), toHaveTextContent(), toBeDisabled(),
 *            toHaveAttribute(), etc.
 * ¿Impacto? Sin este setup, Vitest solo tiene matchers básicos (toBe, toEqual...).
 *           Los tests de componentes React fallarían con
 *           "TypeError: toBeInTheDocument is not a function".
 */

// Extiende la interfaz Assertion de Vitest con los matchers del DOM.
// Al importar este módulo (vía setupFiles en vitest.config.ts), se aplica
// module augmentation que agrega ~30 matchers específicos del DOM a expect().
import "@testing-library/jest-dom/vitest";

// Importamos afterEach de Vitest y cleanup de Testing Library para registrar
// la limpieza del DOM después de cada test.
// ¿Por qué explícitamente? @testing-library/react v16 detecta afterEach
// en globalThis para registrar auto-cleanup, pero en algunas configuraciones
// de Vitest (sin globals: true) esta detección puede no funcionar. Registrarlo
// aquí manualmente garantiza que el DOM se desmonta entre tests sin importar
// la configuración de globals.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Inicializar i18n antes de que los tests usen componentes con useTranslation().
// Sin esto, t() devolvería la clave en lugar del texto traducido y los tests
// que buscan strings de la UI (labels, botones) fallarían.
// ¿Por qué changeLanguage("es")? En jsdom (entorno de test), navigator.language
// es "en" por defecto, por lo que i18next detectaría inglés. Los tests buscan
// strings en español, así que forzamos el idioma a "es" explícitamente.
import i18n from "../i18n";
void i18n.changeLanguage("es");

afterEach(cleanup);
