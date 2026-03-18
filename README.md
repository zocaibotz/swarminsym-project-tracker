# swarminsym-project-tracker

Self-hosted runtime for the project tracker.

## Quick Start

```bash
cp .env.example .env
# update secrets in .env
./scripts/setup.sh
```

Then access health endpoints:
- `http://localhost:8000/health/liveness`
- `http://localhost:8000/health/readiness`

## Day-2 Ops

Start/stop:
```bash
docker compose up -d
docker compose down
```

Backup:
```bash
./scripts/backup.sh
```

Restore:
```bash
./scripts/restore.sh ./backups/<file>.sql
```
