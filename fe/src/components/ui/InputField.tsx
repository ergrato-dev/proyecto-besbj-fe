/**
 * Archivo: components/ui/InputField.tsx
 * Descripción: Componente de campo de formulario con label, input y mensaje de error.
 * ¿Para qué? Estandarizar todos los inputs de los formularios de auth.
 *            Incluye label, input y mensaje de error integrados para no repetir
 *            la misma estructura HTML en cada formulario.
 * ¿Impacto? El atributo htmlFor en <label> y el id en <input> los vinculas para
 *           accesibilidad — los lectores de pantalla leen el label al hacer foco
 *           en el input. Sin este vínculo, el formulario no es accesible (WCAG 2.1 AA).
 */

import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Texto del label visible encima del input */
  label: string;
  /** id único — vincula el label con el input (accesibilidad) */
  id: string;
  /** Mensaje de error de validación. Si está presente, el input muestra borde rojo. */
  error?: string;
}

/**
 * ¿Qué? Campo de formulario con label, input y error integrados.
 * ¿Para qué? Los formularios de auth (login, registro, reset) necesitan
 *            el mismo patrón repetidamente — este componente lo encapsula.
 * ¿Impacto? aria-invalid y aria-describedby comunican el error a lectores de pantalla.
 *           role="alert" en el mensaje de error lo anuncia automáticamente cuando aparece.
 */
export default function InputField({
  label,
  id,
  error,
  className = "",
  ...props
}: InputFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      {/* Label — siempre visible para accesibilidad (nunca usar placeholder como sustituto) */}
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      {/*
        Input con estados visual: normal, focus, error.
        ring en focus: accesibilidad WCAG 2.1 AA — el usuario de teclado sabe
        dónde está el foco. Sin el ring, no se puede usar el formulario con teclado.
      */}
      <input
        id={id}
        aria-invalid={error !== undefined ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm",
          "bg-white text-gray-900 placeholder-gray-400",
          "dark:bg-gray-800 dark:text-white dark:placeholder-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent-500",
          "transition-colors duration-150",
          // Borde rojo si hay error, borde gris si no
          error
            ? "border-red-500 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />

      {/*
        Mensaje de error — role="alert" lo anuncia al lector de pantalla
        en cuanto aparece, sin que el usuario mueva el foco manualmente.
      */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
