# Design System — NN Auth System (Spring Boot Java)

> Proyecto: NN Auth System — Spring Boot Edition
> Acento: **amber** | Hex referencia: `#d97706`
> Stack: Spring Boot 3 (Java 21) + React + TailwindCSS 4

---

## 1. Sistema de Identidad Visual por Stack

La serie educativa NN Auth System tiene **una variante por backend**, y cada una usa
un color de acento distinto para que sea visualmente evidente qué stack estás ejecutando.
Esto facilita el aprendizaje comparativo sin tener que leer el código.

### Tabla completa de identidades

| Stack                  | Proyecto               | Acento Tailwind | Hex referencia |
|------------------------|------------------------|-----------------|----------------|
| FastAPI (Python)       | `proyecto-be-fe`       | `emerald`       | `#059669`      |
| Express.js (Node)      | `proyecto-beex-fe`     | `blue`          | `#2563eb`      |
| Next.js (fullstack)    | `proyecto-be-fe-next`  | `violet`        | `#7c3aed`      |
| **Spring Boot (Java)** | **`proyecto-besb-fe`** | **`amber`**     | **`#d97706`**  |
| Spring Boot (Kotlin)   | `proyecto-besbk-fe`    | `fuchsia`       | `#c026d3`      |
| Go REST API            | `proyecto-bego-fe`     | `cyan`          | `#0891b2`      |

> Este archivo documenta la implementación para **Spring Boot Java → amber**.

---

## 2. Arquitectura del Token `accent-*`

### Por qué tokens y no colores directos

Si los componentes usaran `amber-600` directamente:
- Cambiar el acento requeriría editar **decenas de archivos**
- Al comparar proyectos, el código de componentes se vería diferente aunque la lógica sea idéntica
- Un estudiante no podría reutilizar un componente entre variantes sin modificarlo

Con el token `accent-*`:
- Cambiar el acento **solo requiere editar `index.css`** (11 líneas)
- El código de todos los componentes es **100% idéntico** entre proyectos
- Un componente `Button` del proyecto FastAPI funciona sin cambios en Spring Boot

### Implementación TailwindCSS v4

TailwindCSS v4 introduce `@theme inline`, que permite crear alias de variables CSS:

```css
/* fe/src/index.css */
@theme inline {
  --color-accent-50:  var(--color-amber-50);
  --color-accent-100: var(--color-amber-100);
  --color-accent-200: var(--color-amber-200);
  --color-accent-300: var(--color-amber-300);
  --color-accent-400: var(--color-amber-400);
  --color-accent-500: var(--color-amber-500);
  --color-accent-600: var(--color-amber-600);  /* botones primarios */
  --color-accent-700: var(--color-amber-700);  /* hover de botones */
  --color-accent-800: var(--color-amber-800);
  --color-accent-900: var(--color-amber-900);
  --color-accent-950: var(--color-amber-950);
}
```

Esto hace que `bg-accent-600`, `text-accent-400`, `border-accent-300`, etc.
sean clases de Tailwind válidas que apuntan automáticamente a los valores amber.

---

## 3. Uso Correcto del Token

### En componentes React/TSX

```tsx
// ✅ CORRECTO — siempre accent-*, nunca amber-*
const Button = ({ children, ...props }) => (
  <button
    className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg"
    {...props}
  >
    {children}
  </button>
);

// ✅ CORRECTO — links de navegación
<a className="text-accent-600 hover:text-accent-700 underline">
  Olvidé mi contraseña
</a>

// ✅ CORRECTO — bordes de focus
<input className="focus:ring-2 focus:ring-accent-500 focus:border-accent-500" />

// ✅ CORRECTO — íconos o badges
<span className="bg-accent-100 text-accent-800 px-2 py-0.5 rounded">
  Spring Boot
</span>
```

```tsx
// ❌ NUNCA — colores del stack hardcodeados
<button className="bg-amber-600 hover:bg-amber-700">...</button>
<a className="text-amber-500">...</a>
<span className="bg-amber-100 text-amber-800">...</span>
```

### Cuándo NO usar `accent-*`

Los colores semánticos **no deben cambiar** entre proyectos. Úsalos directamente:

