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

afterEach(cleanup);
