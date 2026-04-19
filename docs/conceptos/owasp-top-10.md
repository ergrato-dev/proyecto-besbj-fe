# OWASP Top 10 — Implementación en Spring Boot

> Stack: Spring Boot 3.2+ (Java 21) | Spring Security | JJWT | Bucket4j | Bean Validation
> Referencia funcional: [proyecto-be-fe](https://github.com/ergrato-dev/proyecto-be-fe) (misma guía, FastAPI)

---

## ¿Qué es OWASP Top 10?

El **OWASP Top 10** (Open Web Application Security Project) es una lista de las 10 categorías de vulnerabilidades más críticas en aplicaciones web, publicada y actualizada por la comunidad de seguridad global.

Esta guía documenta **cómo el NN Auth System (Spring Boot) mitiga cada una de estas vulnerabilidades**, con ejemplos concretos de código Java y la configuración del framework.

---

## Índice

1. [A01 — Broken Access Control](#a01--broken-access-control)
2. [A02 — Cryptographic Failures](#a02--cryptographic-failures)
3. [A03 — Injection](#a03--injection)
4. [A04 — Insecure Design](#a04--insecure-design)
5. [A05 — Security Misconfiguration](#a05--security-misconfiguration)
6. [A06 — Vulnerable and Outdated Components](#a06--vulnerable-and-outdated-components)
7. [A07 — Identification and Authentication Failures](#a07--identification-and-authentication-failures)
8. [A08 — Software and Data Integrity Failures](#a08--software-and-data-integrity-failures)
9. [A09 — Security Logging and Monitoring Failures](#a09--security-logging-and-monitoring-failures)
10. [A10 — Server-Side Request Forgery (SSRF)](#a10--server-side-request-forgery-ssrf)
11. [Checklist de Seguridad](#checklist-de-seguridad)

---

## A01 — Broken Access Control

### ¿Qué es?

Control de acceso roto ocurre cuando un usuario puede realizar acciones que no debería poder hacer: acceder a recursos de otros usuarios, ejecutar operaciones privilegiadas sin permiso, o saltarse la autenticación.

### Riesgo en este sistema

Sin control de acceso correcto, un usuario podría:
- Ver el perfil de otro usuario en `/api/v1/users/me`
- Cambiar la contraseña de otra cuenta
- Acceder a tokens de recuperación de contraseña ajenos

### Mitigation en Spring Boot

**1. `JwtAuthenticationFilter.java` — Protege todos los endpoints que requieren auth**

```java
/**
 * ¿Qué? Filtro que intercepta CADA petición HTTP antes de llegar al controller.
 * ¿Para qué? Verifica el JWT y establece el usuario en el SecurityContext.
 * ¿Impacto? Sin este filtro, cualquiera podría acceder a endpoints protegidos
 *            simplemente omitiendo el header Authorization.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String userEmail = jwtUtil.extractEmail(token);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtUtil.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

**2. `SecurityConfig.java` — Define qué rutas requieren autenticación**

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())           // API REST stateless → CSRF no aplica
        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authorizeHttpRequests(auth -> auth
            // ✅ Rutas públicas — no requieren JWT
            .requestMatchers(
                "/api/v1/auth/register",
                "/api/v1/auth/login",
                "/api/v1/auth/refresh",
                "/api/v1/auth/forgot-password",
                "/api/v1/auth/reset-password",
                "/api/v1/auth/verify-email",
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs/**"
            ).permitAll()
            // 🔒 Todo lo demás requiere JWT válido
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

**3. Acceso a datos del usuario actual — sin posibilidad de enumerar otros usuarios**

```java
// UserController.java — solo puede obtener SU propio perfil
@GetMapping("/me")
public UserResponse getMe(@AuthenticationPrincipal UserDetails userDetails) {
    // El email viene del JWT, no de la URL — imposible pedir otro usuario
    return userService.findByEmail(userDetails.getUsername());
}
```

> **Diferencia vs referencia FastAPI:** FastAPI usa `Depends(get_current_user)` como inyección de dependencia. Spring Boot usa `@AuthenticationPrincipal` que lee del `SecurityContext` poblado por el filtro JWT. El efecto es idéntico.

---

## A02 — Cryptographic Failures

### ¿Qué es?

Fallos criptográficos ocurren cuando datos sensibles se exponen sin cifrado adecuado, se usan algoritmos débiles u obsoletos, o las claves secretas son predecibles o están hardcodeadas.

### Riesgo en este sistema

- Contraseñas almacenadas en texto plano → expuestas si la BD es comprometida
- JWT con clave débil → cualquiera puede forjar tokens de autenticación
- Secrets hardcodeados en el código → expuestos en el repositorio git

### Mitigation en Spring Boot

**1. BCrypt para contraseñas — `ApplicationConfig.java`**

```java
/**
 * ¿Qué? Bean de BCryptPasswordEncoder con factor de costo predeterminado (10).
 * ¿Para qué? Hashear contraseñas de forma unidireccional antes de almacenarlas en la BD.
 * ¿Impacto? BCrypt es deliberadamente lento — dificulta los ataques de fuerza bruta.
 *            El factor de costo 10 genera ~100ms por hash en hardware moderno.
 */
@Bean
public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Uso en AuthService.java
String hashedPassword = passwordEncoder.encode(plainTextPassword);
// Verificación: passwordEncoder.matches(plainText, hashedInDb)
```

**2. JJWT con HS256 y clave segura — `JwtUtil.java`**

```java
/**
 * ¿Qué? Genera y verifica tokens JWT usando HMAC-SHA256.
 * ¿Para qué? HS256 con una clave fuerte garantiza que solo el servidor puede crear tokens válidos.
 * ¿Impacto? Si se usa un algoritmo débil (HS1) o ninguno (alg=none), cualquiera
 *            puede forjar tokens y acceder como cualquier usuario.
 */
@Value("${app.jwt.secret}")
private String jwtSecret;

private SecretKey getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    return Keys.hmacShaKeyFor(keyBytes);
}

public String generateAccessToken(User user) {
    return Jwts.builder()
        .subject(user.getId().toString())
        .claim("email", user.getEmail())
        .claim("type", "access")
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 min
        .signWith(getSigningKey(), Jwts.SIG.HS256)
        .compact();
}
```

**3. Validación del JWT_SECRET al arrancar — `@ConfigurationProperties`**

```java
/**
 * ¿Qué? Valida la configuración de JWT al inicializar la aplicación.
 * ¿Para qué? Si el secret es demasiado corto, la app falla en arranque en vez de en runtime.
 * ¿Impacto? Un secret corto hace que HMAC-SHA256 sea criptográficamente débil.
 */
@ConfigurationProperties(prefix = "app.jwt")
@Validated
public record JwtProperties(
    @NotBlank
    @Size(min = 32, message = "JWT secret debe tener al menos 32 caracteres")
    String secret,
    long accessTokenExpirationMinutes,
    long refreshTokenExpirationDays
) {}
```

**4. Variables de entorno — nunca hardcoded**

```bash
# .env (NO versionado en git — en .gitignore)
JWT_SECRET=your-super-secret-key-min-32-chars-change-in-production
```

```yaml
# application.yml — usa variables de entorno
app:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiration-minutes: ${JWT_ACCESS_TOKEN_EXPIRATION_MINUTES:15}
    refresh-token-expiration-days: ${JWT_REFRESH_TOKEN_EXPIRATION_DAYS:7}
```

---

## A03 — Injection

### ¿Qué es?

Los ataques de inyección ocurren cuando datos no confiables se envían a un intérprete como parte de un comando o consulta. Los más comunes son: SQL Injection, XSS (Cross-Site Scripting), y Command Injection.

### Riesgo en este sistema

- SQL Injection: un email malicioso como `' OR '1'='1` podría manipular las consultas SQL
- XSS: datos de usuario almacenados y luego renderizados sin escapar en el frontend

### Mitigation en Spring Boot

**1. SQL Injection — Spring Data JPA con queries parametrizadas**

```java
// ✅ CORRECTO — Spring Data JPA parametriza automáticamente
Optional<User> findByEmailIgnoreCase(String email);

// El SQL generado usa parámetros, NO concatenación:
// SELECT * FROM users WHERE LOWER(email) = LOWER(?)
//                                                  ^--- parámetro seguro

// ❌ NUNCA hacer esto — SQL String concatenation:
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
// Con email = "'; DROP TABLE users; --" → DESASTRE
```

**2. Bean Validation — Validar tipos y formatos antes de procesar**

```java
/**
 * ¿Qué? Valida el formato del email antes de consultar la BD.
 * ¿Para qué? Rechazar entradas malformadas en la capa de presentación.
 * ¿Impacto? Reduce la superficie de ataque — datos maliciosos nunca llegan al repositorio.
 */
public record LoginRequest(
    @NotBlank
    @Email(message = "Formato de email inválido")    // ← Valida formato RFC-5321
    String email,

    @NotBlank
    String password
) {}

// En el controller: @Valid activa la validación automáticamente
@PostMapping("/login")
public TokenResponse login(@Valid @RequestBody LoginRequest request) { ... }
```

**3. XSS — Spring Boot devuelve JSON, no HTML**

Spring Boot devuelve JSON (no renderiza HTML en el servidor), por lo que el riesgo de XSS server-side es mínimo. El frontend React (con JSX) escapa automáticamente el contenido dinámico:

```tsx
// ✅ React escapa automáticamente — seguro contra XSS
<p>{user.fullName}</p>

// ❌ Solo es peligroso si se usa dangerouslySetInnerHTML — EVITAR siempre
<p dangerouslySetInnerHTML={{ __html: user.fullName }} />
```

**4. Headers de seguridad anti-XSS**

```java
// SecurityConfig.java — Headers de seguridad en todas las respuestas
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .headers(headers -> headers
            .contentSecurityPolicy(csp ->
                csp.policyDirectives("default-src 'self'; script-src 'self'")
            )
            .frameOptions(frame -> frame.deny())        // Previene clickjacking
            .xssProtection(xss -> xss.enable())        // Header X-XSS-Protection
        )
        .build();
}
```

---

## A04 — Insecure Design

### ¿Qué es?

El diseño inseguro ocurre cuando el sistema carece de controles de seguridad fundamentales desde su concepción, no como bugs de implementación, sino como deficiencias arquitectónicas.

### Riesgo en este sistema

- Sin rate limiting: ataques de fuerza bruta al login (probar millones de contraseñas)
- Sin expiración de tokens: tokens robados siguen siendo válidos indefinidamente
- Sin verificación de email: cualquiera puede registrarse con el email de otro

### Mitigation en Spring Boot

**1. Rate limiting con Bucket4j — previene brute force**

```java
/**
 * ¿Qué? Filtro que limita las peticiones por IP usando el algoritmo token bucket.
 * ¿Para qué? Prevenir ataques de fuerza bruta en el endpoint de login.
 * ¿Impacto? Sin rate limiting, un atacante puede probar millones de contraseñas
 *            en cuestión de minutos usando herramientas automatizadas.
 */
// Configuración en application.yml:
//   /api/v1/auth/login → máximo 10 peticiones por minuto por IP
//   /api/v1/auth/register → máximo 5 peticiones por minuto por IP
//   /api/v1/auth/forgot-password → máximo 3 peticiones por minuto por IP
```

**2. Tokens con expiración corta**

```
Access Token:  15 minutos  → Si es robado, la ventana de uso es pequeña
Refresh Token:  7 días     → Rotación: se invalida al usarlo (uno nuevo es emitido)
Reset Token:    1 hora     → Suficiente tiempo para el usuario, minimiza abuso
Verify Token:  24 horas    → Tiempo razonable para revisar el email
```

**3. Verificación de email obligatoria antes del primer login**

```java
// AuthService.java
public TokenResponse login(LoginRequest request) {
    User user = userRepository.findByEmailIgnoreCase(request.email())
        .orElseThrow(() -> new AuthException("Credenciales inválidas"));

    if (!passwordEncoder.matches(request.password(), user.getHashedPassword())) {
        throw new AuthException("Credenciales inválidas");
    }

    // ✅ Bloquear si email no verificado — diseño seguro
    if (!user.isEmailVerified()) {
        throw new AuthException("Debes verificar tu email antes de ingresar");
    }

    if (!user.isActive()) {
        throw new AuthException("Tu cuenta está desactivada");
    }

    return generateTokenPair(user);
}
```

**4. Respuesta genérica en forgot-password — previene user enumeration**

```java
// ✅ CORRECTO — Respuesta siempre idéntica independientemente del resultado
@PostMapping("/forgot-password")
public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request.email());
    // SIEMPRE la misma respuesta — no revela si el email existe
    return new MessageResponse("Si el email está registrado, recibirás instrucciones en breve");
}
```

---

## A05 — Security Misconfiguration

### ¿Qué es?

Configuración de seguridad incorrecta: valores predeterminados inseguros, configuraciones incompletas, permisos excesivos, Swagger habilitado en producción, etc.

### Riesgo en este sistema

- CORS abierto a todos los orígenes (`*`) → cualquier sitio puede hacer requests autenticados
- Swagger UI en producción → expone estructura interna de la API
- Stack traces expuestos en errores → revelan información del sistema
- Credenciales por defecto en base de datos → acceso no autorizado

### Mitigation en Spring Boot

**1. CORS configurado explícitamente — no usar `*`**

```java
/**
 * ¿Qué? Configuración de CORS que permite solo orígenes explícitamente autorizados.
 * ¿Para qué? Prevenir que sitios de terceros hagan requests autenticados en nombre del usuario.
 * ¿Impacto? Con CORS abierto (*), un sitio malicioso puede hacer requests a nuestra API
 *            usando las cookies o credenciales del usuario sin su consentimiento (CSRF avanzado).
 */
@Value("${app.cors.allowed-origins}")
private List<String> allowedOrigins;

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(allowedOrigins);    // ["http://localhost:5173"] en dev
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

En producción: `app.cors.allowed-origins=https://tu-dominio.com` (nunca `*`).

**2. Swagger deshabilitado en producción**

```java
// OpenApiConfig.java
@Configuration
@ConditionalOnProperty(name = "app.swagger.enabled", havingValue = "true")
public class OpenApiConfig {
    // Solo se carga si app.swagger.enabled=true
}
```

```yaml
# application-production.yml
app:
  swagger:
    enabled: false    # Swagger UI → 404 en producción
```

**3. Respuestas de error sin stack traces internos**

```java
// GlobalExceptionHandler.java
@ExceptionHandler(Exception.class)
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public ErrorResponse handleGenericException(Exception ex) {
    // ✅ Loggear el detalle internamente
    log.error("Error inesperado: {}", ex.getMessage(), ex);

    // ❌ NUNCA exponer el stack trace al cliente
    return new ErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR.value(),
        "Error interno del servidor"
        // NO incluir ex.getMessage() o ex.getStackTrace()
    );
}
```

**4. Variable de entorno obligatoria para JWT_SECRET**

```java
// Si JWT_SECRET no está configurado, la app NO arranca
@ConfigurationProperties(prefix = "app.jwt")
@Validated
public record JwtProperties(
    @NotBlank(message = "JWT_SECRET es obligatorio")
    @Size(min = 32) String secret,
    ...
) {}
```

---

## A06 — Vulnerable and Outdated Components

### ¿Qué es?

Uso de componentes (librerías, frameworks, dependencias) con vulnerabilidades conocidas o versiones desactualizadas que no han recibido parches de seguridad.

### Riesgo en este sistema

- Dependencias con CVEs (Common Vulnerabilities and Exposures) publicados
- Versiones de Spring Boot o Java desactualizadas con bugs de seguridad

### Mitigation en Spring Boot

**1. Usar versiones recientes con soporte LTS**

```xml
<!-- pom.xml — versiones seguras y actualizadas -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.x</version>   <!-- LTS, con actualizaciones de seguridad -->
</parent>

<!-- Java 21 LTS — soporte hasta 2031 -->
<properties>
    <java.version>21</java.version>
</properties>
```

**2. Spring Boot gestiona versiones de dependencias (BOM)**

Spring Boot 3.2 usa un **Bill of Materials (BOM)** que gestiona versiones compatibles y seguras de todas las dependencias. No es necesario especificar versiones manualmente para la mayoría de las librerías incluidas.

**3. Auditoría periódica de dependencias**

```bash
# Verificar dependencias con vulnerabilidades conocidas
cd be && ./mvnw dependency:check

# Con OWASP Dependency Check plugin (recomendado en CI/CD)
./mvnw org.owasp:dependency-check-maven:check
# → Genera reporte en target/dependency-check-report.html
```

**4. Dependencias externas al BOM (versiones fijas)**

```xml
<!-- JJWT — especificar versión mínima recomendada -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>  <!-- Revisar periódicamente -->
</dependency>
```

---

## A07 — Identification and Authentication Failures

### ¿Qué es?

Fallos en la identificación y autenticación ocurren cuando el sistema permite contraseñas débiles, no protege contra fuerza bruta, no implementa autenticación multifactor cuando es crítico, o gestiona mal sessions o tokens.

### Riesgo en este sistema

- Sin validación de fortaleza: contraseñas como "123456" o "password" → fáciles de adivinar
- Sin expiración de tokens → tokens robados siguen siendo válidos para siempre
- Sin límite de intentos → ataques de fuerza bruta no son detectados ni bloqueados

### Mitigation en Spring Boot

**1. Requisitos de fortaleza de contraseña — Bean Validation**

```java
public record RegisterRequest(
    ...
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "Mínimo 8 caracteres")
    @Pattern(regexp = ".*[A-Z].*", message = "Debe contener al menos una mayúscula")
    @Pattern(regexp = ".*[a-z].*", message = "Debe contener al menos una minúscula")
    @Pattern(regexp = ".*\\d.*",   message = "Debe contener al menos un número")
    String password
) {}
```

**2. Tokens JWT de corta duración**

```
Access Token: 15 minutos
→ Si es interceptado, el atacante tiene máximo 15 min para usarlo.
→ El usuario solo nota el problema si hace algo en esa ventana.

Refresh Token: 7 días
→ Almacenado de forma segura en el cliente (memoria, no localStorage).
→ La rotación de tokens invalida el anterior al emitir uno nuevo.
```

**3. BCrypt work factor — lento por diseño**

```java
// BCryptPasswordEncoder con factor de costo 10 (predeterminado)
// Genera ~100ms por hash → un ataque de fuerza bruta de 1M contraseñas
// tomaría ~28 horas, haciendo el ataque impráctico.
new BCryptPasswordEncoder()         // factor 10
new BCryptPasswordEncoder(12)       // factor 12 → más lento aún (400ms aprox)
```

**4. Rate limiting — bloquear fuerza bruta**

```
/api/v1/auth/login → 10 req/min por IP
→ Máximo 10 intentos de contraseña por minuto.
→ Para adivinar 1M contraseñas se necesitarían ~70 días.
```

---

## A08 — Software and Data Integrity Failures

### ¿Qué es?

Fallos de integridad ocurren cuando el software no verifica la integridad de datos críticos: tokens manipulados, serialización insegura, pipelines CI/CD comprometidos, o dependencias sin verificar.

### Riesgo en este sistema

- JWT sin verificación de firma → cualquiera puede modificar el payload del token
- Tokens de reset usados múltiples veces → reutilización de tokens

### Mitigation en Spring Boot

**1. Verificación de firma JWT en cada petición**

```java
/**
 * ¿Qué? JJWT verifica automáticamente la firma HMAC-SHA256 al parsear el token.
 * ¿Para qué? Garantizar que el token no fue modificado por el cliente.
 * ¿Impacto? Sin verificación de firma, un atacante puede cambiar el sub (userId)
 *            en el payload y acceder como cualquier otro usuario.
 */
public Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())        // ← Verifica la firma automáticamente
        .build()
        .parseSignedClaims(token)           // Lanza ExpiredJwtException si expiró
        .getPayload();                      // Lanza JwtException si firma inválida
}
```

**2. Tokens de un solo uso (one-time use)**

```java
// AuthService.java — al usar un token de reset, se marca como usado
public MessageResponse resetPassword(ResetPasswordRequest request) {
    PasswordResetToken resetToken = tokenRepository
        .findByToken(request.token())
        .orElseThrow(() -> new AuthException("Token inválido"));

    if (resetToken.isExpired()) throw new AuthException("El token ha expirado");
    if (resetToken.isUsed())    throw new AuthException("El token ya fue utilizado");

    // Actualizar contraseña
    User user = resetToken.getUser();
    user.setHashedPassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);

    // ✅ Marcar como usado — no puede usarse de nuevo
    resetToken.setUsed(true);
    tokenRepository.save(resetToken);

    return new MessageResponse("Contraseña restablecida exitosamente");
}
```

---

## A09 — Security Logging and Monitoring Failures

### ¿Qué es?

Fallos en el logging y monitoreo ocurren cuando el sistema no registra eventos de seguridad críticos, los logs no tienen la información suficiente para detectar y responder a ataques, o no hay alertas configuradas.

### Riesgo en este sistema

- Sin logs de login fallidos → no se detectan ataques de fuerza bruta
- Sin logs de cambios de contraseña → no se detectan compromisos de cuentas
- Sin logs con IP y timestamps → imposible hacer forense después de un incidente

### Mitigation en Spring Boot

**1. `AuditLogger.java` — logging estructurado en JSON**

```java
/**
 * Archivo: AuditLogger.java
 * Descripción: Componente para logging de eventos de seguridad en formato JSON estructurado.
 * ¿Para qué? Registrar eventos auditables de forma que puedan ser indexados y analizados.
 * ¿Impacto? Sin logs estructurados, detectar y responder a ataques es prácticamente imposible.
 */
@Component
public class AuditLogger {
    private static final Logger log = LoggerFactory.getLogger("audit");

    public void logLoginSuccess(String userId, String email, String ipAddress) {
        log.info("{\"event\":\"LOGIN_SUCCESS\",\"userId\":\"{}\",\"email\":\"{}\",\"ip\":\"{}\",\"timestamp\":\"{}\"}",
            userId, email, ipAddress, Instant.now());
    }

    public void logLoginFailure(String email, String ipAddress, String reason) {
        log.warn("{\"event\":\"LOGIN_FAILURE\",\"email\":\"{}\",\"ip\":\"{}\",\"reason\":\"{}\",\"timestamp\":\"{}\"}",
            email, ipAddress, reason, Instant.now());
    }

    public void logPasswordChanged(String userId, String email, String ipAddress) {
        log.info("{\"event\":\"PASSWORD_CHANGED\",\"userId\":\"{}\",\"email\":\"{}\",\"ip\":\"{}\",\"timestamp\":\"{}\"}",
            userId, email, ipAddress, Instant.now());
    }

    public void logPasswordReset(String email, String ipAddress) {
        log.info("{\"event\":\"PASSWORD_RESET\",\"email\":\"{}\",\"ip\":\"{}\",\"timestamp\":\"{}\"}",
            email, ipAddress, Instant.now());
    }
}
```

**2. Eventos de seguridad que se deben loggear**

| Evento                          | Nivel   | Datos requeridos                    |
|---------------------------------|---------|-------------------------------------|
| Login exitoso                   | INFO    | userId, email, IP, timestamp        |
| Login fallido                   | WARN    | email, IP, razón, timestamp         |
| Contraseña cambiada             | INFO    | userId, email, IP, timestamp        |
| Contraseña restablecida         | INFO    | email, IP, timestamp                |
| Solicitud de reset de contraseña| INFO    | email, IP, timestamp                |
| Rate limit excedido             | WARN    | endpoint, IP, timestamp             |
| Token inválido/expirado         | WARN    | tipo de token, IP, timestamp        |

**3. Lo que NUNCA debe aparecer en logs**

```java
// ❌ NUNCA loggear contraseñas ni datos sensibles
log.info("Login attempt with password: {}", request.password()); // ← PELIGROSO

// ❌ NUNCA loggear tokens JWT completos
log.info("Token: {}", token); // ← EXPONE EL TOKEN

// ✅ Loggear solo identificadores no sensibles
log.info("Login attempt for email: {}", maskEmail(request.email()));
// maskEmail("usuario@ejemplo.com") → "us***o@ejemplo.com"
```

---

## A10 — Server-Side Request Forgery (SSRF)

### ¿Qué es?

SSRF ocurre cuando el servidor hace peticiones HTTP a URLs controladas por el atacante. Esto puede usarse para acceder a servicios internos, metadatos de cloud (AWS/GCP/Azure), o escanear la red interna.

### Riesgo en este sistema

Este sistema es un sistema de autenticación puro. **No hace peticiones HTTP a URLs externas proveídas por el usuario.**

Las únicas peticiones de red que el sistema hace son:
1. Consultas a la base de datos PostgreSQL (URL fija en variables de entorno)
2. Envío de emails via JavaMailSender (servidor SMTP fijo en variables de entorno)

Ninguna de estas URLs es controlada por el usuario de la API, por lo que el riesgo de SSRF en esta implementación es **mínimo**.

### Recomendación futura

Si en el futuro se agregan funcionalidades como:
- Foto de perfil via URL externa (`avatar_url`)
- Webhooks configurables por el usuario
- Importación de datos desde URLs

...en ese caso se debe implementar:
```java
// Validación de URLs permitidas — whitelist de dominios
private void validateWebhookUrl(String url) {
    URI uri = URI.create(url);
    List<String> allowedHosts = List.of("api.provider.com", "hooks.partner.com");
    if (!allowedHosts.contains(uri.getHost())) {
        throw new SecurityException("URL no permitida: " + uri.getHost());
    }
}
```

---

## Checklist de Seguridad

Usar antes de cada deployment o al completar una fase del proyecto:

### Contraseñas y Hashing
- [ ] Las contraseñas se hashean con BCrypt antes de almacenar
- [ ] El factor de costo BCrypt es ≥ 10
- [ ] Nunca se loggean contraseñas ni se incluyen en responses
- [ ] Bean Validation valida: ≥8 chars, 1 mayúscula, 1 minúscula, 1 número

### JWT y Tokens
- [ ] `JWT_SECRET` tiene ≥ 32 caracteres y está en `.env` (no hardcodeado)
- [ ] Si `JWT_SECRET` falta o es corto, la app NO arranca (`@Validated`)
- [ ] Access Token expira en 15 minutos
- [ ] Refresh Token expira en 7 días  
- [ ] Los tokens de reset y verificación son de un solo uso (`used = true` tras usar)
- [ ] Los tokens de reset expiran en 1 hora
- [ ] Los tokens de verificación de email expiran en 24 horas

### Control de Acceso
- [ ] El filtro JWT (`JwtAuthenticationFilter`) protege todos los endpoints que requieren auth
- [ ] Los endpoints públicos están explícitamente listados en `SecurityConfig`
- [ ] El endpoint `GET /me` usa `@AuthenticationPrincipal` — no acepta userId como parámetro

### Rate Limiting
- [ ] `/api/v1/auth/login` → máximo 10 req/min por IP
- [ ] `/api/v1/auth/register` → máximo 5 req/min por IP
- [ ] `/api/v1/auth/forgot-password` → máximo 3 req/min por IP

### Configuración
- [ ] CORS configurado con orígenes específicos (no `*`)
- [ ] Swagger UI deshabilitado en producción (`app.swagger.enabled=false`)
- [ ] Los errores de servidor no exponen stack traces al cliente
- [ ] Todas las credenciales y secrets están en `.env` (no en código ni en git)
- [ ] `.env` está en `.gitignore`

### Base de Datos
- [ ] Todas las consultas usan Spring Data JPA / JPQL (no SQL con concatenación)
- [ ] Las credenciales de BD están en `.env`, no en `application.yml`
- [ ] `ddl-auto: validate` — Flyway gestiona el esquema, no Hibernate

### Logging
- [ ] Login exitoso y fallido son loggeados con IP y timestamp
- [ ] Cambios de contraseña son loggeados
- [ ] Nunca se loggean contraseñas, tokens completos ni datos sensibles

---

*Documentación de seguridad para el proyecto NN Auth System.*
*Stack: Spring Boot 3.2+ (Java 21) + Spring Security + JJWT + Bucket4j + Bean Validation.*
*Ver [architecture.md](../referencia-tecnica/architecture.md) para la estructura del sistema.*