| Semántica    | Clases Tailwind          | Cuándo usar                          |
|--------------|--------------------------|--------------------------------------|
| Éxito        | `green-*`                | Operación exitosa, email enviado     |
| Error        | `red-*`                  | Validación fallida, error de API     |
| Advertencia  | `yellow-*`               | Token próximo a expirar, aviso       |
| Información  | `blue-*`                 | Mensajes neutros informativos        |
| Texto base   | `gray-*` / `slate-*`     | Texto de contenido, labels           |

```tsx
// ✅ CORRECTO — semánticos van directos
<div role="alert" className="text-red-600 bg-red-50 border border-red-200">
  Contraseña incorrecta.
</div>

<div className="text-green-600 bg-green-50 border border-green-200">
  Email verificado correctamente.
</div>
```

---

## 4. Logo SVG — Colores para Amber

El componente `Logo.tsx` renderiza un SVG con el badge de la letra "N".
Los colores del SVG se hardcodean dentro del componente (no pueden ser tokens CSS
en todos los contextos SVG) y deben corresponderse con el acento del proyecto.

### Especificación para Spring Boot Java (amber)

| Elemento            | Atributo SVG         | Valor          | Color Tailwind |
|---------------------|----------------------|----------------|----------------|
| Borde exterior badge | `stroke="#d97706"`  | amber-600      | `accent-600`   |
| Trazos de la "N"    | `stroke="#fbbf24"`   | amber-400      | `accent-400`   |
| Relleno badge (dark) | `fill="#78350f"`    | amber-900      | `accent-900`   |
| Relleno badge (light) | `fill="#fffbeb"`   | amber-50       | `accent-50`    |

### Fragmento del componente Logo.tsx

```tsx
// fe/src/components/ui/Logo.tsx
// Los colores SVG usan hex directamente porque los tokens CSS
// no siempre funcionan en atributos SVG en todos los navegadores.
// Estos valores deben mantenerse sincronizados con el acento del proyecto.

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Borde del badge — amber-600 */}
      <rect
        x="2" y="2" width="44" height="44" rx="12"
        stroke="#d97706"
        strokeWidth="2.5"
        className="fill-amber-50 dark:fill-amber-900"
      />
      {/* Trazos de la letra N — amber-400 */}
      <path
        d="M14 34V14L24 30L34 14V34"
        stroke="#fbbf24"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

---

## 5. Paleta Amber — Referencia Completa

| Token      | Variable CSS                 | Hex     | Uso típico                        |
|------------|------------------------------|---------|-----------------------------------|
| accent-50  | `--color-amber-50`           | #fffbeb | Fondos de badges informativos     |
| accent-100 | `--color-amber-100`          | #fef3c7 | Fondos de inputs con foco light   |
| accent-200 | `--color-amber-200`          | #fde68a | Bordes de cards seleccionados     |
| accent-300 | `--color-amber-300`          | #fcd34d | Íconos decorativos                |
| accent-400 | `--color-amber-400`          | #fbbf24 | Trazos del logo, íconos activos   |
| accent-500 | `--color-amber-500`          | #f59e0b | Ring de focus, estados hover light |
| accent-600 | `--color-amber-600`          | #d97706 | **Botones primarios (fondo)**     |
| accent-700 | `--color-amber-700`          | #b45309 | **Hover de botones**              |
| accent-800 | `--color-amber-800`          | #92400e | Texto dark en fondos claros       |
| accent-900 | `--color-amber-900`          | #78350f | Fondos de badges dark mode        |
| accent-950 | `--color-amber-950`          | #451a03 | Texto sobre fondos muy claros     |

---

## 6. Dark Mode

Los componentes deben funcionar correctamente en ambos modos usando el prefijo `dark:` de Tailwind.
TailwindCSS v4 usa la estrategia `class` por defecto (toggle manual via JS), compatible con
el hook `useTheme` del proyecto.

### Patrones comunes

```tsx
// Botón primario con dark mode
<button className="
  bg-accent-600 hover:bg-accent-700
  dark:bg-accent-500 dark:hover:bg-accent-600
  text-white font-medium px-4 py-2 rounded-lg
  transition-colors duration-150
