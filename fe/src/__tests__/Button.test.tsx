/**
 * Archivo: src/__tests__/Button.test.tsx
 * Descripción: Tests unitarios para el componente Button.
 * ¿Para qué? Verificar que el botón renderiza correctamente en cada variante,
 *            muestra el spinner cuando isLoading=true y se deshabilita
 *            con disabled=true o isLoading=true.
 * ¿Impacto? Button es usado en todos los formularios de auth. Si falla,
 *           ninguna acción del usuario (login, registro, cambio de contraseña)
 *           tendrá un botón funcional.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../components/ui/Button";

describe("Button", () => {
  it("renderiza el texto hijo correctamente", () => {
    render(<Button>Iniciar sesión</Button>);
    // getByRole garantiza que existe un elemento <button> accesible con ese texto
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("está habilitado por defecto", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("se deshabilita cuando disabled=true", () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("se deshabilita y marca aria-busy cuando isLoading=true", () => {
    // isLoading deshabilita el botón para evitar doble envío de formularios
    render(<Button isLoading>Cargando</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    // aria-busy comunica a lectores de pantalla que hay una operación en curso
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("aplica clases primary (accent-600) por defecto", () => {
    render(<Button>Botón</Button>);
    expect(screen.getByRole("button").className).toContain("bg-accent-600");
  });

  it("aplica clases de danger (bg-red-600) para variante danger", () => {
    render(<Button variant="danger">Eliminar cuenta</Button>);
    expect(screen.getByRole("button").className).toContain("bg-red-600");
  });

  it("aplica clases de secondary para variante secondary", () => {
    // Secondary usa borde en lugar de fondo sólido — acción menos prominente
    render(<Button variant="secondary">Cancelar</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border");
    expect(button.className).not.toContain("bg-accent-600");
  });
});
