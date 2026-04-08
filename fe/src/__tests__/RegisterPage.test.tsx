/**
 * Archivo: src/__tests__/RegisterPage.test.tsx
 * Descripción: Tests de integración para la página de registro.
 * ¿Para qué? Verificar que el formulario renderiza los tres campos,
 *            llama a register() con los datos correctos y muestra el
 *            mensaje de éxito con el email del usuario registrado.
 * ¿Impacto? Si RegisterPage falla, los nuevos usuarios no pueden crear
 *           cuentas — el sistema no tendría forma de incorporar usuarios.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import type { AuthContextType } from "../hooks/useAuth";
import type { UserResponse } from "../types/auth";

// vi.hoisted: inicializa los mocks antes del hoisting de vi.mock()
const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

/**
 * ¿Qué? Helper que renderiza RegisterPage dentro del router de memoria.
 * ¿Para qué? RegisterPage usa Link — necesita contexto de Router.
 */
function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  const mockRegister = vi.fn<
    (data: { fullName: string; email: string; password: string }) => Promise<UserResponse>
  >();

  beforeEach(() => {
    mockRegister.mockReset();

    mocks.useAuth.mockReturnValue({
      register: mockRegister,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      user: null,
    } satisfies AuthContextType);
  });

  it("renderiza el campo de nombre completo", () => {
    renderRegister();
    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
  });

  it("renderiza el campo de correo electrónico", () => {
    renderRegister();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("renderiza el campo de contraseña", () => {
    renderRegister();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("renderiza el botón de crear cuenta", () => {
    renderRegister();
    expect(
      screen.getByRole("button", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  it("llama a register() con los datos del formulario", async () => {
    // ¿Qué? Simula el llenado completo del formulario y la llamada a register().
    // ¿Para qué? Verificar que los tres campos se pasan correctamente al backend.
    // ¿Impacto? Si falta fullName o llega vacío, el backend devuelve 400.
    const mockUser: UserResponse = {
      id: "abc-123",
      email: "ana@ejemplo.com",
      fullName: "Ana García",
      active: true,
      emailVerified: false,
      createdAt: "2026-04-07T10:00:00Z",
    };
    mockRegister.mockResolvedValueOnce(mockUser);
    renderRegister();

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana García" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@ejemplo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: "Ana García",
        email: "ana@ejemplo.com",
        password: "Password1",
      });
    });
  });

  it("muestra mensaje de éxito con el email tras registro exitoso", async () => {
    // ¿Qué? Tras registro exitoso, el mensaje debe incluir el email del usuario.
    // ¿Para qué? El usuario necesita saber a qué email llegará la verificación.
    // ¿Impacto? Sin este mensaje, el usuario no sabría que debe verificar su email
    //           antes de poder hacer login — causando confusión en el flujo.
    const mockUser: UserResponse = {
      id: "xyz-456",
      email: "nuevo@ejemplo.com",
      fullName: "Nuevo Usuario",
      active: true,
      emailVerified: false,
      createdAt: "2026-04-07T10:00:00Z",
    };
    mockRegister.mockResolvedValueOnce(mockUser);
    renderRegister();

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Nuevo Usuario" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "nuevo@ejemplo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      // El mensaje de éxito debe mencionar el email del usuario registrado
      expect(screen.getByRole("alert")).toHaveTextContent("nuevo@ejemplo.com");
    });
  });

  it("muestra alerta de error cuando register() falla", async () => {
    mockRegister.mockRejectedValueOnce(new Error("El email ya está registrado"));
    renderRegister();

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Usuario Test" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "existente@ejemplo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "El email ya está registrado",
      );
    });
  });
});
