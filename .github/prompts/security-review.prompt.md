---
description: "Realiza una auditoría de seguridad basada en OWASP Top 10 adaptada al stack Spring Boot + React del proyecto. Usar antes de un PR importante, una release o al agregar funcionalidad de auth."
name: "Revisión de seguridad OWASP Top 10"
argument-hint: "Ruta o módulo a auditar (ej: 'be/src/main/java/com/nn/auth/security/', 'flujo completo de change-password', 'fe/src/api/')"
agent: "agent"
---

# Revisión de Seguridad OWASP Top 10 — NN Auth System (Spring Boot)

Realiza una auditoría exhaustiva del código indicado según las categorías OWASP Top 10 adaptadas al stack del proyecto.

## Stack de referencia

- **Backend**: Java 21 + Spring Boot 3 + Spring Security (BCryptPasswordEncoder) + JJWT
- **Frontend**: React 18 + TypeScript + Axios
- **ORM**: Spring Data JPA + Hibernate (PostgreSQL 17)
- **Rate limiting**: Bucket4j
- **Migraciones**: Flyway SQL

---

## Categorías a auditar

### A01 — Control de Acceso Roto

Verificar:

- ¿Los endpoints protegidos están anotados con `@PreAuthorize` o configurados en `SecurityFilterChain`?
- ¿Hay endpoints que deberían requerir auth pero `permitAll()` los expone?
- ¿El `JwtAuthenticationFilter` valida el token antes de permitir acceso?
- ¿Los recursos de un usuario no son accesibles por otro? (IDOR — Insecure Direct Object Reference)
- ¿Las rutas del frontend tienen `ProtectedRoute` donde corresponde?

### A02 — Fallos Criptográficos

Verificar:

- ¿Las contraseñas se hashean con `BCryptPasswordEncoder` (factor ≥10)?
- ¿Hay algún lugar donde se almacene o loggee una contraseña en texto plano?
- ¿El `JWT_SECRET` tiene mínimo 32 caracteres? ¿Se valida al arrancar la app?
- ¿Se usa HMAC-SHA256 (HS256) para firmar los JWT?
- ¿Los tokens de reset/verificación son UUIDs aleatorios (no predecibles)?
- ¿Se usa HTTPS en producción? (verificar configuración CORS y headers)

### A03 — Inyección (SQL / JPQL / XSS)

Verificar:

- ¿Todos los accesos a BD usan Spring Data JPA Repository o JPQL parametrizado?
- ¿Hay algún uso de `EntityManager.createNativeQuery()` con concatenación de strings?
- ¿Los emails en templates HTML (Thymeleaf/JavaMailSender) están escapados?
- ¿Los responses JSON no inyectan HTML que el frontend pueda renderizar sin sanitizar?
- ¿En React, se usa `.textContent` o JSX (seguro) — nunca `dangerouslySetInnerHTML`?

### A04 — Diseño Inseguro

Verificar:

- ¿El endpoint de `forgot-password` devuelve la **misma** respuesta genérica independientemente de si el email existe?
- ¿Los mensajes de error de login/auth no revelan si el email existe o la contraseña es incorrecta?
- ¿Los tokens de reset de contraseña tienen expiración corta (≤1 hora)?
- ¿Los tokens se marcan como `used = true` tras ser utilizados?
- ¿Hay rate limiting con Bucket4j en endpoints sensibles (`/register`, `/login`, `/forgot-password`)?

### A05 — Configuración de Seguridad Incorrecta

Verificar:

- ¿CORS tiene `allowedOrigins("*")`? — **PROHIBIDO en producción**
- ¿El Swagger UI está deshabilitado cuando `ENVIRONMENT=production`?
- ¿Los headers de seguridad están configurados (`X-Content-Type-Options`, `X-Frame-Options`)?
- ¿Spring Boot Actuator expone endpoints sensibles sin auth (`/actuator/env`, `/actuator/beans`)?
- ¿Hay secrets o URLs de BD hardcodeados en `application.yml` versionado en git?

