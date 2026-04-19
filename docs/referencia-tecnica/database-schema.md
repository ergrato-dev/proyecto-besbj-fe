# Esquema de Base de Datos — NN Auth System (Spring Boot)

> Stack: PostgreSQL 17+ | ORM: Spring Data JPA (Hibernate 6) | Migraciones: Flyway 9+
> Referencia funcional: [proyecto-be-fe](https://github.com/ergrato-dev/proyecto-be-fe) (mismo esquema, SQLAlchemy + Alembic)

---

## Índice

1. [Información General](#1-información-general)
2. [Diagrama Entidad-Relación](#2-diagrama-entidad-relación)
3. [Tablas](#3-tablas)
   - [users](#31-tabla-users)
   - [password_reset_tokens](#32-tabla-password_reset_tokens)
   - [email_verification_tokens](#33-tabla-email_verification_tokens)
4. [Migraciones Flyway](#4-migraciones-flyway)
5. [Entidades JPA con Hibernate](#5-entidades-jpa-con-hibernate)
6. [Repositorios Spring Data JPA](#6-repositorios-spring-data-jpa)
7. [Conexión y Configuración](#7-conexión-y-configuración)
8. [Diferencias vs Referencia FastAPI](#8-diferencias-vs-referencia-fastapi)

---

## 1. Información General

| Propiedad                  | Valor               |
|----------------------------|---------------------|
| Motor de base de datos      | PostgreSQL 17+      |
| Extensión UUID              | `pgcrypto` o `uuid-ossp` |
| ORM / capa de acceso a datos | Spring Data JPA (Hibernate 6) |
| Herramienta de migraciones  | Flyway 9+           |
| Número de tablas            | 3                   |
| Tipo de primary keys        | UUID                |
| Timestamps                  | `TIMESTAMPTZ` con zona horaria |

### Convenciones de nomenclatura

| Elemento         | Convención    | Ejemplo             |
|-----------------|---------------|---------------------|
| Tablas          | snake_case, plural | `users`, `password_reset_tokens` |
| Columnas        | snake_case    | `full_name`, `created_at` |
| Primary keys    | `id`          | `id UUID PRIMARY KEY` |
| Foreign keys    | `<tabla_singular>_id` | `user_id` |
| Timestamps      | `created_at`, `updated_at` | — |
| Flags booleanos | `is_<estado>` | `is_active`, `is_email_verified` |

> **Compatibilidad total con la referencia:** El esquema de base de datos es **idéntico** al del proyecto `proyecto-be-fe` (FastAPI). Esto permite que ambos backends compartan la misma base de datos PostgreSQL sin conflicto.

---

## 2. Diagrama Entidad-Relación

```
┌──────────────────────────────────────────────┐
│                    users                     │
├──────────────────────────────────────────────┤
│ PK  id                UUID                   │
│     email             VARCHAR(255)  UNIQUE    │
│     full_name         VARCHAR(255)           │
│     hashed_password   VARCHAR(255)           │
│     is_active         BOOLEAN      DEFAULT T │
│     is_email_verified BOOLEAN      DEFAULT F │
│     created_at        TIMESTAMPTZ           │
│     updated_at        TIMESTAMPTZ           │
└────────────────────┬─────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ↓                     ↓
┌─────────────────────┐   ┌──────────────────────────────┐
│ password_reset_     │   │ email_verification_tokens    │
│     tokens          │   │                              │
├─────────────────────┤   ├──────────────────────────────┤
│ PK  id        UUID  │   │ PK  id        UUID           │
│ FK  user_id   UUID  │   │ FK  user_id   UUID           │
│     token     VC255 │   │     token     VARCHAR(255)   │
│     expires_at TSTZ │   │     expires_at TIMESTAMPTZ   │
│     used      BOOL  │   │     used      BOOLEAN        │
│     created_at TSTZ │   │     created_at TIMESTAMPTZ   │
└─────────────────────┘   └──────────────────────────────┘

FK → CASCADE DELETE: si se elimina un user, se eliminan sus tokens automáticamente
```

---

## 3. Tablas

### 3.1 Tabla `users`

**Descripción:** Almacena todos los usuarios registrados en el sistema. Es la tabla central del sistema de autenticación.

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id                  UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
    email               VARCHAR(255)  NOT NULL UNIQUE,
    full_name           VARCHAR(255)  NOT NULL,
    hashed_password     VARCHAR(255)  NOT NULL,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índice en email para búsquedas rápidas en login/registro
CREATE INDEX idx_users_email ON users(email);
```

**Columnas detalladas:**

| Columna             | Tipo          | Nulo | Default              | Descripción                                    |
|---------------------|---------------|------|----------------------|------------------------------------------------|
| `id`                | UUID          | No   | `gen_random_uuid()`  | Identificador único — se usa en el payload JWT  |
| `email`             | VARCHAR(255)  | No   | —                    | Email del usuario; único en toda la tabla       |
| `full_name`         | VARCHAR(255)  | No   | —                    | Nombre completo del usuario                     |
| `hashed_password`   | VARCHAR(255)  | No   | —                    | Hash BCrypt de la contraseña (nunca texto plano)|
| `is_active`         | BOOLEAN       | No   | TRUE                 | Permite desactivar cuentas sin eliminarlas      |
| `is_email_verified` | BOOLEAN       | No   | FALSE                | Controla acceso al login                        |
| `created_at`        | TIMESTAMPTZ   | No   | NOW()                | Fecha de registro (con zona horaria)            |
| `updated_at`        | TIMESTAMPTZ   | No   | NOW()                | Fecha de última modificación                    |

**Notas importantes:**
- `hashed_password` almacena el resultado de `BCryptPasswordEncoder.encode()`. El formato BCrypt tiene ~60 caracteres, por eso VARCHAR(255) es suficiente.
- `is_active = FALSE` se usa para suspender cuentas sin perder el historial del usuario.
- `is_email_verified = FALSE` bloquea el login hasta que el usuario confirme su email.
- `gen_random_uuid()` requiere la extensión `pgcrypto` en PostgreSQL (incluida por defecto en Postgres 13+).

---

### 3.2 Tabla `password_reset_tokens`

**Descripción:** Almacena los tokens temporales generados cuando un usuario solicita recuperar su contraseña. Cada token tiene una validez de 1 hora.

```sql
-- V2__create_password_reset_tokens_table.sql
CREATE TABLE password_reset_tokens (
    id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID          NOT NULL,
    token       VARCHAR(255)  NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ   NOT NULL,
    used        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Índice en token para búsquedas rápidas al validar el token
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
```

**Columnas detalladas:**

| Columna      | Tipo         | Nulo | Default             | Descripción                                        |
|--------------|--------------|------|---------------------|----------------------------------------------------|
| `id`         | UUID         | No   | `gen_random_uuid()` | Identificador interno del registro                 |
| `user_id`    | UUID         | No   | —                   | FK a `users.id`; CASCADE DELETE                    |
| `token`      | VARCHAR(255) | No   | —                   | Token UUID enviado en el email (único)              |
| `expires_at` | TIMESTAMPTZ  | No   | —                   | Calculado como `NOW() + 1 hora` al crear el token  |
| `used`       | BOOLEAN      | No   | FALSE               | Se cambia a TRUE tras usar el token exitosamente   |
| `created_at` | TIMESTAMPTZ  | No   | NOW()               | Fecha de creación del token                        |

**Ciclo de vida de un token:**
```
1. Usuario solicita POST /api/v1/auth/forgot-password
2. AuthService crea un registro con:
   - token = UUID.randomUUID().toString()
   - expires_at = Instant.now().plus(1, ChronoUnit.HOURS)
   - used = false
3. Se envía el token al email del usuario
4. Usuario hace POST /api/v1/auth/reset-password con el token
5. AuthService verifica:
   - El token existe en la BD
   - expires_at > NOW()
   - used = false
6. Si todo es válido: actualiza la contraseña, marca used = true
```

---

### 3.3 Tabla `email_verification_tokens`

**Descripción:** Almacena los tokens temporales para verificar el email de los usuarios recién registrados. Cada token tiene una validez de 24 horas.

```sql
-- V3__create_email_verification_tokens_table.sql
CREATE TABLE email_verification_tokens (
    id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID          NOT NULL,
    token       VARCHAR(255)  NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ   NOT NULL,
    used        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_email_verification_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Índice en token para búsquedas rápidas al verificar
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
```

**Columnas detalladas:**

| Columna      | Tipo         | Nulo | Default             | Descripción                                          |
|--------------|--------------|------|---------------------|------------------------------------------------------|
| `id`         | UUID         | No   | `gen_random_uuid()` | Identificador interno del registro                   |
| `user_id`    | UUID         | No   | —                   | FK a `users.id`; CASCADE DELETE                      |
| `token`      | VARCHAR(255) | No   | —                   | Token UUID enviado en el email de bienvenida (único) |
| `expires_at` | TIMESTAMPTZ  | No   | —                   | Calculado como `NOW() + 24 horas` al crear el token  |
| `used`       | BOOLEAN      | No   | FALSE               | Se cambia a TRUE tras verificación exitosa           |
| `created_at` | TIMESTAMPTZ  | No   | NOW()               | Fecha de creación del token                          |

**Diferencia clave respecto a `password_reset_tokens`:**
- La única diferencia funcional es la duración del token (24h en lugar de 1h).
- Al usarlo, se actualiza `users.is_email_verified = TRUE` en lugar de `users.hashed_password`.

---

## 4. Migraciones Flyway

### 4.1 ¿Qué es Flyway y cómo reemplaza a Alembic?

| Aspecto             | Alembic (referencia)              | Flyway (este proyecto)                   |
|---------------------|-----------------------------------|------------------------------------------|
| Lenguaje            | Python + archivo `.py` por versión | SQL puro o Java, archivos `.sql`         |
| Ubicación           | `alembic/versions/`               | `src/main/resources/db/migration/`       |
| Nombres de archivo  | `{hash}_{descripcion}.py`         | `V{n}__{descripcion}.sql`                |
| Ejecutar migraciones | `alembic upgrade head`           | Automático al arrancar Spring Boot       |
| Tabla de historial  | `alembic_version`                 | `flyway_schema_history`                  |
| Reversión           | `alembic downgrade -1`            | No recomendado (crear nueva migración)   |

### 4.2 Convención de nombres de archivos

```
V{número}__{descripción_con_guiones_bajos}.sql

✅ Ejemplos correctos:
V1__create_users_table.sql
V2__create_password_reset_tokens_table.sql
V3__create_email_verification_tokens_table.sql
V4__add_login_attempts_to_users.sql

❌ Ejemplos incorrectos:
1_create_users.sql          ← Falta la V
V1_create_users_table.sql   ← Falta el doble guion bajo
v1__create_users_table.sql  ← La V debe ser mayúscula
```

### 4.3 Estructura de archivos de migración

```
be/src/main/resources/
└── db/
    └── migration/
        ├── V1__create_users_table.sql
        ├── V2__create_password_reset_tokens_table.sql
        └── V3__create_email_verification_tokens_table.sql
```

### 4.4 Configuración en `application.yml`

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: false
    validate-on-migrate: true
```

### 4.5 Regla fundamental de Flyway

> **NUNCA modificar un archivo de migración ya aplicado.** Si se necesita un cambio en el esquema, se crea un nuevo archivo con el siguiente número de versión.

```sql
-- ✅ CORRECTO: Agregar columna en nueva migración
-- V4__add_phone_to_users.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- ❌ INCORRECTO: Modificar V1 que ya fue aplicado
-- V1__create_users_table.sql (NO editar este archivo)
```

---

## 5. Entidades JPA con Hibernate

### 5.1 `User.java`

```java
/**
 * Archivo: User.java
 * Descripción: Entidad JPA que representa la tabla `users` en la base de datos.
 * ¿Para qué? Permite a Hibernate mapear registros de la BD a objetos Java y viceversa.
 * ¿Impacto? Es el modelo central del sistema. Todo el auth gira alrededor de esta entidad.
 */
@Entity
@Table(name = "users")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "is_email_verified", nullable = false)
    private boolean isEmailVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

### 5.2 `PasswordResetToken.java`

```java
/**
 * Archivo: PasswordResetToken.java
 * Descripción: Entidad JPA que mapea la tabla `password_reset_tokens`.
 * ¿Para qué? Almacenar tokens temporales para el flujo de recuperación de contraseña.
 * ¿Impacto? Sin esta entidad no sería posible el flujo forget/reset de contraseña.
 */
@Entity
@Table(name = "password_reset_tokens")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ¿Qué? Verifica si el token ya expiró.
    // ¿Para qué? Centralizamos la lógica de expiración en la entidad para evitar
    //            que diferentes partes del código implementen la comparación de fechas.
    // ¿Impacto? Si se compara mal, tokens expirados podrían usarse, comprometiendo la seguridad.
    public boolean isExpired() {
        return Instant.now().isAfter(this.expiresAt);
    }
}
```

### 5.3 `EmailVerificationToken.java`

```java
/**
 * Archivo: EmailVerificationToken.java
 * Descripción: Entidad JPA para los tokens de verificación de email.
 * ¿Para qué? Verifica que el email del usuario existe y le pertenece antes de activar la cuenta.
 * ¿Impacto? Sin verificación de email, cualquiera podría registrarse con emails ajenos.
 */
@Entity
@Table(name = "email_verification_tokens")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiresAt);
    }
}
```

---

## 6. Repositorios Spring Data JPA

Spring Data JPA genera automáticamente las consultas SQL a partir de los nombres de los métodos. Esto equivale a las consultas ORM de SQLAlchemy en la referencia FastAPI.

### 6.1 `UserRepository.java`

```java
/**
 * Archivo: UserRepository.java
 * Descripción: Repositorio JPA para operaciones CRUD sobre la tabla `users`.
 * ¿Para qué? Proveer acceso a la BD para buscar, crear y actualizar usuarios.
 * ¿Impacto? Sin este repositorio, AuthService no podría consultar ni guardar usuarios.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // ¿Qué? Busca un usuario ignorando mayúsculas/minúsculas en el email.
    // ¿Para qué? Los emails son case-insensitive (user@domain.com = USER@DOMAIN.COM).
    // ¿Impacto? Sin ignorar case, un usuario podría registrarse dos veces con el mismo email.
    Optional<User> findByEmailIgnoreCase(String email);

    // ¿Qué? Verifica si ya existe un usuario con ese email.
    // ¿Para qué? Verificación rápida en el registro sin traer el objeto completo.
    // ¿Impacto? Previene emails duplicados en la tabla de usuarios.
    boolean existsByEmailIgnoreCase(String email);
}
```

**SQL equivalente generado por Hibernate:**
```sql
-- findByEmailIgnoreCase
SELECT * FROM users WHERE LOWER(email) = LOWER(:email);

-- existsByEmailIgnoreCase
SELECT COUNT(*) > 0 FROM users WHERE LOWER(email) = LOWER(:email);
```

### 6.2 `PasswordResetTokenRepository.java`

```java
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    // Elimina tokens expirados y no usados (para limpieza programada)
    void deleteByExpiresAtBeforeAndUsedFalse(Instant cutoff);
}
```

### 6.3 `EmailVerificationTokenRepository.java`

```java
@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByToken(String token);
}
```

---

## 7. Conexión y Configuración

### 7.1 Configuración en `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:nn_auth_db}
    username: ${DB_USERNAME:nn_user}
    password: ${DB_PASSWORD:nn_password}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate        # Hibernate NO crea tablas — Flyway lo hace
    show-sql: false             # true solo en local para debugging
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc:
          time_zone: UTC        # Todas las fechas en UTC
```

> **Importante:** `ddl-auto: validate` hace que Hibernate solo verifique que el esquema existente coincide con las entidades. **NO crea tablas.** Flyway es el responsable de crear y migrar el esquema.

### 7.2 Variables de entorno requeridas

```bash
# be/.env.example
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nn_auth_db
DB_USERNAME=nn_user
DB_PASSWORD=nn_password
```

### 7.3 Pool de conexiones HikariCP

Spring Boot incluye HikariCP (el pool de conexiones más rápido para Java) por defecto.

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10      # Máximo de conexiones simultáneas
      minimum-idle: 5            # Mínimo de conexiones abiertas
      connection-timeout: 30000  # Tiempo máx. esperando una conexión (ms)
      idle-timeout: 600000       # Tiempo máx. que una conexión puede estar inactiva (ms)
```

### 7.4 Acceso a la base de datos en desarrollo

Con Docker:
```bash
# Conectarse al contenedor PostgreSQL
docker exec -it nn_auth_db psql -U nn_user -d nn_auth_db

# Ver tablas creadas por Flyway
\dt

# Ver historial de migraciones
SELECT * FROM flyway_schema_history;

# Verificar usuarios
SELECT id, email, is_email_verified, created_at FROM users;
```

Sin Docker (PostgreSQL local):
```bash
psql -U nn_user -d nn_auth_db -h localhost

# Crear la base de datos si no existe (primera vez)
createdb -U postgres nn_auth_db
psql -U postgres -c "CREATE USER nn_user WITH PASSWORD 'nn_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nn_auth_db TO nn_user;"
```

---

## 8. Diferencias vs Referencia FastAPI

| Aspecto                  | FastAPI + SQLAlchemy (referencia)    | Spring Boot + JPA (este proyecto)             |
|--------------------------|--------------------------------------|-----------------------------------------------|
| ORM                      | SQLAlchemy 2.0 (async)               | Hibernate 6 (Spring Data JPA)                 |
| Definición de modelos    | Clase Python hereda de `Base`        | Clase Java con `@Entity`                      |
| Migraciones              | Alembic (archivos Python)            | Flyway (archivos SQL)                         |
| Auto-creación de tablas  | `Base.metadata.create_all()` (dev)   | Solo `validate` — tablas creadas por Flyway   |
| Consultas                | SQLAlchemy ORM / Core                | Spring Data JPA (nombre del método → SQL)     |
| Transacciones             | `async with db.begin()`              | `@Transactional` en métodos de servicio       |
| UUID en PostgreSQL        | `uuid.UUID` Python                   | `java.util.UUID`                              |
| Timestamps                | `datetime.utcnow()`                  | `@CreationTimestamp`, `@UpdateTimestamp`      |
| Relaciones                | `relationship("User", ...)` Python   | `@ManyToOne`, `@OneToMany` Java               |
| Pool de conexiones        | asyncpg / psycopg3                   | HikariCP (incluido en Spring Boot)            |

### Esquema SQL — 100% compatible

El esquema SQL es **idéntico** entre ambas implementaciones. Las mismas tablas, las mismas columnas, los mismos tipos de datos. Esto garantiza que ambos proyectos pueden conectarse a la misma base de datos PostgreSQL sin cambios.

---

*Documentación generada para el proyecto NN Auth System. Stack: Spring Boot 3.2+ (Java 21) + PostgreSQL 17+.*
*Ver [api-endpoints.md](api-endpoints.md) para los endpoints y [architecture.md](architecture.md) para la arquitectura.*
