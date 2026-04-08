/**
 * Archivo: components/ui/Alert.tsx
 * Descripción: Componente de mensaje de alerta para feedback al usuario.
 * ¿Para qué? Mostrar mensajes de éxito o error después de operaciones de auth
 *            (login fallido, registro exitoso, etc.) de forma consistente.
 * ¿Impacto? role="alert" es esencial para accesibilidad — los lectores de pantalla
 *           anuncian automáticamente el contenido del alert cuando aparece,
 *           sin que el usuario pierda el foco del formulario.
 */

import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  /** Tipo visual y semántico de la alerta */
  variant?: AlertVariant;
  /** Contenido del mensaje */
  children: ReactNode;
  /** Clases adicionales */
  className?: string;
  /** Callback para cerrar/descartar la alerta. Muestra un botón X cuando se provee */
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  error:
    "bg-red-50 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-300",
  success:
    "bg-green-50 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-300",
  info: "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300",
  warning:
    "bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-300",
};

const variantIcons: Record<AlertVariant, string> = {
  error: "✕",
  success: "✓",
  info: "ℹ",
  warning: "⚠",
};

/**
 * ¿Qué? Caja de alerta con color semántico, icono y mensaje.
 * ¿Para qué? Dar feedback visual al usuario sobre el resultado de una operación.
 * ¿Impacto? role="alert" garantiza que el lector de pantalla anuncie el mensaje
 *           al usuario aunque el foco esté en el botón submit.
 *           aria-live="polite" es equivalente pero para actualizaciones no críticas;
 *           role="alert" implica aria-live="assertive" — correcto para errores de auth.
 */
export default function Alert({
  variant = "error",
  children,
  className = "",
  onClose,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Icono semántico — aria-hidden porque el texto ya comunica el mensaje */}
      <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold">
        {variantIcons[variant]}
      </span>
      <span className="flex-1">{children}</span>
      {/*
        Botón de cierre opcional. Solo se renderiza cuando se provee onClose.
        ¿Para qué? Permite al usuario descartar el mensaje de error manualmente.
        ¿Impacto? Mejora UX en formularios con varios intentos (ej. registro).
      */}
      {onClose && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="ml-auto shrink-0 opacity-60 hover:opacity-100 focus-visible:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
}
