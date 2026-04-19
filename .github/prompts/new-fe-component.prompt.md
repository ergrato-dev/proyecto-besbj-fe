---
description: "Crea un nuevo componente UI reutilizable para el frontend con TypeScript, TailwindCSS, soporte dark/light mode y test. Usar cuando se necesite un componente que se usará en múltiples páginas."
name: "Nuevo componente UI"
argument-hint: "Describe el componente: nombre, qué renderiza, qué props recibe, comportamiento interactivo"
agent: "agent"
---

# Nuevo componente UI reutilizable — NN Auth System (Spring Boot)

Crea un componente React reutilizable siguiendo las convenciones del proyecto.

## Convenciones obligatorias

- **Componentes**: funcionales con hooks, `PascalCase` en nombre y archivo
- **Tipos**: `interface` para props (sufijo `Props`), `type` para uniones
- **TailwindCSS**: única fuente de estilos — sin CSS modules, sin `style={{}}` inline
- **Dark mode**: todas las clases de color deben tener variante `dark:`
- **Sin degradados**: `bg-gradient-*` está **PROHIBIDO**
- **Fuente**: sans-serif exclusivamente (`font-sans`, nunca `font-serif`)
- **Transiciones**: `transition-colors duration-200` en elementos interactivos
- **Acento**: siempre `accent-*` — **NUNCA** hardcodear `amber-*` en componentes

## Lo que debes generar

### 1. Componente (`fe/src/components/ui/NombreComponente.tsx`)

Estructura esperada:

```tsx
/**
 * Archivo: NombreComponente.tsx
 * ¿Qué? [descripción del componente]
 * ¿Para qué? [por qué existe este componente]
 * ¿Impacto? [qué pasaría si no existiera o si tiene un bug]
 */

interface NombreComponenteProps {
  /** [descripción en español de la prop] */
  propA: string;
  /** [descripción en español de la prop opcional] */
  propB?: boolean;
}

export function NombreComponente({
  propA,
  propB = false,
}: NombreComponenteProps) {
  // ...
}
```

Referencia de componentes existentes:

- [fe/src/components/ui/Button.tsx](../../../fe/src/components/ui/Button.tsx) — botón con variantes
- [fe/src/components/ui/InputField.tsx](../../../fe/src/components/ui/InputField.tsx) — input con label y error
- [fe/src/components/ui/Alert.tsx](../../../fe/src/components/ui/Alert.tsx) — alerta con variantes semánticas

### 2. Exportar desde el barrel index (si existe `fe/src/components/ui/index.ts`)

Agregar: `export { NombreComponente } from './NombreComponente';`

### 3. Test (`fe/src/__tests__/components/NombreComponente.test.tsx`)

Casos mínimos:

- Renderiza correctamente con props mínimas
- Renderiza correctamente con todas las variantes/estados posibles
- Ejecuta callbacks (`onClick`, `onChange`, etc.) correctamente
- Si tiene texto: los textos son accesibles (roles, labels)

Usar `render`, `screen`, `fireEvent` / `userEvent` de Testing Library.

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NombreComponente } from "../../../components/ui/NombreComponente";

describe("NombreComponente", () => {
  it("renders correctly with minimum props", () => {
    render(<NombreComponente propA="value" />);
    expect(screen.getByText("value")).toBeInTheDocument();
  });
});
```

## Accesibilidad obligatoria

- Inputs: `<label htmlFor>` + `id` en el input
- Botones: texto visible o `aria-label` descriptivo
- Alertas/mensajes de error: `role="alert"`
- Imágenes decorativas: `alt=""`; imágenes informativas: `alt` descriptivo
- Focus visible en elementos interactivos (`focus:ring-2 focus:ring-accent-500`)

## Paleta de colores del sistema

Usar las clases semánticas ya establecidas en el proyecto:

- **Fondo**: `bg-white dark:bg-gray-900` / `bg-gray-50 dark:bg-gray-800`
- **Texto principal**: `text-gray-900 dark:text-gray-100`
- **Texto secundario**: `text-gray-600 dark:text-gray-400`
- **Bordes**: `border-gray-200 dark:border-gray-700`
- **Acento / acción primaria**: `bg-accent-600 hover:bg-accent-700 dark:bg-accent-500`
- **Error**: `text-red-600 dark:text-red-400` / `border-red-500`
- **Éxito**: `text-green-600 dark:text-green-400`

> El acento es **amber** en este proyecto (Spring Boot Java).
> Ver `docs/referencia-tecnica/design-system.md` para la referencia completa.

## Descripción del componente a crear

$input
