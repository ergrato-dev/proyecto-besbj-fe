/**
 * Archivo: src/__tests__/Alert.test.tsx
 * Descripción: Tests unitarios para el componente Alert.
 * ¿Para qué? Verificar que las alertas son accesibles (role=alert),
 *            muestran el mensaje correcto y aplican los estilos de cada variante.
 * ¿Impacto? Sin role=alert, los lectores de pantalla no anuncian los mensajes
 *           de error o éxito al usuario — viola WCAG 2.1 AA y hace la UI
 *           inaccesible para usuarios con discapacidad visual.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Alert from "../components/ui/Alert";

describe("Alert", () => {
  it("renderiza el mensaje con role=alert para lectores de pantalla", () => {
    render(<Alert>Error al iniciar sesión</Alert>);
    // role=alert implica aria-live="assertive" — el lector de pantalla
    // interrumpe lo que esté leyendo para anunciar este mensaje
    expect(screen.getByRole("alert")).toHaveTextContent("Error al iniciar sesión");
  });

  it("la variante error aplica estilos rojos (por defecto)", () => {
    render(<Alert>Credenciales incorrectas</Alert>);
    expect(screen.getByRole("alert").className).toContain("bg-red-50");
  });

  it("la variante success aplica estilos verdes", () => {
    render(<Alert variant="success">Cuenta creada exitosamente</Alert>);
    expect(screen.getByRole("alert").className).toContain("bg-green-50");
  });

  it("la variante info aplica estilos azules", () => {
    render(<Alert variant="info">Revisa tu bandeja de entrada</Alert>);
    expect(screen.getByRole("alert").className).toContain("bg-blue-50");
  });

  it("la variante warning aplica estilos amarillos", () => {
    render(<Alert variant="warning">Token próximo a expirar</Alert>);
    expect(screen.getByRole("alert").className).toContain("bg-yellow-50");
  });

  it("acepta y renderiza contenido hijo complejo (no solo texto)", () => {
    render(
      <Alert variant="info">
        <span data-testid="inner">Mensaje con elemento hijo</span>
      </Alert>,
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });
});
