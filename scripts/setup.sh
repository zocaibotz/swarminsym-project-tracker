#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  echo "Created .env from .env.example. Update secrets before production use."
fi

set -a
source .env
set +a

echo "Waiting for postgres..."
docker compose up -d db
until docker compose exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 2
done

echo "Running migrations + admin bootstrap..."
docker compose run --rm app python -m app.setup

echo "Starting all services..."
docker compose up -d

echo "Setup complete."
