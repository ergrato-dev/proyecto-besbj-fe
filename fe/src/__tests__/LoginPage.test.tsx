/**
 * Archivo: src/__tests__/LoginPage.test.tsx
 * Descripción: Tests de integración para la página de inicio de sesión.
 * ¿Para qué? Verificar que el formulario renderiza los campos correctos,
 *            llama a login() con los datos del formulario al hacer submit
 *            y muestra los errores del backend al usuario.
 * ¿Impacto? LoginPage es la puerta de entrada al sistema. Si falla o no
 *           reporta errores, los usuarios no pueden autenticarse.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import type { AuthContextType } from "../hooks/useAuth";

// vi.hoisted: crea las funciones mock ANTES de que el módulo se evalúe.
// Es necesario porque vi.mock() se icha (hoisted) al inicio del archivo
// por Vitest, antes de que las variables normales estén inicializadas.
const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

// Intercepta todas las importaciones de useAuth en LoginPage (y sus dependencias)
// para devolver nuestra implementación controlada en cada test.
vi.mock("../hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

/**
 * ¿Qué? Helper que renderiza LoginPage dentro del router de memoria.
 * ¿Para qué? LoginPage usa Link, useNavigate, useLocation — todos requieren
 *            estar dentro de un Router. MemoryRouter simula el router
 *            sin necesitar un navegador real.
 */
function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    // Resetear llamadas previas entre tests para evitar contaminación
    mockLogin.mockReset();

    // Estado base: usuario no autenticado, sin carga
    mocks.useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      register: vi.fn(),
      logout: vi.fn(),
    } satisfies AuthContextType);
  });

  it("renderiza el campo de correo electrónico", () => {
    renderLogin();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("renderiza el campo de contraseña", () => {
    renderLogin();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("renderiza el botón de submit", () => {
    renderLogin();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("llama a login() con email y contraseña al hacer submit", async () => {
    // ¿Qué? Simula el flujo completo: escribir datos → clic → verificar llamada.
    // ¿Para qué? Asegurar que los datos del formulario llegan correctamente a login().
    // ¿Impacto? Si los datos se pasan incorrectamente, el backend recibiría datos
    //           erróneos y el usuario nunca podría autenticarse.
    mockLogin.mockResolvedValueOnce(undefined);
    renderLogin();

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "usuario@ejemplo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "usuario@ejemplo.com",
        password: "Password1",
      });
    });
  });

  it("muestra alerta de error cuando login() falla", async () => {
    // ¿Qué? Simula credenciales incorrectas — el backend devuelve 401.
    // ¿Para qué? El usuario debe ver el error en la UI, no quedarse esperando.
    // ¿Impacto? Sin este feedback, el usuario no sabría por qué no puede entrar.
    mockLogin.mockRejectedValueOnce(new Error("Credenciales incorrectas"));
    renderLogin();

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "malo@ejemplo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "WrongPass1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Credenciales incorrectas",
      );
    });
  });

  it("redirige al dashboard cuando el usuario ya está autenticado", () => {
    // ¿Qué? Si user ya está autenticado, LoginPage devuelve <Navigate>.
    // ¿Para qué? Evitar que un usuario logueado vea el formulario de login.
    mocks.useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "1",
        email: "user@ejemplo.com",
        firstName: "Usuario",
        lastName: "",
        active: true,
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00Z",
      },
      register: vi.fn(),
      logout: vi.fn(),
    } satisfies AuthContextType);

    renderLogin();
    // El formulario no debe estar presente — Navigate reemplazó el contenido
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
  });
});
