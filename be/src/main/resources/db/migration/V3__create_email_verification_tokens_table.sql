-- =============================================================================
-- V3__create_email_verification_tokens_table.sql
-- ¿Qué? Crea la tabla de tokens para verificar el email tras el registro.
-- ¿Para qué? Confirmar que el usuario tiene acceso real al email registrado.
--            La cuenta queda con is_email_verified=FALSE hasta usar este token.
-- ¿Impacto? Sin verificación de email, alguien puede registrarse con el email
--            de otra persona y recibir notificaciones destinadas a ella.
-- =============================================================================

CREATE TABLE email_verification_tokens (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),

    -- FK al usuario que debe verificar su email — CASCADE al borrar el usuario
    user_id    UUID         NOT NULL,

    -- El token UUID enviado en el enlace del email de bienvenida
    token      VARCHAR(255) NOT NULL,

    -- Momento en que el token deja de ser válido (creación + 24 horas)
    expires_at TIMESTAMPTZ  NOT NULL,

    -- TRUE tras el primer clic en el enlace — previene doble verificación
    used       BOOLEAN      NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_email_verification_tokens PRIMARY KEY (id),
    CONSTRAINT uq_email_verification_tokens_token UNIQUE (token),
    CONSTRAINT fk_email_verification_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice en token para búsqueda rápida al procesar el enlace del email
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens (token);

COMMENT ON TABLE email_verification_tokens IS 'Tokens de un solo uso para verificar el email (expiran en 24h)';
COMMENT ON COLUMN email_verification_tokens.used IS 'TRUE si el token ya fue utilizado para verificar el email';