">
  Iniciar sesión
</button>

// Card / superficie
<div className="
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  rounded-xl p-6
">
  Contenido
</div>

// Link de acento
<a className="
  text-accent-600 dark:text-accent-400
  hover:text-accent-700 dark:hover:text-accent-300
  underline underline-offset-2
">
  ¿Olvidaste tu contraseña?
</a>
```

---

## 7. Tipografía

```css
/* fe/src/index.css — junto al bloque @theme */
/* Importar fuente Inter desde Google Fonts o bundler */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}
```

| Elemento         | Clase Tailwind                        |
|------------------|---------------------------------------|
| Headings h1      | `text-3xl font-bold text-gray-900 dark:text-white` |
| Headings h2      | `text-2xl font-semibold`              |
| Texto de cuerpo  | `text-base text-gray-700 dark:text-gray-300` |
| Labels de inputs | `text-sm font-medium text-gray-700 dark:text-gray-200` |
| Texto auxiliar   | `text-sm text-gray-500 dark:text-gray-400` |
| Error de campo   | `text-sm text-red-600 dark:text-red-400` |

> Regla: **SIN degradados** (no `bg-gradient-*`, no `text-gradient`) en ningún componente.

---

## 8. Componentes Base — Clases de Referencia

### InputField

```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
    Email
  </label>
  <input
    type="email"
    className="
      w-full px-3 py-2 rounded-lg
      border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-gray-100
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      focus:outline-none focus:ring-2 focus:ring-accent-500
      focus:border-accent-500
      disabled:opacity-50 disabled:cursor-not-allowed
    "
  />
  {/* Error */}
  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
    Mensaje de error
  </p>
</div>
```

### Alert / Feedback

```tsx
// Error
<div role="alert" className="
  flex items-start gap-3 p-4 rounded-lg
  bg-red-50 dark:bg-red-900/20
  border border-red-200 dark:border-red-800
  text-red-700 dark:text-red-300 text-sm
">
  Mensaje de error
</div>

// Éxito
<div role="status" className="
  flex items-start gap-3 p-4 rounded-lg
  bg-green-50 dark:bg-green-900/20
  border border-green-200 dark:border-green-800
  text-green-700 dark:text-green-300 text-sm
">
  Operación exitosa
</div>
```

---

## 9. Cómo Clonar Este Proyecto para Otro Stack

Si estás creando una nueva variante (ej. Go → `cyan`), estos son los únicos 4 pasos
de cambio de tema:

### Paso 1 — `fe/src/index.css`

Cambiar `amber` por el nuevo color (ej. `cyan`) en todas las líneas del bloque `@theme inline`:

```css
/* Antes (Spring Boot Java — amber) */
--color-accent-600: var(--color-amber-600);

/* Después (Go REST API — cyan) */
--color-accent-600: var(--color-cyan-600);
```

### Paso 2 — `fe/src/components/ui/Logo.tsx`

Cambiar los valores hex del SVG. Para cyan:
- `stroke="#d97706"` → `stroke="#0891b2"` (cyan-600)
- `stroke="#fbbf24"` → `stroke="#22d3ee"` (cyan-400)

### Paso 3 — Documentación

Actualizar este archivo `design-system.md` y `architecture.md` con el nuevo stack activo
en la tabla de identidades.

### Paso 4 — Verificación visual

```bash
cd fe
pnpm dev
# Abrir http://localhost:5173 — todos los botones, links y acentos deben mostrarse en cyan
```

---

## 10. Verificación de Tema Correcto

Antes de hacer `git commit`, verificar que ningún componente use colores hardcodeados del stack:

```bash
# Buscar usos directos de amber en componentes (debería dar 0 resultados en src/)
grep -r "amber-" fe/src/components/ fe/src/pages/ fe/src/context/ fe/src/hooks/

# Solo debe aparecer amber en: Logo.tsx, index.css, y posiblemente __tests__
# Cualquier otro resultado es un bug de tema
```

```bash
# Verificar que accent-* esté disponible
grep -r "accent-" fe/src/ | head -20
# Debe mostrar múltiples referencias de componentes usando accent-*
```
