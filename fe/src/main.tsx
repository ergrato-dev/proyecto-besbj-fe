/**
 * Archivo: main.tsx
 * Descripción: Punto de entrada de la aplicación React.
 * ¿Para qué? Montar el componente raíz <App /> en el DOM y envolver
 *            la app con StrictMode para detectar problemas en desarrollo.
 * ¿Impacto? Sin este archivo, React no arranca — es el equivalente
 *            a `main()` en Java o `__main__` en Python.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/*
  document.getElementById("root") — busca el <div id="root"> en index.html.
  El ! (non-null assertion) le dice a TypeScript que SABEMOS que existe.
  Si el div no existe, lanzaría un error en runtime.

  createRoot() — API de React 18+ para renderizado concurrente.
  La versión antigua (ReactDOM.render) fue eliminada en React 18.
*/
createRoot(document.getElementById("root")!).render(
  /*
    StrictMode — solo activo en desarrollo, no afecta la build de producción.
    Detecta: efectos con dependencias incorrectas, uso de APIs deprecadas,
    componentes sin key en listas, etc. Puede causar que los efectos (useEffect)
    se ejecuten dos veces — esto es intencional para detectar bugs.
  */
  <StrictMode>
    <App />
  </StrictMode>,
);
