/**
 * Archivo: pages/ContactPage.tsx
 * Descripción: Formulario de contacto público del NN Auth System.
 * ¿Para qué? Proveer un canal formal para consultas, soporte técnico y ejercicio de
 *            derechos sobre datos personales (Ley 1581/2012, Art. 8), sin exponer
 *            correos reales en el frontend.
 * ¿Impacto? Sin canal de contacto, el operador no podría cumplir con los plazos de
 *           respuesta exigidos por la Ley 1581/2012: 10 días hábiles para consultas
 *           y 15 días hábiles para reclamos (Arts. 14–15).
 *
 * ⚠️ AVISO EDUCATIVO — PROYECTO SENA:
 *   Este formulario es DEMOSTRATIVO. No envía datos a ningún servidor real.
 *   Los correos de contacto son FICTICIOS (empresa NN S.A.S. no existe).
 *   NUNCA colocar correos reales de personas en el código fuente.
 *
 * Marco normativo de referencia:
 *   - Ley 1581/2012  — Derecho del titular a presentar consultas y reclamos (Arts. 14–15).
 *   - Decreto 1377/2013 — Obligación del responsable de disponer canales de atención.
 *   - Ley 1480/2011  — Derecho del consumidor a recibir atención y respuesta.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";

// ─────────────────────────────────────────────────────────────
// CONSTANTES — datos ficticios del proyecto educativo
// ─────────────────────────────────────────────────────────────

/**
 * ¿Qué? Información de contacto del proyecto educativo.
 * ¿Para qué? Proveer datos de ubicación y horario sin exponer buzones de correo.
 * ¿Impacto? Por política antispam, NUNCA se publican direcciones de email en el frontend.
 *           El canal principal de contacto es el formulario de esta misma página.
 */
const CONTACT_INFO = {
  telefono: "(+57) 601 000 0000",
  direccion: "Bogotá D.C., Colombia",
  horario: "Lunes a viernes, 8:00 am – 5:00 pm (hora Colombia)",
} as const;

/** Claves de i18n para las opciones del selector de asunto. */
const SUBJECT_KEYS = [
  { value: "", i18nKey: "placeholder" },
  { value: "consulta-general", i18nKey: "general" },
  { value: "soporte-tecnico", i18nKey: "support" },
  { value: "derechos-datos", i18nKey: "dataRights" },
  { value: "sistema-autenticacion", i18nKey: "authSystem" },
  { value: "bugs-errores", i18nKey: "bugs" },
  { value: "otro", i18nKey: "other" },
] as const;

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

interface ContactFormData {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
  readonly acceptsPrivacy: boolean;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  acceptsPrivacy?: string;
}

// ─────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  acceptsPrivacy: false,
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Regex RFC 5322 simplificado — valida formato básico de email. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ¿Qué? Función que valida todos los campos del formulario de contacto.
 * ¿Para qué? Detectar errores antes de "enviar" y mostrarlos al usuario.
 * ¿Impacto? Validación en el cliente previene envíos incompletos y mejora la UX.
 *           No reemplaza la validación del servidor en una implementación real.
 * @param data - Datos actuales del formulario.
 * @param t - Función de traducción para los mensajes de error.
 */
function validateForm(data: ContactFormData, t: (key: string) => string): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (data.name.trim().length < 3) {
    errors.name = t("contact.form.name.error");
  }
  if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = t("contact.form.email.error");
  }
  if (!data.subject) {
    errors.subject = t("contact.form.subject.error");
  }
  if (data.message.trim().length < 20) {
    errors.message = t("contact.form.message.error");
  }
  if (!data.acceptsPrivacy) {
    errors.acceptsPrivacy = t("contact.form.privacy.error");
  }

  return errors;
}

/**
 * ¿Qué? Calcula las clases CSS de un campo input/textarea según si tiene error.
 * ¿Para qué? Centralizar el patrón de clases para no repetirlo en cada campo.
 * ¿Impacto? Si el diseño de los inputs cambia, basta con editar esta función.
 */
