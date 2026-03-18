# ZOC-96 — Self-Hosting Configuration (SDD Plan)

## Objective
Provide a one-command self-hosted deployment path with documented configuration, health checks, first-run initialization, and operational backup/restore scripts.

## Scope
- Dockerized app + postgres runtime via Compose
- Environment template for all required variables
- Health endpoints returning HTTP 200
- First-time init script that performs DB migration and admin account bootstrap
- Backup/restore scripts for postgres data

## Non-Goals
- Kubernetes manifests
- External secret manager integration
- HA/failover topology

## Architecture
- **app**: FastAPI service exposing health endpoints and business API surface
- **db**: PostgreSQL 16 container with persistent volume
- **setup path**: `scripts/setup.sh` starts db, waits for readiness, runs `python -m app.setup` (schema creation + admin user seed), starts stack
- **backup path**: `scripts/backup.sh` runs `pg_dump` against db container
- **restore path**: `scripts/restore.sh` streams SQL dump into `psql`

## Configuration Contract
`.env.example` includes and documents:
- `APP_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `BACKUP_DIR`

## Test Strategy (TDD)
1. **Red**: add tests asserting required files/config/endpoints/scripts exist and behave; run tests before implementation to confirm failure.
2. **Green**: implement app, compose, env template, and scripts; re-run tests to pass.
3. Add lightweight endpoint checks with FastAPI TestClient (`/health/liveness`, `/health/readiness`).

## Security Considerations
- Secrets not hardcoded in source; configured via env
- `.env.example` uses placeholder values only
- No privileged containers
- SQL generated through standard tools (`pg_dump`, `psql`) without shell interpolation of untrusted SQL

## Acceptance Mapping
- **Single command start**: `docker compose up -d`
- **Health 200**: `/health/liveness` and `/health/readiness`
- **Env docs**: `.env.example`
- **First run setup**: `scripts/setup.sh`
- **Backup/restore**: `scripts/backup.sh`, `scripts/restore.sh`
