# HU-008 — Landing Page y Páginas Públicas

**Como** visitante del sitio,
**quiero** ver una página de presentación clara del sistema,
**para** entender qué es NN Auth System, qué stack usa y cómo puedo comenzar.

---

## Criterios de Aceptación

### Landing Page (`/`)

**CA-008.1** — La landing page muestra el logo SVG del proyecto con los colores
amber (Spring Boot Java — acento del proyecto).

**CA-008.2** — La landing page incluye una sección que describe brevemente
el propósito del sistema (autenticación educativa).

**CA-008.3** — La landing page muestra la pila tecnológica del proyecto:
Spring Boot 3 (Java 21), React, TypeScript, TailwindCSS 4, PostgreSQL 17.

**CA-008.4** — La landing page tiene dos CTAs visibles:
- "Crear cuenta" → `/register`
- "Iniciar sesión" → `/login`

**CA-008.5** — Si el usuario ya está autenticado y visita `/`, es redirigido
a `/dashboard`.

**CA-008.6** — La landing page tiene un footer con enlaces a páginas legales.

### Páginas Legales

**CA-008.7** — Existe una página de Términos de Uso (`/terminos`) con contenido
genérico apropiado para un sistema de autenticación educativo.

**CA-008.8** — Existe una página de Política de Privacidad (`/privacidad`)
que explica qué datos se recogen (email, nombre) y cómo se usan.

**CA-008.9** — Existe una página de Política de Cookies (`/cookies`)
que indica que la app no usa cookies de rastreo.

### Página de Contacto

**CA-008.10** — Existe una página de Contacto (`/contacto`) con un formulario
de nombre, email y mensaje.

**CA-008.11** — El formulario de contacto valida los campos en el cliente
antes de simular el envío (no requiere endpoint backend en esta versión).

### Tema Visual

**CA-008.12** — Todas las páginas usan el sistema de tokens `accent-*` (amber)
para los botones, links y elementos de acento — nunca `amber-*` directamente.

**CA-008.13** — Todas las páginas soportan dark mode y light mode con toggle visible.

**CA-008.14** — El diseño es responsive (funcional desde 320px de ancho).

---

## Páginas involucradas

| Ruta         | Componente               | Autenticación |
|--------------|--------------------------|---------------|
| `/`          | `LandingPage.tsx`        | No (pública)  |
| `/terminos`  | `TerminosDeUsoPage.tsx`  | No (pública)  |
| `/privacidad`| `PoliticaPrivacidadPage.tsx` | No (pública) |
| `/cookies`   | `PoliticaCookiesPage.tsx`| No (pública)  |
| `/contacto`  | `ContactPage.tsx`        | No (pública)  |

---

## Notas técnicas

- Ver `docs/referencia-tecnica/design-system.md` para los colores del logo SVG
  y las reglas del token `accent-*`
- El toggle de dark/light mode está en `Navbar` o `LandingPage` según el layout
- React Router 7+ maneja la navegación entre páginas públicas y protegidas
