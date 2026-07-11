# 🔍 Auditoría del repo (piloto para replicar en el resto de `proyecto-*`)

<!--
  ¿Qué? Auditoría en 5 ejes de este repo, siguiendo el mismo patrón aplicado en
  proyecto-be_fastapi-fe_react y proyecto-be_express-fe_react.
  ¿Para qué? Servir de checklist reutilizable antes de replicar este mismo patrón
  (bitácora + auditoría + nombre representativo del stack) en los demás repos proyecto-*.
  ¿Impacto? Sin esto, los gaps de este repo se replicarían silenciosamente en el resto en
  vez de corregirse primero.
-->

Fecha de la auditoría: 2026-07-11.

## Chequeo previo — ramas sin mergear

A diferencia de `proyecto-be_express-fe_react` (donde `main` era un scaffold vacío y el trabajo
real estaba en una rama `dev` remota nunca mergeada), este repo **solo tiene `main`** — no hay
otras ramas locales ni remotas (`git ls-remote --heads origin` confirma un único ref). `main` es
autoritativo y está completo. Sin riesgo de split de ramas aquí.

## Pertinencia

Alineado al RAP — tiene HUs (8) y RFs (8) en [`docs/requisitos/`](docs/requisitos/) y
arquitectura documentada en [`docs/referencia-tecnica/`](docs/referencia-tecnica/). ✅

## Relevancia

Stack vigente: Java 21, Spring Boot 3.5, Spring Security, Flyway, React 19/Vite/TS. Buen
contraste pedagógico con FastAPI/Express (framework empresarial tipado vs frameworks más
ligeros). ✅

## Completitud

Gaps identificados — **quedan documentados, no se corrigen en esta ronda**:

- **`bucket4j-core` está declarado en `pom.xml` pero no está implementado** — `grep -rn
  "Bucket" be/src` no arroja ningún resultado. No hay filtro/interceptor de rate limiting
  wireado en ningún endpoint de auth. Esto es una brecha de implementación real, no solo de
  documentación — el README/`docs/` no deberían seguir listando "Rate Limiting: Bucket4j" como
  si estuviera activo sin esta corrección.
- `docker-compose.yml` solo levanta `db` + `mailpit` (infra-only), igual que el repo Express —
  no conteneriza `be`/`fe`, a diferencia del repo FastAPI de referencia (4 servicios). Está
  documentado como decisión intencional en `docs/setup/con-docker.md`, pero rompe la paridad de
  experiencia "docker compose up y ya" entre los 3 repos existentes.
- Backend: solo 3 archivos de test (`AuthControllerTest`, `NnAuthSystemApplicationTests`,
  `TestcontainersConfig`) — cubre bien el flujo de auth vía MockMvc pero es una sola clase de
  test para toda la superficie.
- Frontend: 6 archivos de test, solo cubren Login/Register a nivel de página — Dashboard,
  ForgotPassword, ResetPassword, ChangePassword y VerifyEmail no tienen test.
- No existía `LICENSE` en el repo (el README solo decía "uso académico" sin licencia formal) —
  **corregido en esta ronda**: se agregó `LICENSE` (CC BY-NC-SA 4.0, igual que los otros dos
  repos) y el badge correspondiente en el README.
- El repo tenía **inconsistencia de nombre propio** en su propia documentación: la mayoría de
  archivos se autorreferenciaban como `proyecto-besb-fe` (sin la `j`, nombre incorrecto — no
  coincide con el remote real `ergrato-dev/proyecto-besbj-fe`), mientras que
  `docs/setup/con-docker.md`/`sin-docker.md` sí usaban `proyecto-besbj-fe` correctamente —
  **corregido en esta ronda**: las 12 referencias se unificaron directamente al nombre nuevo
  post-rename, `proyecto-be_springboot_java-fe_react`.

## Actualidad

Último commit `ee09a13` el 2026-04-19 (~3 meses antes de esta auditoría) — más antiguo que
FastAPI (10 días) pero comparable a Express (~3 meses, tras su merge). Sin trabajo pendiente
visible en otras ramas. ✅ contenido completo, aunque no reciente.

## Seguridad

En general sólido:

- Password hashing con `BCryptPasswordEncoder` (factor por defecto 10).
- JWT vía JJWT (HS256), access 15 min / refresh 7 días, claim `typ` distingue access/refresh,
  `jti` por token.
- `JWT_SECRET` con validación `@NotBlank @Size(min = 32)` + `@Validated` — falla rápido al
  arrancar si el secreto es corto.
- CORS acotado explícitamente a `http://localhost:5173` (no `*`), con comentario explícito
  "NUNCA usar allowedOrigins(\"*\") en producción".
- 401 vs 403 correctamente distinguidos vía `authenticationEntryPoint`/`accessDeniedHandler`
  (OWASP A07 referenciado en comentarios).
- `.env` no trackeado, solo `.env.example` (backend y frontend).

Hallazgos a documentar (mismo patrón que los otros dos repos — dev-only, debe quedar
explícito):

- `docker-compose.yml` trae hardcodeada `POSTGRES_PASSWORD: nn_password` — correcto para
  desarrollo, agregar comentario explícito "no copiar a prod".
- **Rate limiting ausente pese a estar declarado como feature** (ver Completitud) — es también
  un hallazgo de seguridad: sin él, los endpoints de login/registro no tienen protección contra
  fuerza bruta más allá de lo que Spring Security ofrece por defecto (nada, a nivel de intentos).
- No hay audit logging de intentos de login/cambios de password (a diferencia de FastAPI y
  Express, que sí registran estos eventos).

## Próximos pasos sugeridos (fuera de alcance de esta ronda)

1. Implementar el rate limiting con Bucket4j que ya está declarado como dependencia, o retirar
   la dependencia y dejar de listarla como feature activa en README/docs.
2. Agregar audit logging de eventos de seguridad (login success/failed, password changed/reset),
   replicando el patrón de `be/app/utils/audit_log.py` (FastAPI) / `be/src/utils/audit-log.ts`
   (Express).
3. Agregar workflow de CI que corra tests/lint en cada PR (mismo gap que los otros dos repos).
4. Tests de páginas frontend faltantes (Dashboard, ForgotPassword, ResetPassword,
   ChangePassword, VerifyEmail).
5. Decidir si se homologa la contenerización completa (Dockerfiles be/fe) en los 3 repos o se
   mantiene infra-only como decisión de diseño consistente.
6. Una vez resueltos 1-4, replicar el mismo patrón en el resto de `proyecto-*`.
