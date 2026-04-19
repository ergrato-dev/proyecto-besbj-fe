/**
 * Archivo: components/ui/Button.tsx
 * Descripción: Componente de botón reutilizable con variantes y estado de carga.
 * ¿Para qué? Estandarizar el estilo de todos los botones de la app.
 *            Sin este componente, cada página definiría sus propios estilos
 *            de botón — difícil de mantener consistente.
 * ¿Impacto? Cambiar el estilo del botón primario aquí actualiza TODOS los
 *           botones primarios en toda la app de una sola vez.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Variantes de botón disponibles.
 * primary: acción principal (submit de formularios) — usa accent-600
 * secondary: acción secundaria — contorno sin fondo
 * danger: acción destructiva — rojo
 * ghost: acción discreta — sin fondo ni borde visible
 */
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estilo visual del botón. Por defecto: "primary" */
  variant?: ButtonVariant;
  /** Si true, muestra un spinner y deshabilita el botón */
  isLoading?: boolean;
  /** Si true, el botón ocupa el ancho completo del contenedor */
  fullWidth?: boolean;
  /** Contenido del botón */
  children: ReactNode;
}

/**
 * Mapa de clases CSS por variante.
 * ¿Por qué separado? Mantiene el componente limpio y hace las variantes
 * fáciles de encontrar y modificar sin leer el JSX completo.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500 " +
    "dark:bg-accent-600 dark:hover:bg-accent-700",
  secondary:
    "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus-visible:ring-gray-500 " +
    "dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 " +
    "dark:bg-red-700 dark:hover:bg-red-600",
  ghost:
    "text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500 " +
    "dark:text-gray-300 dark:hover:bg-gray-800",
};

/**
 * ¿Qué? Botón reutilizable con variantes visuales y estado de carga.
 * ¿Para qué? Los formularios de auth usan isLoading=true mientras esperan la respuesta
 *            del backend — el botón se deshabilita y muestra un spinner para que
 *            el usuario sepa que algo está procesándose.
 * ¿Impacto? disabled y isLoading comparten estilos de opacidad para señal visual clara.
 *           focus-visible:ring provee accesibilidad para usuarios de teclado (WCAG 2.1 AA).
 */
export default function Button({
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled ?? isLoading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={isLoading ? "true" : undefined}
      className={[
        // Base: padding, bordes, transición, focus ring accesible
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2",
        "text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        // Estado deshabilitado — señal visual clara
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Ancho completo cuando fullWidth=true
        fullWidth ? "w-full" : "",
        // Variante específica
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/*
        Spinner de carga: SVG animado que gira mientras isLoading=true.
        aria-hidden="true" porque el aria-busy del botón ya comunica el estado.
      */}
      {isLoading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
