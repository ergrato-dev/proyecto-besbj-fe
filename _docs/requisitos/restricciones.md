# Restricciones del Proyecto — NN Auth System (Spring Boot Java)

> Proyecto: NN Auth System — Spring Boot Edition
> Tipo: Proyecto educativo — SENA
> Stack: Spring Boot 3 (Java 21) + React + PostgreSQL 17 + Docker

---

## RT-001 — Stack Tecnológico

**Restricción**: El stack tecnológico es fijo y no puede cambiarse a alternativas no aprobadas.

| Capa           | Tecnología aprobada                   | Alternativas NO permitidas          |
|----------------|---------------------------------------|--------------------------------------|
| Backend        | Spring Boot 3.2+ (Java 21)           | Quarkus, Micronaut, Helidon, Go      |
| Gestor BD Java | Maven Wrapper (`./mvnw`)              | Gradle, mvn global de otra versión   |
| ORM            | Spring Data JPA + Hibernate 6         | MyBatis, JDBI, raw JDBC              |
| Migraciones    | Flyway 9+                             | Liquibase, scripts SQL manuales      |
| JWT            | JJWT (`io.jsonwebtoken`) 0.12+        | Auth0 JWT, Nimbus JOSE               |
| Validación     | Bean Validation (Jakarta) 3.x         | Validación manual en service         |
| Rate Limiting  | Bucket4j 8+                           | Resilience4j, Guava RateLimiter      |
| API Docs       | SpringDoc OpenAPI 2.x (Swagger UI)    | Redoc, documentación manual          |
| Frontend       | React 18 + Vite 6 + TypeScript 5      | Vue, Angular, Svelte                 |
| CSS            | TailwindCSS 4                         | Bootstrap, Material UI, SCSS         |
| Gestor paquetes frontend | `pnpm` (obligatorio)       | npm, yarn (prohibidos)               |
| BD             | PostgreSQL 17                         | MySQL, SQLite, MongoDB               |
| Dev containers | Docker + Docker Compose 2.20+         | Podman, Rancher Desktop (no testeado)|

**Motivación**: La serie educativa compara implementaciones del mismo sistema en
distintos stacks. Mezclar tecnologías destruye el valor comparativo del aprendizaje.

---

## RT-002 — Idioma en el Código

**Restricción**: Todo el código fuente y los identificadores deben estar en **inglés**.
Los comentarios y la documentación deben estar en **español**.

### Alcance "inglés obligatorio"
- Variables, parámetros, constantes, métodos, clases, interfaces
- Nombres de paquetes y archivos de código (`AuthService.java`, `useAuth.ts`)
- Rutas de la API (`/api/v1/auth/register`)
- Tablas y columnas de base de datos (`users`, `hashed_password`)
- Mensajes de commit (Conventional Commits en inglés)
- Ramas de git (`feat/user-registration`)
- Scripts de migración Flyway (`V1__create_users_table.sql`)

### Alcance "español obligatorio"
- Comentarios en el código (`//`, `/* */`, `/** Javadoc */`)
- Documentación JSDoc en TypeScript
- Archivos `.md` (README, docs)
- Descripciones en `application.yml`

```java
// ✅ CORRECTO
public Optional<User> findUserByEmail(String email) { ... }

// ❌ INCORRECTO
public Optional<Usuario> buscarUsuarioPorEmail(String correo) { ... }
```

**Motivación**: Los identificadores en inglés son estándar en la industria global.
Los comentarios en español facilitan el aprendizaje del estudiante SENA.

---

## RT-003 — Seguridad Obligatoria

**Restricción**: Las siguientes prácticas de seguridad son no negociables.

| ID      | Práctica                                                                             |
|---------|--------------------------------------------------------------------------------------|
| RT-003.1 | Las contraseñas deben hashearse con BCrypt (factor de costo ≥10) antes de persistir |
| RT-003.2 | Los JWT deben firmarse con secretos de mínimo 32 caracteres aleatorios               |
| RT-003.3 | El secret JWT se valida al iniciar la app — si tiene <32 chars, se rechaza el boot   |
| RT-003.4 | Los endpoints de auth deben tener rate limiting (Bucket4j, máx. 10 req / 15 min)     |
| RT-003.5 | La API debe configurar HTTPS en producción (TLS 1.2+)                               |
| RT-003.6 | CORS debe configurar orígenes explícitos — nunca `allowedOrigins("*")` en producción |
| RT-003.7 | Toda consulta a la BD debe usar Spring Data JPA (nunca SQL crudo con concatenación)  |
| RT-003.8 | Swagger UI debe deshabilitarse en el perfil de producción (`ENVIRONMENT=production`) |
| RT-003.9 | Los mensajes de error de auth deben ser genéricos (no revelar si el email existe)    |

**Motivación**: Implementar las mitigaciones del OWASP Top 10 2021.
Ver `_docs/conceptos/owasp-top-10.md` para detalles de cada control.

