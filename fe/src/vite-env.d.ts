/**
 * Archivo: vite-env.d.ts
 * Descripción: Declaraciones de tipos específicas de Vite para TypeScript.
 * ¿Para qué? Proveer tipos para import.meta.env (variables VITE_*) y
 *            para importaciones de archivos CSS, imágenes y otros assets.
 * ¿Impacto? Sin este archivo, TypeScript no reconoce `import "./index.css"`
 *           ni `import.meta.env.VITE_API_BASE_URL`, causando errores TS2882.
 */

/// <reference types="vite/client" />
