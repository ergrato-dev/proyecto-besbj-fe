-- =============================================================================
-- V1__create_users_table.sql
-- ¿Qué? Crea la tabla principal de usuarios del sistema NN Auth.
-- ¿Para qué? Almacenar credenciales (hasheadas) y datos de perfil de cada usuario.
-- ¿Impacto? Esta es la tabla central del sistema — todas las demás la referencian.
--            Un error en esta migración bloquea el arranque de la app (Flyway falla).
-- =============================================================================

CREATE TABLE users (
    -- UUID generado por PostgreSQL 17 (gen_random_uuid() es built-in desde PG 13)
    id               UUID         NOT NULL DEFAULT gen_random_uuid(),

    -- Email único — se usa como username en el login
    email            VARCHAR(255) NOT NULL,

    -- Nombre completo — solo para mostrar en la UI
    full_name        VARCHAR(255) NOT NULL,

    -- Hash BCrypt de la contraseña — NUNCA texto plano
    hashed_password  VARCHAR(255) NOT NULL,

    -- Bandera de cuenta activa — permite deshabilitar sin borrar
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Bandera de email verificado — la cuenta está bloqueada hasta verificar
    is_email_verified BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Timestamps en UTC con zona horaria
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Índice en email para búsquedas rápidas en login (case-insensitive)
-- ¿Por qué? Sin índice, cada login hace un full table scan — O(n) en lugar de O(log n)
CREATE INDEX idx_users_email ON users (LOWER(email));

-- Comentarios de documentación en la BD
COMMENT ON TABLE users IS 'Usuarios registrados en el sistema NN Auth';
COMMENT ON COLUMN users.hashed_password IS 'Hash BCrypt — NUNCA almacenar contraseñas en texto plano';
COMMENT ON COLUMN users.is_email_verified IS 'FALSE hasta que el usuario haga clic en el enlace de verificación';
