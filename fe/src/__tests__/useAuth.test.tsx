/**
 * Archivo: src/__tests__/useAuth.test.tsx
 * Descripción: Tests para el hook useAuth y el AuthProvider.
 * ¿Para qué? Verificar que useAuth lanza un error claro al usarse fuera del
 *            AuthProvider, y que dentro del Provider devuelve el estado correcto
 *            (user=null, isAuthenticated=false) cuando no hay sesión activa.
 * ¿Impacto? useAuth es consumido por casi todos los componentes (Navbar,
 *           ProtectedRoute, páginas de auth). Si falla silenciosamente fuera
 *           del Provider, los bugs serían difíciles de diagnosticar.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { AuthProvider } from "../context/AuthContext";

// Mockeamos las funciones de la API para evitar llamadas HTTP reales durante tests.
// AuthProvider llama a refreshAccessToken y getCurrentUser en su useEffect de montaje.
vi.mock("../api/auth", () => ({
  // ¿Qué? Mock de refreshAccessToken que devuelve null para simular ausencia de token.
  // ¿Para qué? Evitar llamadas HTTP reales que fallarían en el entorno de test.
  refreshAccessToken: vi.fn().mockResolvedValue(null),
  getCurrentUser: vi.fn().mockResolvedValue(null),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  extractErrorMessage: vi.fn((e: unknown) =>
    e instanceof Error ? e.message : String(e),
  ),
}));

// Mockeamos el módulo axios para evitar la creación de la instancia Axios
// y las llamadas reales a http://localhost:8080 durante los tests.
vi.mock("../api/axios", () => ({
  default: {},
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => null),
}));

describe("useAuth", () => {
  it("lanza un error al usarse fuera del AuthProvider", () => {
    // ¿Qué? useAuth llama useContext(AuthContext) → undefined → throw Error
    // ¿Para qué? El error explícito orienta al desarrollador sobre qué falta.
    // ¿Impacto? Sin este throw, el componente fallaría tarde con un error críptico
    //           de "Cannot read properties of undefined" en lugar del mensaje claro.

    // Suprimimos console.error porque React reporta el error de render internamente
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow(/AuthProvider/);

    consoleSpy.mockRestore();
  });

  it("retorna isLoading=false tras el montaje cuando no hay refreshToken", async () => {
    // ¿Qué? Sin refreshToken en localStorage, AuthProvider no intenta restaurar sesión.
    // ¿Para qué? Verificar que la app no queda bloqueada en estado isLoading=true.
    // ¿Impacto? Si isLoading no pasa a false, ProtectedRoute nunca renderiza su contenido.
    localStorage.clear();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("retorna user=null e isAuthenticated=false sin sesión activa", async () => {
    // ¿Qué? Sin tokens, el estado inicial es usuario no autenticado.
    // ¿Para qué? ProtectedRoute usa isAuthenticated para decidir si redirigir.
    // ¿Impacto? Si isAuthenticated fuera true por defecto, cualquier ruta
    //           protegida sería accesible sin estar autenticado — brecha de seguridad.
    localStorage.clear();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("expone las funciones login, logout y register en el contexto", async () => {
    // ¿Qué? Verifica la forma del objeto devuelto por useAuth().
    // ¿Para qué? Los componentes esperan estas funciones — si faltara alguna,
    //           habría errores de TypeScript en runtime (llamadas a undefined).
    localStorage.clear();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.register).toBe("function");
  });
});