function fieldInputCls(error?: string): string {
  const base =
    "w-full rounded-lg border bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50 ";
  return error
    ? base + "border-red-400 dark:border-red-700 focus:ring-red-500/30"
    : base +
        "border-gray-300 dark:border-gray-700 focus:border-accent-500 focus:ring-accent-500/20";
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT — panel de confirmación de envío exitoso
// ─────────────────────────────────────────────────────────────

interface ContactSuccessPanelProps {
  readonly onReset: () => void;
  readonly t: (key: string) => string;
}

/**
 * ¿Qué? Panel verde que reemplaza el formulario tras un envío simulado exitoso.
 * ¿Para qué? Proveer feedback claro al usuario de que su mensaje fue "enviado".
 * ¿Impacto? Extraído de ContactPage para reducir la complejidad cognitiva del componente.
 */
function ContactSuccessPanel({ onReset, t }: ContactSuccessPanelProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40 px-8 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <CheckCircle size={48} className="text-green-600 dark:text-green-500" aria-hidden="true" />
      <div>
        <p className="text-lg font-semibold text-green-800 dark:text-green-300">
          {t("contact.success.title")}
        </p>
        <p className="mt-2 text-sm text-green-700 dark:text-green-500">
          {t("contact.success.body")}
        </p>
      </div>
      <button
        onClick={onReset}
        className="mt-2 rounded-lg border border-green-400 dark:border-green-700 px-4 py-2 text-sm text-green-700 dark:text-green-400 transition-colors hover:bg-green-100 dark:hover:bg-green-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        {t("contact.success.reset")}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT — campos del formulario de contacto
// ─────────────────────────────────────────────────────────────

interface ContactFormFieldsProps {
  readonly formData: ContactFormData;
  readonly errors: ContactFormErrors;
  readonly isSubmitting: boolean;
  readonly submitResult: "success" | "error" | null;
  readonly onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  readonly onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onSubmit: (e: React.SyntheticEvent) => void;
  readonly t: (key: string, opts?: Record<string, unknown>) => string;
}

/**
 * ¿Qué? Sub-componente que renderiza todos los campos del formulario de contacto.
 * ¿Para qué? Separar los campos del formulario de la lógica de estado del componente padre.
 * ¿Impacto? Facilita el testing y la comprensión del código al tener responsabilidades bien
 *           separadas: el padre gestiona el estado, este componente solo renderiza los campos.
 */
function ContactFormFields({
  formData,
  errors,
  isSubmitting,
  submitResult,
  onChange,
  onCheckboxChange,
  onSubmit,
  t,
}: ContactFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} noValidate aria-label={t("contact.form.heading")}>
      {/* Banner de error general — visible si el envío falló */}
      {submitResult === "error" && (
        <div
          role="alert"
          className="mb-5 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300"
        >
          <AlertCircle size={16} aria-hidden="true" className="shrink-0" />
          {t("contact.form.errorBanner")}
        </div>
      )}

      <div className="space-y-5">
        {/* Campo: nombre */}
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("contact.form.name.label")}
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            value={formData.name}
            onChange={onChange}
            disabled={isSubmitting}
            placeholder={t("contact.form.name.placeholder")}
            className={fieldInputCls(errors.name)}
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Campo: email */}
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("contact.form.email.label")}
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email
                ? "contact-email-error"
                : "contact-email-hint"
            }
            value={formData.email}
            onChange={onChange}
            disabled={isSubmitting}
            placeholder={t("contact.form.email.placeholder")}
            className={fieldInputCls(errors.email)}
          />
          {errors.email ? (
            <p id="contact-email-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          ) : (
            <p id="contact-email-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-600">
              {t("contact.form.email.hint")}
            </p>
          )}
        </div>

        {/* Campo: asunto */}
        <div>
          <label
            htmlFor="contact-subject"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("contact.form.subject.label")}
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            aria-required="true"
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            value={formData.subject}
            onChange={onChange}
            disabled={isSubmitting}
            className={fieldInputCls(errors.subject)}
          >
            {SUBJECT_KEYS.map(({ value, i18nKey }) => (
              <option key={i18nKey} value={value} disabled={value === ""}>
                {t(`contact.form.subject.options.${i18nKey}`)}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p id="contact-subject-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Campo: mensaje */}
        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("contact.form.message.label")}
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
            value={formData.message}
            onChange={onChange}
            disabled={isSubmitting}
            placeholder={t("contact.form.message.placeholder")}
            className={`${fieldInputCls(errors.message)} resize-y`}
          />
          {errors.message ? (
            <p id="contact-message-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.message}
            </p>
          ) : (
            <p
              id="contact-message-hint"
              className={`mt-1 text-xs ${
                formData.message.trim().length < 20
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-gray-500 dark:text-gray-600"
              }`}
            >
              {t("contact.form.message.hint", { count: formData.message.trim().length })}
            </p>
          )}
        </div>

        {/* Campo: checkbox de privacidad */}
        <div>
          <div className="flex items-start gap-3">
            <input
              id="contact-privacy"
              type="checkbox"
              name="acceptsPrivacy"
              required
              aria-required="true"
              aria-invalid={!!errors.acceptsPrivacy}
              aria-describedby={errors.acceptsPrivacy ? "contact-privacy-error" : undefined}
              checked={formData.acceptsPrivacy}
              onChange={onCheckboxChange}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-accent-600 focus:ring-accent-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <label htmlFor="contact-privacy" className="text-sm text-gray-700 dark:text-gray-300">
              {t("contact.form.privacy.label")}{" "}
              <Link
                to="/privacy"
                className="underline text-accent-600 hover:text-accent-700 dark:text-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
              >
                {t("contact.form.privacy.link")}
              </Link>{" "}
              {t("contact.form.privacy.labelSuffix")}
            </label>
          </div>
          {errors.acceptsPrivacy && (
            <p id="contact-privacy-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.acceptsPrivacy}
            </p>
          )}
        </div>
      </div>

      {/* Botón de envío — alineado a la derecha */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-label={isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("contact.form.submitting")}
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              {t("contact.form.submit")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * ¿Qué? Página de formulario de contacto público.
 * ¿Para qué? Recibir consultas, reportes y solicitudes de ejercicio de derechos de datos.
 *            En una implementación real, enviaría un correo al equipo a través del
 *            backend (Spring Boot + JavaMailSender). En este contexto educativo,
 *            simula el envío con un estado de éxito después de 1.5 segundos.
 * ¿Impacto? Provee el canal de atención exigido por Ley 1581/2012 Art. 15
 *           (reclamos) y Decreto 1377/2013 Art. 13 (información del responsable).
 */
export default function ContactPage() {
  const { t } = useTranslation();

  // ¿Qué? Estado del formulario — un objeto con todos los campos.
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM);
  // ¿Qué? Errores de validación por campo.
  const [errors, setErrors] = useState<ContactFormErrors>({});
  // ¿Qué? Flag de carga — activo mientras se simula el envío.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ¿Qué? Estado del resultado del envío: null = sin intentar, success / error.
  const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);

  /**
   * ¿Qué? Actualiza un campo de texto o email en el estado del formulario.
   * ¿Para qué? Patrón controlled component — React controla el valor de cada input.
   * ¿Impacto? Al escribir se limpia el error del campo correspondiente para dar feedback
   *           inmediato de que el usuario está corrigiendo el problema.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar el error del campo que el usuario está editando
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * ¿Qué? Actualiza el campo booleano del checkbox de privacidad.
   * ¿Para qué? El checkbox necesita manejar `checked` en lugar de `value`.
   * ¿Impacto? Si el usuario marca el checkbox, se limpia el error de privacidad.
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, acceptsPrivacy: e.target.checked }));
    if (errors.acceptsPrivacy) {
      setErrors((prev) => ({ ...prev, acceptsPrivacy: undefined }));
    }
  };

  /**
   * ¿Qué? Maneja el envío del formulario: valida → simula envío → muestra resultado.
   * ¿Para qué? En producción, aquí se haría un fetch/axios a POST /api/v1/contact.
   *            En este proyecto educativo, simula la operación con un setTimeout.
   * ¿Impacto? Si la validación falla, se muestran todos los errores y el foco va
   *           al primer campo inválido (accesibilidad WCAG 3.3.1 Error Identification).
   */
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitResult(null);

    // Validar todos los campos
    const validationErrors = validateForm(formData, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Desplazar al primer error visible
      const firstErrorField = document.querySelector<HTMLElement>("[aria-invalid='true']");
      firstErrorField?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * ¿Qué? Simulación del envío — en producción sería:
       *   await axios.post('/api/v1/contact', formData);
       * ¿Para qué? Demostrar el patrón async con loading state y manejo de resultado.
       * ¿Impacto? El usuario ve el spinner, luego el mensaje de éxito — UX completa.
       */
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitResult("success");
      setFormData(INITIAL_FORM);
      setErrors({});
    } catch {
      // En producción, el catch manejaría errores de red (500, timeout, etc.)
      setSubmitResult("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Navbar del proyecto — incluye LanguageSwitcher y ThemeToggle */}
      <Navbar />

      <main>
        <div className="mx-auto max-w-5xl px-6 py-14">
          {/* Encabezado de la página */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {t("contact.title")}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-500">{t("contact.subtitle")}</p>
          </div>

          {/* Aviso educativo */}
          <div
            className="mb-10 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-5 py-4"
            role="note"
            aria-label={t("contact.eduNotice.title")}
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500"
              aria-hidden="true"
            />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-semibold">{t("contact.eduNotice.title")}</p>
              <p className="mt-1 text-amber-700 dark:text-amber-400">
                {t("contact.eduNotice.body")}{" "}
                <code className="rounded bg-amber-200/60 dark:bg-amber-900/50 px-1 font-mono text-xs">
                  POST /api/v1/contact
                </code>
              </p>
            </div>
          </div>

          {/* Grid — formulario (2/3) + info de contacto (1/3) */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Formulario */}
            <section className="lg:col-span-2" aria-labelledby="form-heading">
              <h2
                id="form-heading"
                className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {t("contact.form.heading")}
              </h2>

              {submitResult === "success" ? (
                <ContactSuccessPanel onReset={() => setSubmitResult(null)} t={t} />
              ) : (
                <ContactFormFields
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  submitResult={submitResult}
                  onChange={handleChange}
                  onCheckboxChange={handleCheckboxChange}
                  onSubmit={handleSubmit}
                  t={t}
                />
              )}
            </section>

            {/* Información de contacto */}
            <aside className="space-y-6" aria-labelledby="contact-info-heading">
              <h2
                id="contact-info-heading"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {t("contact.info.heading")}
              </h2>

              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  {t("contact.info.antiSpam.title")}
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  {t("contact.info.antiSpam.body")}
                </p>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-600">
                    {t("contact.info.phone")}
                  </dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-400">{CONTACT_INFO.telefono}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-600">
                    {t("contact.info.address")}
                  </dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-400">
                    {CONTACT_INFO.direccion}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-600">
                    {t("contact.info.hours")}
                  </dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-400">{CONTACT_INFO.horario}</dd>
                </div>
              </dl>

              <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("contact.info.deadlines.title")}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-400">
                    <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <span>{t("contact.info.deadlines.queries")}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-400">
                    <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <span>{t("contact.info.deadlines.claims")}</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 py-6 dark:border-gray-800">
        <p className="text-center text-xs text-gray-500 dark:text-gray-600">
          NN Auth System — {t("contact.footer.credit")} &middot; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
