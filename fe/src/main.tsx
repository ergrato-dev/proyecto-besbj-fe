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

// ¿Qué? Importar la configuración de i18next ANTES de App.
// ¿Para qué? Garantizar que el motor de traducción esté inicializado antes de que
//            cualquier componente intente usar useTranslation().
//            El import tiene el efecto secundario de llamar a i18n.init() al ejecutarse.
// ¿Impacto? Si App importara antes que i18n, los primeros renders usarían la clave
//            literal en lugar del texto traducido (ej: "auth.login.title" en pantalla).
import "./i18n";

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
