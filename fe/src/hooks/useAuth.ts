/**
 * Archivo: hooks/useAuth.ts
 * Descripción: Re-exportación del hook useAuth desde AuthContext.
 * ¿Para qué? Mantener la convención de que los hooks custom viven en src/hooks/.
 *            Los componentes importan desde 'hooks/useAuth' en lugar de
 *            'context/AuthContext' — si se mueve la lógica, solo cambia este archivo.
 * ¿Impacto? Sin esta separación, si un componente importa directamente desde
 *           AuthContext y luego la lógica se mueve, havría que actualizar
 *           todos los componentes que la importan.
 */
export { useAuth } from "../context/AuthContext";
export type { AuthContextType } from "../context/AuthContext";
