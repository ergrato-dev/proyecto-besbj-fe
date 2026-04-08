/**
 * Archivo: components/ui/Logo.tsx
 * Descripción: Logotipo SVG del sistema NN Auth en formato de componente React.
 * ¿Para qué? Reutilizar el logo en Navbar, LandingPage y AuthLayout
 *            sin duplicar el SVG en cada archivo.
 * ¿Impacto? El color está hardcodeado en el SVG (#d97706 y #fbbf24) porque
 *           los atributos stroke de SVG no responden a las clases de Tailwind.
 *           Si cambia el color del stack, hay que actualizar los valores aquí.
 *
 * Identidad visual Spring Boot Java → amber:
 *   Borde del badge:  stroke="#d97706"  (amber-600)
 *   Trazos de letras: stroke="#fbbf24"  (amber-400)
 */

interface LogoProps {
  /** Tamaño en píxeles del SVG (ancho y alto son iguales). Por defecto: 36 */
  size?: number;
  /** Clases CSS adicionales para el elemento <svg> */
  className?: string;
}

/**
 * ¿Qué? SVG del badge "NN" — las dos letras N representan "NN" de la empresa genérica.
 * ¿Para qué? Identificar visualmente el proyecto con el color del stack (amber = Spring Boot).
 * ¿Impacto? Cambiar los valores de stroke aquí actualiza el color del logo en toda la app.
 */
export default function Logo({ size = 36, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Borde del badge — amber-600 (#d97706) */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="8"
        stroke="#d97706"
        strokeWidth="2"
      />
      {/*
        Letras NN — amber-400 (#fbbf24).
        Cada N se dibuja: bottom-left → top-left → diagonal a bottom-right → top-right.
        Primera N: x 9→19, Segunda N: x 21→31. Centradas en el badge de 40x40.
      */}
      <path
        d="M9 29V11L19 29V11M21 29V11L31 29V11"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
