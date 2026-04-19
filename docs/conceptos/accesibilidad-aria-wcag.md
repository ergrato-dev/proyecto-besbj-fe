# Accesibilidad Web — ARIA y WCAG 2.1 en React

> Stack Frontend: React 19.2.4 | TypeScript 6 | TailwindCSS 4.2.2 | Vite 8
> Aplicable a: proyecto-besb-fe (Spring Boot backend) y proyecto-be-fe (FastAPI backend) — Frontend idéntico

---

## ¿Qué es la accesibilidad web?

La accesibilidad web significa que los sitios y aplicaciones web están diseñados y desarrollados de manera que personas con discapacidades puedan usarlos. Esto incluye personas con discapacidades visuales, auditivas, motoras y cognitivas.

**¿Por qué importa?**

1. **Ético:** El acceso a la información es un derecho humano.
2. **Legal:** Muchos países tienen leyes que requieren accesibilidad digital (Ley 1618 en Colombia, ADA en EE. UU., etc.).
3. **Técnico:** Los principios de accesibilidad mejoran el código y la experiencia de usuario para todos.
4. **SEO:** Los motores de búsqueda usan muchos de los mismos mecanismos que los lectores de pantalla.

---

## Estándar WCAG 2.1

Las **Web Content Accessibility Guidelines (WCAG) 2.1** son el estándar internacional de accesibilidad web mantenido por el W3C. Se organizan en 4 principios (POUR):

| Principio        | Descripción                                                        |
|------------------|--------------------------------------------------------------------|
| **Perceptible**  | El contenido debe ser presentable de maneras que los usuarios puedan percibir |
| **Operable**     | Los componentes de la interfaz deben ser operables (teclado, ratón, táctil) |
| **Comprensible** | La información y operación de la UI deben ser comprensibles        |
| **Robusto**      | El contenido debe ser suficientemente robusto para ser interpretado por tecnologías asistivas |

### Niveles de conformidad

| Nivel | Descripción                        | Requisito de este proyecto |
|-------|------------------------------------|---------------------------|
| **A** | Mínimo obligatorio                 | ✅ Cumplir 100%            |
| **AA** | Estándar recomendado para la web  | ✅ Cumplir 100%            |
| **AAA** | Máximo, muy exigente             | Esfuerzo razonable        |

**El objetivo de este proyecto es WCAG 2.1 AA.**

---

## Índice