---

## RT-004 — Calidad de Código

**Restricción**: El código generado debe cumplir estándares de calidad mínimos.

| ID       | Estándar                                                                          |
|----------|-----------------------------------------------------------------------------------|
| RT-004.1 | Cobertura de tests ≥80% en clases de service y controller (medida por JaCoCo)     |
| RT-004.2 | El código Java debe pasar Checkstyle (Google Java Style Guide) sin errores        |
| RT-004.3 | El código TypeScript debe pasar ESLint sin errores antes de cada commit           |
| RT-004.4 | Todos los tipos TypeScript deben ser explícitos — no usar `any` sin justificación |
| RT-004.5 | Cada método público de service y controller debe tener Javadoc pedagógico         |
| RT-004.6 | Cada archivo nuevo debe tener cabecera con ¿Qué? ¿Para qué? ¿Impacto?            |
| RT-004.7 | Las dependencias deben tener versión exacta en `pom.xml` y `package.json`         |

```bash
# Verificar calidad antes de commit
cd be && ./mvnw checkstyle:check     # Java style
cd be && ./mvnw verify               # Tests + JaCoCo
cd fe && pnpm lint                   # ESLint TypeScript
cd fe && pnpm test                   # Vitest
```

**Motivación**: En un proyecto educativo, el código debe ser legible, mantenible
y servir como referencia de buenas prácticas.

---

## RT-005 — Conventional Commits

**Restricción**: Todos los mensajes de commit deben seguir Conventional Commits
con cuerpo pedagógico.

### Formato obligatorio

```
type(scope): short description in english

For: reason this change was needed
Impact: what this affects/enables
```

### Tipos permitidos
`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

### Ejemplo correcto

```bash
git commit -m "feat(auth): add BCrypt password hashing on registration

For: store passwords securely — plain text storage violates OWASP A02
Impact: all new registrations will store bcrypt hash instead of plain text;
existing tests updated to use BCryptPasswordEncoder mock"
```

**Motivación**: Commits claros sirven como historial pedagógico del proyecto.
Cada commit debe poder leerse como una lección.

---

## RT-006 — Variables de Entorno

**Restricción**: Ninguna credencial, URL de base de datos, secret JWT ni
configuración sensible puede estar hardcodeada en el código o versionada en git.

| Regla                                                                                      |
|--------------------------------------------------------------------------------------------|
| Toda configuración sensible va en archivos `.env` (no versionados)                        |
| Siempre debe existir un `.env.example` con las variables necesarias y valores de ejemplo  |
| Spring Boot lee variables via `${VARIABLE_NAME}` o `${VARIABLE_NAME:valor_default}`       |
| Las variables se validan al inicio con `@ConfigurationProperties` + `@Validated`           |
| Si `JWT_SECRET` tiene menos de 32 caracteres, la aplicación **no debe arrancar**          |

```bash
# be/.env.example — variables mínimas requeridas
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nn_auth_db
DB_USERNAME=nn_user
DB_PASSWORD=nn_password
JWT_SECRET=your-super-secret-key-min-32-chars-change-in-production
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRATION_DAYS=7
MAIL_HOST=localhost
MAIL_PORT=1025
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

**Motivación**: Credenciales en git son una vulnerabilidad irreversible
(OWASP A02 — Cryptographic Failures).

---

## RT-007 — Compatibilidad Docker

**Restricción**: El proyecto debe poder ejecutarse con un único comando:

```bash
docker compose up -d   # BD PostgreSQL 17 + Mailpit
cd be && ./mvnw spring-boot:run
cd fe && pnpm dev
```

- `docker-compose.yml` en la raíz del monorepo es la única fuente de verdad
  para la infraestructura de desarrollo
- El backend debe soportar un perfil `noDocker` con `MockMailSender`
  para desarrollo sin Docker (solo requiere una BD PostgreSQL local)
- Las variables de entorno del contenedor PostgreSQL deben coincidir
  con los valores por defecto en `be/.env.example`

**Motivación**: Reproducibilidad del entorno de desarrollo entre estudiantes
con diferentes sistemas operativos.

---

## RT-008 — Propósito Educativo

**Restricción**: Todo el código y la documentación deben mantener la
intención pedagógica del proyecto.

| Regla                                                                                          |
|------------------------------------------------------------------------------------------------|
| Los comentarios deben responder ¿Qué? ¿Para qué? ¿Impacto?                                   |
| No se implementan features que no estén en el plan de trabajo (YAGNI)                         |
| Las decisiones técnicas deben estar documentadas en `_docs/referencia-tecnica/architecture.md` |
| El código debe ser legible para un estudiante junior — no "clever code"                        |
| Cada nueva feature debe incluir su test correspondiente                                        |

**Motivación**: Este es un proyecto del programa SENA. El objetivo final es
que el estudiante pueda explicar cada línea de código y cada decisión de diseño.
