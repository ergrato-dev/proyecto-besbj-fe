# HU-007 — Cierre de Sesión (Logout)

**Como** usuario autenticado,
**quiero** cerrar mi sesión,
**para** que mis tokens dejen de ser válidos y otro usuario no pueda acceder
a mi cuenta en el mismo dispositivo.

---

## Criterios de Aceptación

**CA-007.1** — El botón de logout está visible en la barra de navegación
cuando el usuario está autenticado.

**CA-007.2** — Al hacer logout, los tokens (`access_token` y `refresh_token`)
son eliminados del estado de la aplicación React.

**CA-007.3** — Tras el logout, el usuario es redirigido a `/login`.

**CA-007.4** — Tras el logout, intentar acceder a rutas protegidas
redirige automáticamente a `/login` (Route Guard activo).

**CA-007.5** — El logout es una operación del lado del cliente — no requiere
llamada al backend en esta versión (los tokens siguen siendo técnicamente válidos
hasta que expiran, pero ya no están en memoria).

---

## Implementación

El logout en esta versión es **stateless** (solo cliente):

```typescript
// hooks/useAuth.ts
const logout = () => {
  setUser(null);
  setAccessToken(null);
  // El refresh_token almacenado también se limpia
  // No hay llamada al backend porque JWT es stateless por diseño
};
```

---

## Notas técnicas

- **No existe endpoint `POST /api/v1/auth/logout`** en esta versión inicial.
  La invalidación de tokens en el servidor requeriría una lista negra (token blacklist)
  en la BD, lo que complica el esquema y va contra la naturaleza stateless del JWT.
- Como mejora futura puede implementarse un endpoint de revocación de refresh tokens.
- La expiración corta del `access_token` (15 min) limita el riesgo de esta decisión.
- Ver `_docs/referencia-tecnica/api-endpoints.md` para la tabla completa de endpoints.
