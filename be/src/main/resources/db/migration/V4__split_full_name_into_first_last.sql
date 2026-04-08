-- =============================================================================
-- V4__split_full_name_into_first_last.sql
-- ¿Qué? Separa el campo full_name en first_name y last_name en la tabla users.
-- ¿Para qué? Un campo único no permite ordenar por apellido, filtrar por nombre
--            ni generar reportes nominales correctamente.
--            ORDER BY last_name es imposible con datos concatenados.
-- ¿Impacto? Migración de datos: se parte full_name por el primer espacio.
--            Todo lo anterior al primer espacio → first_name.
--            Todo lo posterior → last_name (puede quedar vacío si no había espacio,
--            en cuyo caso se rellena con '-' para respetar el NOT NULL).
-- Reversibilidad: full_name puede reconstruirse con first_name || ' ' || last_name.
-- =============================================================================

-- 1. Agregar las dos nuevas columnas como nullable (para poder migrar los datos)
ALTER TABLE users
    ADD COLUMN first_name VARCHAR(150),
    ADD COLUMN last_name  VARCHAR(150);

-- 2. Migrar datos existentes desde full_name
--    SPLIT_PART(str, delimitador, n): función nativa de PostgreSQL.
--    SPLIT_PART(full_name, ' ', 1) → primer token (nombres)
--    NULLIF(SPLIT_PART(full_name, ' ', 2), '') → segundo token o NULL si no hay
-- ¿Impacto? Si full_name era "Juan" (sin espacio), last_name queda '-'.
--           Si full_name era "Juan García López", first_name='Juan', last_name='García López'
--           usando SUBSTRING para capturar todo desde el segundo token en adelante.
UPDATE users
SET
    first_name = SPLIT_PART(full_name, ' ', 1),
    last_name  = CASE
                     WHEN POSITION(' ' IN full_name) > 0
                     THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
                     ELSE '-'
                 END;

-- 3. Aplicar NOT NULL ahora que los datos están poblados
ALTER TABLE users
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name  SET NOT NULL;

-- 4. Eliminar la columna antigua (ya no es necesaria)
-- ¿Por qué eliminar y no mantener? Dos fuentes de verdad causan inconsistencias.
--   Si full_name y first_name/last_name divergen, cuál es correcto?
ALTER TABLE users
    DROP COLUMN full_name;

-- 5. Índice para ordenar/filtrar por apellido eficientemente
-- ¿Para qué? ORDER BY last_name en reportes sin full table scan
CREATE INDEX idx_users_last_name ON users (last_name);

-- Comentarios de documentación
COMMENT ON COLUMN users.first_name IS 'Nombres del usuario (ej: Juan Carlos)';
COMMENT ON COLUMN users.last_name  IS 'Apellidos del usuario (ej: García López)';
