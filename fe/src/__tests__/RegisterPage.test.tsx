/**
 * Archivo: src/__tests__/RegisterPage.test.tsx
 * Descripción: Tests de integración para la página de registro.
 * ¿Para qué? Verificar que el formulario renderiza los seis campos, valida
 *            correctamente, llama a register() con los datos correctos y muestra
 *            el mensaje de éxito con el email del usuario registrado.
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

/**
 * ¿Qué? Helper que llena los seis campos del formulario y marca los tres checkboxes.
 * ¿Para qué? El botón de crear cuenta solo se habilita cuando todos los campos
 *            tienen valor y los tres consentimientos legales están marcados.
 * ¿Impacto? Sin este helper, cada test repetiría el mismo bloque de 9 fireEvent.
 */
function fillFormAndConsents({
  firstName = "Ana",
  lastName = "García",
  email = "ana@ejemplo.com",
  confirmEmail = "ana@ejemplo.com",
  password = "Password1",
  confirmPassword = "Password1",
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  confirmEmail?: string;
  password?: string;
  confirmPassword?: string;
} = {}) {
  fireEvent.change(screen.getByLabelText("Nombres"), {
    target: { value: firstName },
  });
  fireEvent.change(screen.getByLabelText("Apellidos"), {
    target: { value: lastName },
  });
  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Confirmar correo electrónico"), {
    target: { value: confirmEmail },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
    target: { value: confirmPassword },
  });

  // Marcar los tres checkboxes de consentimiento legal
  const checkboxes = screen.getAllByRole("checkbox");
  checkboxes.forEach((cb) => fireEvent.click(cb));
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

  it("renderiza el campo de nombres", () => {
    renderRegister();
    expect(screen.getByLabelText("Nombres")).toBeInTheDocument();
  });

  it("renderiza el campo de apellidos", () => {
    renderRegister();
    expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
  });

  it("renderiza el campo de correo electrónico", () => {
    renderRegister();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("renderiza el campo de confirmar correo electrónico", () => {
    renderRegister();
    expect(screen.getByLabelText("Confirmar correo electrónico")).toBeInTheDocument();
  });

  it("renderiza el campo de contraseña", () => {
    renderRegister();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("renderiza el campo de confirmar contraseña", () => {
    renderRegister();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
  });

  it("renderiza tres checkboxes de consentimiento legal", () => {
    renderRegister();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("renderiza el botón de crear cuenta", () => {
    renderRegister();
    expect(
      screen.getByRole("button", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  it("el botón permanece deshabilitado hasta completar el formulario", () => {
    // ¿Qué? Verifica la restricción isButtonEnabled del formulario.
    // ¿Para qué? El botón solo se activa cuando los 6 campos tienen valor Y los 3 consents están marcados.
    // ¿Impacto? Previene envíos vacíos e incompletos antes de llegar a handleSubmit.
    renderRegister();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeDisabled();
  });

  it("llama a register() con los datos del formulario", async () => {
    // ¿Qué? Simula el llenado completo del formulario y la llamada a register().
    // ¿Para qué? Verificar que first_name y last_name se concatenan como fullName
    //            para el backend Spring Boot, y que email y password llegan correctos.
    // ¿Impacto? Si la concatenación falla o llega vacía, el backend devuelve 400.
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

    fillFormAndConsents();
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

    fillFormAndConsents({
      firstName: "Nuevo",
      lastName: "Usuario",
      email: "nuevo@ejemplo.com",
      confirmEmail: "nuevo@ejemplo.com",
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

    fillFormAndConsents();
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "El email ya está registrado",
      );
    });
  });
});
