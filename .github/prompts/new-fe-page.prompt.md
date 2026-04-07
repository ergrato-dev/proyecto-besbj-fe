---
description: "Crea una nueva página React para el frontend con TypeScript, TailwindCSS, manejo de rutas y test. Usar cuando se necesita una pantalla completa nueva (login, register, dashboard, etc.)."
name: "Nueva página React"
argument-hint: "Nombre de la página, ruta URL, si requiere autenticación, qué muestra/hace, qué API endpoints consume"
agent: "agent"
---

# Nueva página React — NN Auth System (Spring Boot)

Crea una nueva página siguiendo las convenciones del proyecto.

## Convenciones obligatorias

- **Nombre de archivo**: `NombrePage.tsx` en `fe/src/pages/`
- **JSDoc pedagógico al inicio**: ¿Qué? ¿Para qué? ¿Impacto?
- **Sin i18n**: los textos van directamente en español en el componente (sin `useTranslation()`)
- **Sin degradados**: `bg-gradient-*` está **PROHIBIDO**
- **Dark mode**: todas las clases de color deben tener variante `dark:`
- **Acento**: siempre `accent-*` — **NUNCA** hardcodear `amber-*` en componentes
- **Layout**: usar `AuthLayout` para páginas de autenticación, estructura directa para dashboards
- **Carga**: mostrar estado de loading mientras se espera la API
- **Errores**: mostrar feedback visual al usuario con el componente `Alert`

## Lo que debes generar

### 1. Componente de página (`fe/src/pages/NombrePage.tsx`)

Estructura esperada:

```tsx
/**
 * Archivo: NombrePage.tsx
 * ¿Qué? [descripción de la página]
 * ¿Para qué? [por qué existe esta pantalla en el flujo de auth]
 * ¿Impacto? [qué pasaría si no existiera o si tiene un bug]
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NombrePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ...

  return (
    // layout con soporte dark/light mode
  );
}
```

Para páginas de autenticación, usar `AuthLayout`:

```tsx
import { AuthLayout } from "../components/layout/AuthLayout";

export default function NombrePage() {
  return (
    <AuthLayout title="Título de la página">
      {/* formulario o contenido */}
    </AuthLayout>
  );
}
```

Referencia de páginas existentes:

- [fe/src/pages/LoginPage.tsx](../../../fe/src/pages/LoginPage.tsx) — login con token handling
- [fe/src/pages/RegisterPage.tsx](../../../fe/src/pages/RegisterPage.tsx) — registro con validación
- [fe/src/pages/DashboardPage.tsx](../../../fe/src/pages/DashboardPage.tsx) — página protegida

### 2. Registrar ruta en `App.tsx`

Localizar el bloque de rutas en [fe/src/App.tsx](../../../fe/src/App.tsx) y agregar:

**Página pública:**

```tsx
<Route path="/nueva-ruta" element={<NombrePage />} />
```

**Página protegida (requiere autenticación):**

```tsx
<Route
  path="/nueva-ruta"
  element={
    <ProtectedRoute>
      <NombrePage />
    </ProtectedRoute>
  }
/>
```

### 3. Test (`fe/src/__tests__/pages/NombrePage.test.tsx`)

Casos mínimos:

- La página renderiza sin errores
- Muestra el título/encabezado correcto
- Si tiene formulario: el submit llama a la función de API correcta
- Si está protegida: redirige a `/login` si no hay sesión
- Muestra mensaje de error cuando la API falla

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import NombrePage from "../../../pages/NombrePage";

// Mock de módulos de API
vi.mock("../../../api/auth", () => ({
  someApiFunction: vi.fn(),
}));

describe("NombrePage", () => {
  it("renders page title", () => {
    render(
      <MemoryRouter>
        <NombrePage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /título/i }),
    ).toBeInTheDocument();
  });

  it("calls API on submit", async () => {
    // ...
  });
});
```

## Patrones de consumo de la API

La API de Spring Boot corre en el puerto **8080**.
Usar siempre el cliente Axios configurado en [fe/src/api/axios.ts](../../../fe/src/api/axios.ts) que ya incluye los interceptores JWT.

Funciones de API disponibles en [fe/src/api/auth.ts](../../../fe/src/api/auth.ts):

- `login(email, password)` → `TokenResponse`
- `register(email, fullName, password)` → `UserResponse`
- `changePassword(currentPassword, newPassword)` → `MessageResponse`
- `forgotPassword(email)` → `MessageResponse`
- `resetPassword(token, newPassword)` → `MessageResponse`
- `verifyEmail(token)` → `MessageResponse`
- `getCurrentUser()` → `UserResponse`
- `refreshToken(refreshToken)` → `TokenResponse`

## Descripción de la página a crear

$input
