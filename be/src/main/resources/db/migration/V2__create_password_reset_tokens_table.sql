-- =============================================================================
-- V2__create_password_reset_tokens_table.sql
-- ¿Qué? Crea la tabla de tokens para el flujo "Olvidé mi contraseña".
-- ¿Para qué? Almacenar tokens de un solo uso con expiración (1h) que permitan
--            resetear contraseñas sin exponer credenciales por email.
-- ¿Impacto? Sin esta tabla, el endpoint /api/v1/auth/forgot-password no puede
--            funcionar — el flujo de recuperación queda bloqueado.
-- Seguridad: CASCADE DELETE garantiza que si se elimina el usuario, sus tokens
--            también se eliminan — no quedan tokens huérfanos en la BD.
-- =============================================================================

CREATE TABLE password_reset_tokens (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),

    -- FK al usuario dueño del token — CASCADE al borrar el usuario
    user_id    UUID         NOT NULL,

    -- El token UUID enviado en el enlace del email de recuperación
    token      VARCHAR(255) NOT NULL,

    -- Moment en que el token deja de ser válido (creación + 1 hora)
    expires_at TIMESTAMPTZ  NOT NULL,

    -- TRUE tras el primer uso exitoso — previene reutilización del token
    used       BOOLEAN      NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uq_password_reset_tokens_token UNIQUE (token),
    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice en token para búsqueda rápida al procesar el enlace del email
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);

COMMENT ON TABLE password_reset_tokens IS 'Tokens de un solo uso para recuperación de contraseña (expiran en 1h)';
COMMENT ON COLUMN password_reset_tokens.used IS 'TRUE si el token ya fue utilizado para resetear — no puede reutilizarse';
