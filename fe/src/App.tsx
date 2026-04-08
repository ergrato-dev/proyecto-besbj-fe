/**
 * Archivo: App.tsx
 * Descripción: Componente raíz — define rutas y envuelve la app con AuthProvider.
 * ¿Para qué? Centralizar el sistema de rutas y el proveedor de autenticación.
 *            AuthProvider envuelve todas las rutas para que cualquier componente
 *            (Navbar, ProtectedRoute, páginas) pueda usar useAuth().
 * ¿Impacto? Si AuthProvider no envuelve el árbol, useAuth() lanzará un error
 *           diciendo que está fuera de AuthProvider — fácil de depurar.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Proveedor de autenticación — debe envolver todo el árbol de rutas
import { AuthProvider } from "./context/AuthContext";

// Componente de protección de rutas
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas públicas
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import NotFoundPage from "./pages/NotFoundPage";

// Páginas informativas / legales
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiesPage from "./pages/CookiesPage";
import ContactPage from "./pages/ContactPage";

// Páginas protegidas (requieren autenticación)
import DashboardPage from "./pages/DashboardPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

/**
 * ¿Qué? Componente raíz que define el árbol completo de la aplicación.
 * ¿Para qué? AuthProvider envuelve BrowserRouter para que los componentes de
 *            navegación (Navbar) y de protección (ProtectedRoute) accedan al
 *            estado de auth sin prop drilling.
 * ¿Impacto? El orden importa: AuthProvider → BrowserRouter → Routes.
 *           Si BrowserRouter estuviera fuera de AuthProvider, useNavigate() en
 *           el logout del AuthProvider no funcionaría.
 */
export default function App() {
  return (
    /*
      AuthProvider — provee user, login, logout, isAuthenticated a toda la app.
      Se monta una sola vez. Al montar, intenta restaurar la sesión del localStorage.
    */
    <AuthProvider>
      {/*
        BrowserRouter — habilita la History API del navegador.
        Las URLs son limpias: /login, /dashboard (no /#/login como HashRouter).
        En producción, el servidor debe devolver index.html para todas las rutas.
      */}
      <BrowserRouter>
        {/*
          Routes — renderiza solo la primera ruta que coincide con la URL actual.
          El orden de las rutas importa para patrones ambiguos, aunque React Router 7
          usa un algoritmo de coincidencia basado en especificidad, no en orden.
        */}
        <Routes>
          {/* ---- Rutas públicas ---- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* ---- Páginas informativas y legales ---- */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ---- Rutas protegidas — requieren autenticación ---- */}
          {/*
            ProtectedRoute verifica isAuthenticated antes de renderizar el hijo.
            Si el usuario no está autenticado, redirige a /login guardando la
            URL original en location.state.from para redirigir de vuelta tras el login.
          */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* ---- 404 — captura cualquier URL no definida arriba ---- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