### A06 — Componentes Vulnerables y Desactualizados

Verificar:

- ¿Las versiones en `pom.xml` tienen CVEs conocidos? Ejecutar: `./mvnw dependency:check`
- ¿Las versiones en `package.json` del frontend son exactas (sin `^`, `~`, `>=`)?
- ¿La imagen base de Docker usa una versión específica (no `latest`)?
- ¿La versión de JJWT es ≥0.12 (que corrigió vulnerabilidades de versiones anteriores)?

### A07 — Fallos de Autenticación e Identificación

Verificar:

- ¿`BCryptPasswordEncoder.matches()` se usa para comparar — nunca comparación de hashes como strings?
- ¿Los access tokens tienen duración corta (≤15 minutos)?
- ¿Los refresh tokens se invalidan al hacer logout o cambio de contraseña?
- ¿Hay validación de fortaleza de contraseña (≥8 chars, mayúscula, minúscula, número)?
- ¿El `JwtAuthenticationFilter` rechaza tokens con firma inválida, expirados o malformados?

### A08 — Fallos en la Integridad de Software y Datos

Verificar:

- ¿Los scripts de migración Flyway están versionados y no se modifican retroactivamente?
- ¿Las dependencias en `pom.xml` provienen de repositorios Maven Central confiables?
- ¿Hay CI/CD que verifique `./mvnw verify` antes de desplegar?
- ¿Los JARs generados no incluyen `.env` ni credenciales en el classpath?

### A09 — Fallos en el Registro y Monitoreo

Verificar:

- ¿Los intentos de login fallidos se registran en `AuditLogger`?
- ¿Los logs incluyen IP, timestamp, email (sin contraseña) para eventos de auth?
- ¿Los logs usan formato JSON estructurado (Logback)?
- ¿No se loggean datos sensibles como contraseñas, tokens completos o datos personales?
- ¿Hay un nivel de log adecuado (`WARN`/`ERROR`) para eventos sospechosos?

### A10 — Server-Side Request Forgery (SSRF)

Verificar:

- ¿Hay endpoints que acepten URLs del cliente para hacer peticiones HTTP (webhook, avatar, etc.)?
- ¿`JavaMailSender` usa host configurado vía variable de entorno — no enviado por el cliente?
- ¿El frontend no construye URLs de API con input del usuario sin validación?

---

## Formato del informe

Para cada problema encontrado, reportar:

```
## [CRÍTICO | ALTO | MEDIO | BAJO] — A0X: Nombre de categoría

**Archivo**: be/src/main/java/com/nn/auth/.../Archivo.java:línea
**¿Qué ocurre?**: Descripción técnica precisa del problema.
**¿Por qué es un riesgo?**: Impacto si se explota (qué puede hacer un atacante).
**Corrección sugerida**:
// Código corregido o parámetros de configuración a cambiar
```

Si no hay problemas en una categoría, escribir:

```
✅ A0X — Sin problemas detectados en el código auditado.
```

---

## Checklist final

Tras el informe, completar este resumen:

- [ ] Contraseñas hasheadas con BCrypt (factor ≥10) — nunca en texto plano
- [ ] JWT_SECRET ≥ 32 caracteres, en `.env` — nunca en código
- [ ] Todos los endpoints usan JPA parametrizado — sin SQL concatenado
- [ ] CORS sin `allowedOrigins("*")` en producción
- [ ] Swagger UI deshabilitado en `ENVIRONMENT=production`
- [ ] Rate limiting con Bucket4j en endpoints de auth
- [ ] Tokens de reset: expiran en ≤1 hora, se marcan `used=true`
- [ ] `forgot-password` devuelve respuesta genérica (no revela si email existe)
- [ ] `pom.xml` y `package.json` con versiones exactas, sin CVEs (ejecutar `./mvnw dependency:check`)
- [ ] Logs estructurados — sin contraseñas ni tokens completos en los logs

---

## Módulo o flujo a auditar

$input