1. [Atributos ARIA](#1-atributos-aria)
2. [Formularios Accesibles](#2-formularios-accesibles)
3. [Navegación por Teclado](#3-navegación-por-teclado)
4. [Contraste y Color](#4-contraste-y-color)
5. [Feedback y Estados](#5-feedback-y-estados)
6. [Componentes del Proyecto](#6-componentes-del-proyecto)
7. [Dark Mode y Accesibilidad](#7-dark-mode-y-accesibilidad)
8. [Testing de Accesibilidad](#8-testing-de-accesibilidad)
9. [Checklist WCAG 2.1 AA](#9-checklist-wcag-21-aa)

---

## 1. Atributos ARIA

**ARIA (Accessible Rich Internet Applications)** es un conjunto de atributos HTML que mejoran la semántica del DOM para tecnologías asistivas como lectores de pantalla (NVDA, JAWS, VoiceOver).

### 1.1 Cuándo usar ARIA

```
Regla #1 de ARIA: No usar ARIA si está disponible el HTML semántico nativo.

✅ Usar <button> en vez de <div role="button">
✅ Usar <nav> en vez de <div role="navigation">
✅ Usar <h1>-<h6> en vez de <p aria-level="1" role="heading">
✅ Usar <input type="text"> con <label> en vez de div custom con role="textbox"
```

### 1.2 Atributos ARIA más usados en formularios de auth

| Atributo                 | Uso en este proyecto                                       |
|--------------------------|-----------------------------------------------------------|
| `aria-label`             | Dar nombre a elementos sin label visible                   |
| `aria-labelledby`        | Asociar un elemento con su etiqueta usando id              |
| `aria-describedby`       | Asociar un campo con su mensaje de descripción/error       |
| `aria-invalid="true"`    | Indicar que un campo tiene un error de validación          |
| `aria-required="true"`   | Indicar que un campo es obligatorio                        |
| `aria-live="polite"`     | Anunciar cambios dinámicos (mensajes de éxito/error)       |
| `aria-busy="true"`       | Indicar que el contenido está cargando                     |
| `aria-expanded`          | Estado de elementos expandibles (menús, acordeones)        |
| `aria-hidden="true"`     | Ocultar elementos decorativos de lectores de pantalla      |
| `role="alert"`           | Anunciar errores o alertas de forma inmediata              |
| `role="status"`          | Anunciar mensajes de estado (éxito) de forma cortés        |

### 1.3 Ejemplo práctico — campo de email con error

```tsx
// ✅ Campo accesible con ARIA completo
function InputField({ id, label, error, required, ...props }) {
  const errorId = `${id}-error`;
  const hasError = !!error;

  return (
    <div>
      <label htmlFor={id}>
        {label}
        {/* Marca visible del campo requerido */}
        {required && <span aria-hidden="true"> *</span>}
        {/* Nota legible por lector de pantalla */}
        {required && <span className="sr-only">(requerido)</span>}
      </label>

      <input
        id={id}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...props}
      />

      {/* Mensaje de error asociado al campo */}
      {hasError && (
        <p id={errorId} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## 2. Formularios Accesibles

Los formularios son el corazón del NN Auth System (login, registro, etc.). Hacer formularios accesibles es la tarea más importante.

### 2.1 Reglas fundamentales para formularios

**Regla 1: Todo input debe tener un label asociado**

```tsx
// ✅ CORRECTO — Label asociado con htmlFor
<label htmlFor="email">Correo electrónico</label>
<input id="email" type="email" name="email" />

// ❌ INCORRECTO — Placeholder NO reemplaza al label
<input type="email" placeholder="Correo electrónico" />
// Los lectores de pantalla leen el placeholder, pero desaparece al escribir
// Usuarios mayores o con problemas cognitivos olvidan qué campo están llenando
```

**Regla 2: Mensajes de error asociados al campo**

```tsx
// ✅ CORRECTO — Error vinculado al campo específico
<input
  id="password"
  type="password"
  aria-invalid={hasError}
  aria-describedby="password-error"
/>
<p id="password-error" role="alert">
  La contraseña debe tener al menos 8 caracteres
</p>

// ❌ INCORRECTO — Error genérico sin asociar
<p style={{ color: "red" }}>Error en el formulario</p>
```

**Regla 3: Indicar campos requeridos**

```tsx
// ✅ Atributo HTML nativo + ARIA
<input
  type="email"
  required                    // Validación nativa del navegador
  aria-required="true"        // Accesibilidad para lectores de pantalla
/>
```

### 2.2 Estructura de formulario recomendada

```tsx
// LoginPage.tsx — Formulario de login accesible
function LoginPage() {
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <main>
      {/* Título principal — siempre h1 en la página principal */}
      <h1>Iniciar Sesión</h1>

      {/* Zona de mensajes dinámicos — leídos por lectores de pantalla */}
      <div aria-live="polite" aria-atomic="true">
        {generalError && (
          <div role="alert" className="...">
            {generalError}
          </div>
        )}
        {successMessage && (
          <div role="status" className="...">
            {successMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* noValidate usa validación custom en lugar de la nativa del navegador */}

        <div>
          <label htmlFor="email">
            Correo electrónico <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"          // Mejora UX con autocompletado
            aria-required="true"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" role="alert">{emailError}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">
            Contraseña <span aria-hidden="true">*</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"  // Mejora la integración con gestores de contraseñas
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}           // Indica que está procesando
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
    </main>
  );
}
```

### 2.3 Autocompletado — mejora UX y accesibilidad

Los gestores de contraseñas y el navegador pueden autocompletar campos si se usan los valores correctos de `autocomplete`:

```html
<!-- Registro -->
<input type="text"     autocomplete="name"              />  <!-- Nombre completo -->
<input type="email"    autocomplete="email"             />  <!-- Email -->
<input type="password" autocomplete="new-password"      />  <!-- Contraseña nueva -->

<!-- Login -->
<input type="email"    autocomplete="email"             />  <!-- Email -->
<input type="password" autocomplete="current-password"  />  <!-- Contraseña actual -->

<!-- Cambio de contraseña -->
<input type="password" autocomplete="current-password"  />  <!-- Contraseña actual -->
<input type="password" autocomplete="new-password"      />  <!-- Contraseña nueva -->
```

---

## 3. Navegación por Teclado

Muchos usuarios con discapacidades motoras o visuales navegan usando solo el teclado. El sistema debe ser 100% operable con teclado.

### 3.1 Teclas estándar de navegación

| Tecla          | Función                                             |
|----------------|-----------------------------------------------------|
| `Tab`          | Avanzar al siguiente elemento interactivo           |
| `Shift + Tab`  | Retroceder al elemento interactivo anterior         |
| `Enter`        | Activar botones, seguir links, enviar formularios   |
| `Space`        | Activar checkboxes, botones                         |
| `Escape`       | Cerrar modales, menús, dropdowns                    |
| `Flechas`      | Navegar dentro de componentes (radios, selects)     |

### 3.2 Focus visible — obligatorio WCAG 2.1 AA

```tsx
// tailwind.config.ts — Estilos de focus visibles
// TailwindCSS incluye estilos de focus por defecto.
// Asegurarse de NO usar outline: none sin un reemplazo accesible.

// ✅ CORRECTO — focus-visible para usuarios de teclado
className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"

// ❌ INCORRECTO — eliminar el focus ring sin reempla
className="focus:outline-none"   // Sin focus-visible alternativo → inaceptable
```

```css
/* index.css — Estilo de focus global consistente */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3.3 Orden de focus lógico

El orden de tab debe seguir el flujo visual de la página (de arriba a abajo, izquierda a derecha). No usar `tabindex` con valores positivos ya que altera el orden natural.

```tsx
// ✅ CORRECTO — Orden DOM = orden visual
<form>
  <input id="email" />      {/* Tab 1 */}
  <input id="password" />   {/* Tab 2 */}
  <button type="submit" />  {/* Tab 3 */}
</form>

// ❌ EVITAR — tabindex positivo rompe el orden natural
<input tabIndex={5} />   // Solo usar tabIndex={0} (incluir) o tabIndex={-1} (excluir)
```

### 3.4 Gestión de focus en modales

```tsx
// Modal accesible — atrapa el focus dentro del modal
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Mover el focus al primer elemento interactivo del modal
      modalRef.current?.querySelector<HTMLElement>(
        'button, input, a, [tabindex="0"]'
      )?.focus();
    }
  }, [isOpen]);

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <h2 id="modal-title">Título del Modal</h2>
      {children}
      <button onClick={onClose}>Cerrar</button>
    </div>
  ) : null;
}
```

---

## 4. Contraste y Color

### 4.1 Requisitos WCAG 2.1 AA de contraste

| Tipo de texto         | Ratio mínimo requerido |
|-----------------------|------------------------|
| Texto normal (< 18px) | 4.5 : 1                |
| Texto grande (≥ 18px o ≥ 14px bold) | 3 : 1  |
| Componentes UI (bordes, íconos) | 3 : 1          |

### 4.2 Paleta de colores recomendada (sin degradados — regla del proyecto)

```css
/* Colores para Light Mode */
--color-background: #ffffff;       /* Fondo */
--color-surface: #f9fafb;          /* Superficie de cards */
--color-text-primary: #111827;     /* Texto principal — ratio 16:1 sobre blanco */
--color-text-secondary: #6b7280;   /* Texto secundario — ratio 4.6:1 (PASS AA) */
--color-primary: #2563eb;          /* Azul — ratio 4.7:1 sobre blanco (PASS AA) */
--color-primary-hover: #1d4ed8;    /* Azul oscuro para hover */
--color-error: #dc2626;            /* Rojo error — ratio 4.9:1 sobre blanco */
--color-success: #16a34a;          /* Verde éxito — ratio 4.6:1 sobre blanco */
--color-border: #d1d5db;           /* Gris borde */

/* Colores para Dark Mode */
--color-background: #111827;       /* Fondo oscuro */
--color-surface: #1f2937;          /* Superficie de cards */
--color-text-primary: #f9fafb;     /* Texto principal claro — ratio 16:1 */
--color-text-secondary: #9ca3af;   /* Texto secundario — ratio 4.5:1 (PASS AA) */
--color-primary: #3b82f6;          /* Azul claro — ratio 4.6:1 sobre #1f2937 */
--color-primary-hover: #60a5fa;    
--color-error: #f87171;            /* Rojo claro — ratio 4.5:1 */
--color-success: #4ade80;          /* Verde claro — ratio 4.6:1 */
```

### 4.3 Regla del color — nunca solo color para transmitir información

```tsx
// ❌ INCORRECTO — Solo el color indica el error
<input className={error ? "border-red-500" : "border-gray-300"} />

// ✅ CORRECTO — Color + ícono + texto
<div className="relative">
  <input
    className={error ? "border-red-500 pr-10" : "border-gray-300"}
    aria-invalid={!!error}
  />
  {error && (
    <>
      {/* Ícono visible — aria-hidden porque el texto lo describe */}
      <ExclamationIcon className="absolute right-3 text-red-500" aria-hidden="true" />
      {/* Texto descriptivo asociado al campo */}
      <p role="alert" className="text-red-600 text-sm">{error}</p>
    </>
  )}
</div>
```

---

## 5. Feedback y Estados

### 5.1 Loading states accesibles

```tsx
// ✅ Botón con estado de carga accesible
<button
  type="submit"
  disabled={isLoading}
  aria-busy={isLoading}         // Anuncia a lectores de pantalla que está procesando
  aria-label={isLoading ? "Iniciando sesión, por favor espera..." : "Iniciar Sesión"}
>
  {isLoading ? (
    <>
      {/* Spinner visual — aria-hidden porque el texto lo describe */}
      <SpinnerIcon className="animate-spin" aria-hidden="true" />
      <span>Iniciando sesión...</span>
    </>
  ) : (
    "Iniciar Sesión"
  )}
</button>
```

### 5.2 Mensajes de éxito y error — Live Regions

```tsx
/**
 * ¿Qué? Las Live Regions (aria-live) anuncian automáticamente cambios al lector de pantalla.
 * ¿Para qué? Sin ellas, el usuario con lector de pantalla no sabría que
 *            apareció un mensaje de éxito o error dinámicamente.
 * ¿Impacto? El usuario quedaría desorientado sin saber si la acción tuvo efecto.
 */

// Zona de mensajes de error urgentes — se anuncia inmediatamente
<div aria-live="assertive" aria-atomic="true">
  {errorMessage && (
    <div role="alert" className="...">
      <ExclamationIcon aria-hidden="true" />
      {errorMessage}
    </div>
  )}
</div>

// Zona de mensajes de éxito — se anuncia en el siguiente turno (no interrumpe)
<div aria-live="polite" aria-atomic="true">
  {successMessage && (
    <div role="status" className="...">
      <CheckIcon aria-hidden="true" />
      {successMessage}
    </div>
  )}
</div>
```

### 5.3 Diferencia entre `role="alert"` y `role="status"`

| Role         | `aria-live` implícito | Cuándo usar                                    |
|--------------|----------------------|------------------------------------------------|
| `role="alert"`  | `assertive`       | Errores urgentes — interrumpe al lector de pantalla |
| `role="status"` | `polite`          | Mensajes de éxito — espera pausa en el lector  |

---

## 6. Componentes del Proyecto

### 6.1 `InputField` — Componente reutilizable accesible

```tsx
/**
 * Archivo: components/ui/InputField.tsx
 * Descripción: Campo de formulario accesible con label, validación y mensaje de error.
 * ¿Para qué? Unificar la implementación de accesibilidad en un solo componente
 *            para que todos los formularios sean automáticamente accesibles.
 * ¿Impacto? Sin un componente unificado, cada formulario podría implementar la
 *           accesibilidad de forma diferente o ignorarla completamente.
 */
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;  // Texto de ayuda bajo el campo
}

export function InputField({ id, label, error, hint, required, ...props }: InputFieldProps) {
  const errorId = `${id}-error`;
  const hintId  = `${id}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint  ? hintId  : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-red-500 ml-1">*</span>
            <span className="sr-only"> (requerido)</span>
          </>
        )}
      </label>

      <input
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`
          w-full px-3 py-2 rounded-md border
          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none
          ${error ? "border-red-500" : "border-gray-300"}
        `}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 6.2 `Button` — Componente de botón accesible

```tsx
/**
 * Archivo: components/ui/Button.tsx
 * Descripción: Botón reutilizable con estados de loading, disabled y variantes accesibles.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ isLoading, disabled, children, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={`
        px-4 py-2 rounded-md font-medium
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500" : ""}
        ${variant === "secondary" ? "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500" : ""}
        ${variant === "danger" ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500" : ""}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Procesando...</span>
        </span>
      ) : children}
    </button>
  );
}
```

### 6.3 Navegación principal accessible — `Navbar`

```tsx
// components/layout/Navbar.tsx
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header role="banner">
      <nav role="navigation" aria-label="Navegación principal">
        <a href="/" aria-label="Ir a la página de inicio — NN Auth System">
          <img src="/logo.svg" alt="NN Auth System" />
        </a>

        {/* Botón de menú móvil */}
        <button
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <CloseIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
        </button>

        {/* Links de navegación */}
        <ul
          id="main-menu"
          role="list"
          aria-hidden={!menuOpen}
        >
          <li><a href="/login">Iniciar Sesión</a></li>
          <li><a href="/register">Registrarse</a></li>
        </ul>
      </nav>
    </header>
  );
}
```

---

## 7. Dark Mode y Accesibilidad

### 7.1 Implementación con TailwindCSS 4 y `prefers-color-scheme`

```tsx
// App.tsx — Detectar preferencia del sistema operativo
function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Preferencia guardada o del sistema
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Aplicar clase al <html> para que TailwindCSS reactive el modo oscuro
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div>
      <button
        onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
        aria-pressed={theme === "dark"}
        aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
      >
        {theme === "light" ? <MoonIcon aria-hidden="true" /> : <SunIcon aria-hidden="true" />}
        <span className="sr-only">Modo {theme === "light" ? "oscuro" : "claro"}</span>
      </button>
    </div>
  );
}
```

```css
/* tailwind.config.ts */
export default {
  darkMode: "class",    // Usa la clase 'dark' en <html> para activar dark mode
  // ...
}
```

### 7.2 Mantener contraste en ambos modos

```tsx
// ✅ Usar variantes dark: de Tailwind para invertir colores apropiadamente
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">
    Texto con contraste suficiente en ambos modos
  </p>
  <input className="
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    border-gray-300 dark:border-gray-600
    focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
  " />
