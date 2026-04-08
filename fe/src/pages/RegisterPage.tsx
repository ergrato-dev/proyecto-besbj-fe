/**
 * Archivo: pages/RegisterPage.tsx
 * Descripción: Página de registro de nuevos usuarios.
 * ¿Para qué? Crear una cuenta nueva con nombre, apellido, email confirmado y contraseña confirmada.
 * ¿Impacto? Después del registro exitoso, el usuario recibe un email de verificación.
 *           No puede hacer login hasta verificar su email — previene registros falsos.
 *
 * Campos del formulario:
 *   - Nombres (first_name) + Apellidos (last_name) — fila de 2 columnas
 *   - Email + Confirmar email — fila de 2 columnas (confirmación sin paste)
 *   - Contraseña + Confirmar contraseña — fila de 2 columnas (confirmación sin paste)
 *   - Indicador de fortaleza de contraseña — ancho completo
 *   - 3 checkboxes de consentimiento legal — obligatorio para enviar
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, MailCheck, Lock, KeyRound } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import AuthLayout from "../components/layout/AuthLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { PasswordStrengthIndicator } from "../components/ui/PasswordStrengthIndicator";
import { useAuth } from "../hooks/useAuth";

/**
 * ¿Qué? Página de registro con 6 campos, indicador de fortaleza y 3 consentimientos legales.
 * ¿Para qué? Crear cuenta → envío de email de verificación (el usuario debe verificar antes de hacer login).
 * ¿Impacto? El botón permanece deshabilitado hasta que todos los campos estén llenos y
 *           los tres consentimientos legales estén marcados — UX preventiva de envíos incompletos.
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();

  // ¿Qué? Estado de todos los campos de texto del formulario en un solo objeto.
  // ¿Para qué? Centralizar el estado evita tener 6 useState separados.
  // ¿Impacto? Un solo handleChange sirve para todos los campos de texto.
  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  });

  // ¿Qué? Estado de los tres checkboxes de consentimiento legal.
  // ¿Para qué? Cada checkbox es independiente y mapea a su key en `errors`.
  // ¿Impacto? El botón solo se habilita cuando los tres están en true.
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    cookies: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ¿Qué? Handler unificado para todos los inputs de texto/email/password.
   * ¿Para qué? Patrón controlled component — React controla el valor de cada campo.
   * ¿Impacto? Al escribir en cualquier campo, se limpia el error de ese campo
   *           para dar feedback inmediato de que el usuario está corrigiendo.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGeneralError(null);
  };

  // ¿Qué? Handler para los checkboxes de consentimiento legal.
  // ¿Para qué? Actualizar el estado de cada casilla individualmente.
  // ¿Impacto? El botón se habilita solo cuando las tres casillas estén marcadas
  //           y todos los campos del formulario tengan algún valor.
  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsents((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  // ¿Qué? Computed: habilita el botón de envío en tiempo real.
  // ¿Para qué? Dar feedback inmediato al usuario sin esperar el submit.
  // ¿Impacto? El botón permanece deshabilitado hasta que se cumplan AMBAS condiciones:
  //           1) todos los campos tienen algún valor, 2) los tres consentimientos están marcados.
  const allFieldsFilled =
    formData.email.trim() !== "" &&
    formData.confirmEmail.trim() !== "" &&
    formData.first_name.trim() !== "" &&
    formData.last_name.trim() !== "" &&
    formData.password !== "" &&
    formData.confirmPassword !== "";
  const allConsentsAccepted = consents.terms && consents.privacy && consents.cookies;
  const isButtonEnabled = allFieldsFilled && allConsentsAccepted;

  /**
   * ¿Qué? Validación del lado del cliente antes de enviar al backend.
   * ¿Para qué? Dar feedback inmediato sin esperar la respuesta del servidor.
   * ¿Impacto? Reduce peticiones innecesarias y mejora la UX.
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t("auth.register.validation.emailRequired");
    }

    // ¿Qué? Validar que el correo de confirmación coincida con el principal.
    // ¿Para qué? El usuario debe haber escrito el mismo correo dos veces de forma manual.
    // ¿Impacto? Previene registros con errores tipográficos que bloquearían la cuenta
    //           (el email de verificación llegaría a una dirección incorrecta).
    if (!formData.confirmEmail) {
      newErrors.confirmEmail = t("auth.register.validation.confirmEmailRequired");
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = t("auth.register.validation.emailsMismatch");
    }

    if (!formData.first_name || formData.first_name.trim().length < 2) {
      newErrors.first_name = t("auth.register.validation.firstNameMin");
    }

    if (!formData.last_name || formData.last_name.trim().length < 2) {
      newErrors.last_name = t("auth.register.validation.lastNameMin");
    }

    if (formData.password.length < 8) {
      newErrors.password = t("auth.register.validation.passwordMin");
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t("auth.register.validation.passwordUppercase");
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = t("auth.register.validation.passwordLowercase");
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = t("auth.register.validation.passwordNumber");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.register.validation.passwordsMismatch");
    }

    // ¿Qué? Validación de consentimientos legales obligatorios.
    // ¿Para qué? Garantizar que el usuario explícitamente aceptó los documentos legales.
    // ¿Impacto? Sin esta verificación, el registro podría procesarse sin consentimiento válido,
    //           lo cual viola la Ley 1581/2012 (protección de datos) y la Ley 1480/2011.
    if (!consents.terms) newErrors.terms = t("auth.register.validation.termsRequired");
    if (!consents.privacy) newErrors.privacy = t("auth.register.validation.privacyRequired");
    if (!consents.cookies) newErrors.cookies = t("auth.register.validation.cookiesRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * ¿Qué? Envía los datos de registro al backend Spring Boot.
   * ¿Para qué? Crear la cuenta y disparar el envío del email de verificación.
   * ¿Impacto? En caso de éxito, se muestra un mensaje pidiendo verificar el email
   *           en lugar de redirigir — el usuario no puede hacer login todavía.
   *           Los nombres se concatenan como fullName para el backend (campo unificado).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // ¿Qué? El backend Spring Boot usa fullName como campo unificado.
      // ¿Para qué? La API recibe un solo campo — combinamos first_name y last_name.
      // ¿Impacto? El usuario llena dos campos separados pero el backend recibe uno solo.
      const user = await register({
        email: formData.email,
        fullName: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        password: formData.password,
      });
      setSuccessMessage(t("auth.register.successMessage", { email: user.email }));
      // Limpiar el formulario tras registro exitoso
      setFormData({ email: "", confirmEmail: "", first_name: "", last_name: "", password: "", confirmPassword: "" });
      setConsents({ terms: false, privacy: false, cookies: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.register.errorDefault");
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} wide>
      {generalError && (
        <div className="mb-4">
          <Alert variant="error" onClose={() => setGeneralError(null)}>{generalError}</Alert>
        </div>
      )}
      {successMessage && (
        <div className="mb-4">
          <Alert variant="success">{successMessage}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Fila 1: Nombres y Apellidos en paralelo */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label={t("common.firstName")}
            id="first_name"
            name="first_name"
            type="text"
            value={formData.first_name}
            placeholder="Juan"
            autoComplete="given-name"
            autoFocus
            icon={<User className="h-4 w-4" />}
            error={errors.first_name}
            onChange={handleChange}
          />
          <InputField
            label={t("common.lastName")}
            id="last_name"
            name="last_name"
            type="text"
            value={formData.last_name}
            placeholder="Pérez"
            autoComplete="family-name"
            icon={<User className="h-4 w-4" />}
            error={errors.last_name}
            onChange={handleChange}
          />
        </div>

        {/* Fila 2: Email y Confirmar email en paralelo */}
        {/* ¿Qué? Dos columnas para los campos de correo. */}
        {/* ¿Para qué? Reducir el scroll al agrupar campos relacionados en la misma fila. */}
        {/* ¿Impacto? El usuario ve ambos campos juntos, reforzando visualmente que deben coincidir. */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <InputField
            label={t("common.email")}
            id="email"
            name="email"
            type="email"
            value={formData.email}
            placeholder={t("common.emailPlaceholder")}
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
            onChange={handleChange}
          />
          <InputField
            label={t("auth.register.confirmEmail")}
            id="confirmEmail"
            name="confirmEmail"
            type="email"
            value={formData.confirmEmail}
            placeholder={t("common.emailPlaceholder")}
            autoComplete="off"
            icon={<MailCheck className="h-4 w-4" />}
            error={errors.confirmEmail}
            onChange={handleChange}
            disablePaste
          />
        </div>

        {/* Fila 3: Contraseña y Confirmar contraseña en paralelo */}
        {/* ¿Qué? Dos columnas para los campos de contraseña. */}
        {/* ¿Para qué? Igual que los emails — relacionados visualmente y más compactos. */}
        {/* ¿Impacto? El indicador de fortaleza ocupa toda la fila debajo, siempre visible. */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <InputField
            label={t("common.password")}
            id="password"
            name="password"
            type="password"
            value={formData.password}
            placeholder={t("common.passwordPlaceholder")}
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password}
            onChange={handleChange}
          />
          <InputField
            label={t("auth.register.confirmPassword")}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            placeholder={t("common.passwordPlaceholder")}
            autoComplete="new-password"
            icon={<KeyRound className="h-4 w-4" />}
            error={errors.confirmPassword}
            onChange={handleChange}
            disablePaste
          />
        </div>

        {/* Indicador de fortaleza — ocupa el ancho completo debajo de la fila de contraseñas */}
        <div className="mt-3">
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        {/* ¿Qué? Bloque de checkboxes de consentimiento legal obligatorio. */}
        {/* ¿Para qué? Obtener el consentimiento explícito del usuario antes de enviar el formulario, */}
        {/*            cumpliendo con la Ley 1581/2012 (datos personales) y Ley 1480/2011. */}
        {/* ¿Impacto? El botón de crear cuenta permanece deshabilitado hasta que los tres estén marcados. */}
        <div className="mt-3 space-y-2">
          {(["terms", "privacy", "cookies"] as const).map((key) => {
            const i18nKeyMap = {
              terms:   { text: "auth.register.acceptTerms",   to: "/terms" },
              privacy: { text: "auth.register.acceptPrivacy", to: "/privacy" },
              cookies: { text: "auth.register.acceptCookies", to: "/cookies" },
            } as const;
            const { text, to } = i18nKeyMap[key];
            return (
              <div key={key}>
                <label className="flex cursor-pointer select-none items-start gap-2.5">
                  <input
                    type="checkbox"
                    name={key}
                    checked={consents[key]}
                    onChange={handleConsentChange}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-accent-600
                      focus:ring-2 focus:ring-accent-500 focus:ring-offset-0
                      dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-accent-500"
                  />
                  <span className="text-sm leading-snug text-gray-700 dark:text-gray-300">
                    <Trans
                      i18nKey={text}
                      components={{
                        link: (
                          <Link
                            to={to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-accent-600 underline hover:text-accent-700
                              dark:text-accent-400 dark:hover:text-accent-300"
                          />
                        ),
                      }}
                    />
                  </span>
                </label>
                {errors[key] && (
                  <p className="ml-6 mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors[key]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={!isButtonEnabled}>
            {t("auth.register.submit")}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("auth.register.haveAccount")}{" "}
        <Link
          to="/login"
          className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
