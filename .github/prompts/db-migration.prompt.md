---
description: "Genera una migración Flyway (script SQL) para cambios en el esquema de la base de datos: nuevas tablas, columnas, índices o constraints. Usar cuando se modifica una entidad JPA."
name: "Migración Flyway"
argument-hint: "Describe el cambio en la BD: qué tabla/columna se crea, modifica o elimina, y por qué"
agent: "agent"
---

# Migración Flyway — NN Auth System (Spring Boot)

Genera la migración Flyway para el cambio de esquema indicado.

## Convenciones obligatorias

- **NUNCA** modificar la base de datos manualmente — siempre vía Flyway
- **NUNCA** editar un script de migración ya ejecutado — crear uno nuevo con versión mayor
- Nombres de tablas: `snake_case`, plural (e.g. `users`, `password_reset_tokens`)
- Nombres de columnas: `snake_case` (e.g. `created_at`, `hashed_password`)
- Toda tabla debe tener `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Tablas que se actualizan deben tener `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Primary keys: `UUID DEFAULT gen_random_uuid()`

## Archivos de referencia

- Entidad User: [be/src/main/java/com/nn/auth/entity/User.java](../../../be/src/main/java/com/nn/auth/entity/User.java)
- Entidades existentes: [be/src/main/java/com/nn/auth/entity/](../../../be/src/main/java/com/nn/auth/entity/)
- Migraciones existentes: [be/src/main/resources/db/migration/](../../../be/src/main/resources/db/migration/)
- Configuración Flyway: [be/src/main/resources/application.yml](../../../be/src/main/resources/application.yml)

## Lo que debes generar

### 1. Actualizar la entidad JPA (`be/src/main/java/com/nn/auth/entity/`)

Si el cambio implica una nueva entidad, crear `NombreEntidad.java`.
Si modifica una existente, editar el archivo correspondiente.

Ejemplo de campo bien definido:

```java
/**
 * ¿Qué? Columna que almacena el locale preferido del usuario.
 * ¿Para qué? Persistir la preferencia de idioma entre sesiones.
 * ¿Impacto? Sin esta columna, el idioma se resetea en cada login.
 */
@Column(name = "locale", nullable = false, length = 10)
private String locale = "es";
```

### 2. Crear el script Flyway en `be/src/main/resources/db/migration/`

El nombre del archivo debe seguir el patrón: `V{n}__{descripcion_snake_case}.sql`

Estructura del script:

```sql
-- V4__add_locale_to_users.sql
--
-- ¿Qué? Agrega la columna locale a la tabla users.
-- ¿Para qué? Persistir la preferencia de idioma del usuario entre sesiones.
-- ¿Impacto? Sin esta migración los usuarios no pueden guardar su idioma preferido.

ALTER TABLE users
    ADD COLUMN locale VARCHAR(10) NOT NULL DEFAULT 'es';
```

**CRÍTICO**: Los scripts Flyway no tienen función de rollback automático.
Documentar cómo revertir manualmente si se necesita:

```sql
-- Para revertir manualmente (NO ejecutar automáticamente):
-- ALTER TABLE users DROP COLUMN locale;
```

### 3. Actualizar el DTO de respuesta si corresponde (`be/src/main/java/com/nn/auth/dto/response/`)

Si la columna nueva debe aparecer en requests o responses, actualizar los DTOs afectados
en [be/src/main/java/com/nn/auth/dto/](../../../be/src/main/java/com/nn/auth/dto/).

## Cómo aplicar la migración (comandos de referencia)

```bash
cd be

# Flyway se ejecuta automáticamente al arrancar la app
./mvnw spring-boot:run

# Verificar estado de migraciones (requiere Flyway CLI o endpoint actuator)
# La app loggea: "Successfully applied N migration(s)"

# Si algo falla, revisar:
# - Logs de Flyway en la consola de Spring Boot
# - Tabla flyway_schema_history en PostgreSQL
```

## Tipos de datos comunes en este proyecto

| Java / JPA                                    | SQL PostgreSQL | Uso                         |
| --------------------------------------------- | -------------- | --------------------------- |
| `String` + `@Column(length=255)`              | `VARCHAR(255)` | Texto corto (email, nombre) |
| `String` + `@Column(columnDefinition="TEXT")` | `TEXT`         | Texto largo                 |
| `Boolean`                                     | `BOOLEAN`      | Flags activo/inactivo       |
| `LocalDateTime` + `@Column`                   | `TIMESTAMPTZ`  | Fechas con timezone         |
| `UUID` + `@GeneratedValue`                    | `UUID`         | Primary keys                |

## Descripción del cambio de esquema a implementar

$input