</div>
```

---

## 8. Testing de Accesibilidad

### 8.1 Testing automatizado con `@testing-library/react`

Testing Library promueve el testeo con queries accesibles (por role, label, etc.) en lugar de por selectores CSS o IDs. Esto garantiza que los tests también verifiquen accesibilidad.

```tsx
// __tests__/LoginPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginPage } from "../pages/LoginPage";

describe("LoginPage — Accesibilidad", () => {

  it("debe tener un heading principal", () => {
    render(<LoginPage />);
    // ✅ getByRole usa semántica — verifica h1/h2
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("el campo de email debe tener un label", () => {
    render(<LoginPage />);
    // ✅ getByLabelText verifica la asociación label-input
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it("debe anunciar el error cuando el email es inválido", async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/correo electrónico/i);

    fireEvent.change(emailInput, { target: { value: "invalido" } });
    fireEvent.blur(emailInput);

    // ✅ getByRole("alert") verifica que el error sea anunciado por lectores de pantalla
    expect(await screen.findByRole("alert")).toHaveTextContent(/email inválido/i);
  });

  it("el formulario debe ser navigable por teclado", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/correo/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });

    // Verificar que todos los elementos críticos están en el DOM
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
});
```

### 8.2 Librerías de testing de accesibilidad

```bash
# Instalar jest-axe para detección automática de violaciones WCAG
pnpm add -D jest-axe @types/jest-axe
```

```tsx
// Ejemplo con jest-axe
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

it("LoginPage no debe tener violaciones de accesibilidad", async () => {
  const { container } = render(<LoginPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 8.3 Herramientas manuales de testing

| Herramienta            | Tipo        | Uso                                                |
|------------------------|------------|-----------------------------------------------------|
| axe DevTools           | Extensión  | Análisis automático de violaciones WCAG en el browser |
| WAVE                   | Extensión  | Visualización de estructura ARIA y errores          |
| Lighthouse (Chrome)    | Integrado  | Audit de Accesibilidad con score y recomendaciones  |
| NVDA (Windows)         | Lector pantalla | Testing manual de experiencia real              |
| VoiceOver (macOS/iOS)  | Lector pantalla | Testing manual en dispositivos Apple            |
| TalkBack (Android)     | Lector pantalla | Testing manual en Android                      |

---

## 9. Checklist WCAG 2.1 AA

Usar antes de cada deploy:

### Perceptible (1.x)
- [ ] Todos los `<img>` tienen atributo `alt` descriptivo (o `alt=""` si son decorativas)
- [ ] Los íconos decorativos tienen `aria-hidden="true"`
- [ ] Los íconos funcionales tienen `aria-label` o texto oculto con clase `sr-only`
- [ ] El contraste de texto normal (< 18px) es ≥ 4.5:1
- [ ] El contraste de texto grande (≥ 18px) es ≥ 3:1
- [ ] La información no se transmite solo mediante color
- [ ] Los videos/audios tienen subtítulos o transcripciones (si aplica)

### Operable (2.x)
- [ ] Todo el contenido es operable con teclado (sin trampas de teclado)
- [ ] El foco es visible en todos los elementos interactivos (`focus-visible`)
- [ ] El orden de tabbing es lógico (sigue el orden visual)
- [ ] No hay `tabIndex` con valores positivos
- [ ] Los modales atrapan el foco y se cierran con Escape
- [ ] Los usuarios tienen suficiente tiempo para completar tareas (no hay timeouts agresivos)

### Comprensible (3.x)
- [ ] El idioma de la página está definido en `<html lang="es">`
- [ ] Los labels de los formularios describen claramente el campo
- [ ] Los mensajes de error son descriptivos (no solo "Error")
- [ ] Los mensajes de error sugieren cómo corregirlos
- [ ] Los campos requeridos están marcados de forma consistente
- [ ] `autocomplete` está configurado en campos de formulario estándar

### Robusto (4.x)
- [ ] El HTML es válido (sin errores en el validador W3C)
- [ ] Todos los elementos de UI tienen un nombre accesible (label, aria-label, o aria-labelledby)
- [ ] Los cambios de estado se anuncian con `aria-live`, `role="alert"`, o `role="status"`
- [ ] Los componentes custom usan los roles ARIA correctos

---

*Documentación de accesibilidad para el proyecto NN Auth System.*
*Aplica al frontend React — idéntico en proyecto-besb-fe (Spring Boot) y proyecto-be-fe (FastAPI).*
*Ver [owasp-top-10.md](owasp-top-10.md) para la guía de seguridad.*
