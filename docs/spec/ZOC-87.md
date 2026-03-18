# ZOC-87 — Core Observability Setup

## SDD (Software Design & Delivery Plan)

### Objective
Implement a core observability foundation for API services:
1. Global structured JSON logger.
2. OpenTelemetry tracing with per-request trace IDs.
3. APM initialization/connection bootstrap.
4. Centralized error handling middleware.
5. Request/response logging hooks.
6. Environment-variable-driven log behavior.

### Architecture & Components
- `src/lib/logger.ts`
  - Exposes default singleton logger (`import logger from '@/lib/logger'`).
  - Uses structured JSON output with ISO timestamps.
  - Uses `LOG_LEVEL` and optional `LOG_PRETTY`.

- `src/lib/tracing.ts`
  - Initializes OpenTelemetry Node tracer provider.
  - Creates spans for requests and exposes trace helper APIs.
  - Supports service metadata via `OTEL_SERVICE_NAME`.

- `src/lib/apm.ts`
  - Bootstraps Elastic APM when `APM_ENABLED=true`.
  - Configurable with `APM_SERVICE_NAME`, `APM_SERVER_URL`, `NODE_ENV`.

- `src/lib/observability.ts`
  - Unified startup function `bootstrapObservability()`.
  - Ensures logger + tracing + APM initialization are wired.

- `src/middleware/requestLogging.ts`
  - Creates per-request span.
  - Injects trace ID into request context and `x-trace-id` response header.
  - Logs request start/end with structured payload.

- `src/middleware/errorHandler.ts`
  - Captures errors in one place.
  - Logs stack + request context (method/path/body/params/query/requestId/traceId).
  - Forwards to APM `captureError` when client exists.

### TDD Plan
- **Red phase**: add failing test for missing observability bootstrap module.
- **Green phase**: add implementation and complete behavior tests covering:
  - global logger accessibility,
  - trace ID propagation to API response,
  - error logging with stack/context.

### Security Plan
- Run local SAST with Semgrep.
- Run dependency audit with npm audit (high+ threshold).
- Remediate any High/Critical findings before completion.

### Critic Review Checklist
- Does logger remain importable from `@/lib/logger`? ✅
- Are trace IDs attached to every request path using middleware? ✅
- Are errors logged with stack and request context? ✅
- Is APM initialization explicit and environment-driven? ✅
- Is log behavior configurable via env vars? ✅
