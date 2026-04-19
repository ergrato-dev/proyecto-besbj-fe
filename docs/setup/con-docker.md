# Setup con Docker — NN Auth System

> **¿Para qué este archivo?**
> Guía paso a paso para poner en marcha el sistema completo usando Docker Compose
> para la base de datos y Mailpit. Es la forma recomendada porque no requiere
> instalar PostgreSQL manualmente en tu máquina.
>
> **¿Impacto?**
> Docker provee un entorno idéntico para todos los desarrolladores — elimina el clásico
> problema "en mi máquina funciona". Todos usan la misma versión de PostgreSQL (17-alpine)
> con la misma configuración.

---

## Prerrequisitos

| Herramienta    | Versión mínima | Verificar con              |
| -------------- | -------------- | -------------------------- |
| JDK            | 21+            | `java -version`            |
| Maven Wrapper  | incluido       | `./mvnw --version`         |
| Node.js        | 20 LTS+        | `node --version`           |
| pnpm           | 9+             | `pnpm --version`           |
| Docker         | 24+            | `docker --version`         |
| Docker Compose | 2.20+          | `docker compose version`   |
| Git            | 2.40+          | `git --version`            |

> ⚠️ **Windows:** Usar siempre **Git Bash** como terminal. CMD y PowerShell no son compatibles con los comandos de este proyecto (`source`, `export`, rutas con `/`).

---

## Servicios que levanta Docker

El archivo `docker-compose.yml` en la raíz del proyecto define dos servicios:

| Servicio  | Imagen                    | Puerto local | Propósito                                         |
| --------- | ------------------------- | ------------ | ------------------------------------------------- |
| `db`      | `postgres:17-alpine`      | `5432`       | Base de datos PostgreSQL del sistema              |
| `mailpit` | `axllent/mailpit:latest`  | `1025` SMTP  | Capturar emails de verificación/recuperación      |
|           |                           | `8025` Web   | Ver emails capturados en el navegador             |

> **¿Qué es Mailpit?**
> Un servidor SMTP de desarrollo que **captura** todos los emails enviados por el backend
> sin reenviarlos a ningún destinatario real. Permite ver los correos de verificación
> y recuperación de contraseña en `http://localhost:8025` durante el desarrollo.

---

## Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/ergrato-dev/proyecto-besbj-fe.git
cd proyecto-besbj-fe
```

---

## Paso 2 — Levantar los servicios Docker

```bash
# Levantar PostgreSQL 17 + Mailpit en background
docker compose up -d

# Verificar que ambos contenedores están corriendo y sanos
docker compose ps
```

Salida esperada (ambos servicios en estado `healthy`):

```
NAME               IMAGE                    STATUS
nn_auth_db         postgres:17-alpine       Up (healthy)
nn_auth_mailpit    axllent/mailpit:latest   Up
```

Si `nn_auth_db` muestra `starting` en lugar de `healthy`, esperar unos segundos
y repetir `docker compose ps` — el healthcheck de PostgreSQL puede tardar ~15 s.

---

## Paso 3 — Configurar el Backend

```bash
cd be

# Copiar el archivo de variables de entorno de ejemplo
cp .env.example .env
```

El archivo `.env` tiene valores por defecto que funcionan directamente con Docker Compose.
No es necesario modificar nada para el entorno de desarrollo.

Contenido relevante del `.env` para este modo:

```bash
DB_HOST=localhost          # Docker Compose mapea el puerto 5432 del contenedor a localhost
DB_PORT=5432
DB_NAME=nn_auth_db
DB_USERNAME=nn_user
DB_PASSWORD=nn_password

MAIL_HOST=localhost        # Mailpit escucha SMTP en localhost:1025
MAIL_PORT=1025

FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
SWAGGER_UI_ENABLED=true
```

### Arrancar el backend

```bash
# Desde la carpeta be/
./mvnw spring-boot:run
```

Al arrancar, Spring Boot:

1. Lee las variables del `.env` (cargadas automáticamente por la configuración de Maven).
2. Conecta a PostgreSQL en `localhost:5432`.
3. Flyway aplica las migraciones SQL (`V1`, `V2`, `V3`) creando las tres tablas.
4. La API queda disponible en `http://localhost:8080`.

Mensajes esperados en la consola:

```
Flyway Community Edition ... by Redgate
Database: jdbc:postgresql://localhost:5432/nn_auth_db
Successfully applied 3 migrations to schema "public"
Started NnAuthApplication in X.XXX seconds
```

> **Swagger UI** (solo en development): `http://localhost:8080/swagger-ui.html`
> Permite probar todos los endpoints sin necesidad de un cliente HTTP externo.

---

## Paso 4 — Configurar el Frontend

```bash
# Desde la raíz del proyecto
cd fe

# Instalar dependencias (¡SIEMPRE con pnpm, nunca con npm!)
pnpm install

# Copiar variables de entorno
cp .env.example .env
```

El `.env` del frontend apunta al backend en el puerto 8080 por defecto:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

No es necesario modificar nada para desarrollo local.

### Arrancar el frontend

```bash
pnpm dev
```

La app queda disponible en `http://localhost:5173`.

---

## Resumen — 3 terminales

| Terminal | Directorio      | Comando               | URL resultado                           |
| -------- | --------------- | --------------------- | --------------------------------------- |
| 1        | raíz            | `docker compose up -d`| —                                       |
| 2        | `be/`           | `./mvnw spring-boot:run` | `http://localhost:8080`              |
| 3        | `fe/`           | `pnpm dev`            | `http://localhost:5173`                 |

---

## Verificar que todo funciona

```bash
# 1. ¿PostgreSQL está sano?
docker compose ps

# 2. ¿El backend responde?
curl http://localhost:8080/actuator/health
# Respuesta esperada: {"status":"UP"}

# 3. ¿El frontend carga?
# Abrir http://localhost:5173 en el navegador

# 4. ¿El email funciona?
# Registrar un usuario en http://localhost:5173/register
# Abrir http://localhost:8025 — el email de verificación debe aparecer ahí
```

---

## Ver emails capturados (Mailpit)

Al registrarse o solicitar recuperación de contraseña, el backend envía un email.
Con Docker activo, ese email es capturado por Mailpit y visible en:

```
http://localhost:8025
```

El email contiene un enlace de verificación. Hacer clic en él o copiar el token de la URL
para probarlo en Swagger UI (`POST /api/v1/auth/verify-email`).

---

## Detener y limpiar

```bash
# Detener contenedores (los datos de la BD se conservan en el volumen)
docker compose down

# Detener y borrar TODOS los datos de la BD (volumen incluido)
docker compose down -v

# Ver logs de un servicio específico
docker compose logs -f db
docker compose logs -f mailpit
```

> ⚠️ `docker compose down -v` **borra todos los datos de la base de datos**.
> Usar solo cuando se quiera empezar desde cero.

---

## Solución de problemas frecuentes

### "Connection refused" al arrancar el backend

**Causa:** PostgreSQL aún no está listo.

```bash
# Esperar a que el contenedor esté "healthy"
docker compose ps
# Si sigue en "starting", esperar 15 s y reintentar
```

### Puerto 5432 ya en uso

**Causa:** Hay una instalación local de PostgreSQL corriendo en el mismo puerto.

```bash
# Detener el servicio local de PostgreSQL
sudo systemctl stop postgresql   # Linux
brew services stop postgresql@17 # macOS

# Volver a levantar Docker Compose
docker compose up -d
```

### Error "JAVA_HOME is not defined correctly"

**Causa:** La variable `JAVA_HOME` en `.env` no apunta al JDK 21.

```bash
# Encontrar la ruta correcta del JDK 21
find /usr/lib/jvm -name "javac" 2>/dev/null

# Actualizar JAVA_HOME en be/.env
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

### El frontend no se conecta al backend (CORS error)

**Causa:** El backend no está corriendo o `VITE_API_BASE_URL` es incorrecto.

```bash
# Verificar que el backend responde
curl http://localhost:8080/actuator/health

# Verificar que .env del frontend apunta al puerto correcto
cat fe/.env
# VITE_API_BASE_URL=http://localhost:8080
```

---

## Siguiente paso

- Leer [sin-docker.md](./sin-docker.md) si prefieres instalar PostgreSQL directamente en tu máquina.
- Explorar la API en `http://localhost:8080/swagger-ui.html`.
- Revisar [architecture.md](../referencia-tecnica/architecture.md) para entender la arquitectura del sistema.
