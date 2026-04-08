/**
 * Archivo: src/__tests__/InputField.test.tsx
 * Descripción: Tests unitarios para el componente InputField.
 * ¿Para qué? Verificar que el campo de formulario vincula label e input
 *            correctamente (accesibilidad WCAG 2.1 AA) y que los mensajes
 *            de error y los atributos ARIA se aplican cuando corresponde.
 * ¿Impacto? Un InputField sin accesibilidad (htmlFor mal configurado, sin
 *           aria-invalid) impide el uso con lectores de pantalla y viola
 *           los requisitos WCAG 2.1 AA del proyecto.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InputField from "../components/ui/InputField";

describe("InputField", () => {
  it("renderiza el label vinculado al input (htmlFor + id)", () => {
    render(<InputField id="email" label="Correo electrónico" />);
    // getByLabelText verifica que el label está correctamente vinculado
    // al input mediante htmlFor/id — requisito WCAG 2.1 AA
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("no muestra mensaje de error cuando no hay prop error", () => {
    render(<InputField id="email" label="Email" />);
    // queryByRole devuelve null si no existe — no lanza en ausencia del elemento
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra el mensaje de error con role=alert cuando hay error", () => {
    render(<InputField id="email" label="Email" error="Formato de email inválido" />);
    // role=alert es crítico: el lector de pantalla anuncia el error inmediatamente
    expect(screen.getByRole("alert")).toHaveTextContent("Formato de email inválido");
  });

  it("marca el input como aria-invalid='true' cuando hay error", () => {
    render(<InputField id="email" label="Email" error="Campo requerido" />);
    // aria-invalid comunica al lector de pantalla que el campo tiene un error
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("marca el input como aria-invalid='false' cuando no hay error", () => {
    render(<InputField id="email" label="Email" />);
    // aria-invalid='false' es el estado correcto cuando no hay error
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
  });

  it("vincula aria-describedby al id del mensaje de error", () => {
    // aria-describedby conecta el input con la descripción del error
    // para que el lector de pantalla lo lea al enfocar el input
    render(<InputField id="password" label="Contraseña" error="Muy corta" />);
    const input = screen.getByLabelText("Contraseña");
    expect(input).toHaveAttribute("aria-describedby", "password-error");
    expect(screen.getByText("Muy corta")).toHaveAttribute("id", "password-error");
  });

  it("no aplica aria-describedby cuando no hay error", () => {
    render(<InputField id="password" label="Contraseña" />);
    // Sin error no debe haber aria-describedby — evitar referencias a IDs inexistentes
    expect(screen.getByLabelText("Contraseña")).not.toHaveAttribute("aria-describedby");
  });
});
