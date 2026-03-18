#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-file.sql>"
  exit 1
fi

backup_file="$1"
if [[ ! -f "$backup_file" ]]; then
  echo "Backup file not found: $backup_file"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

set -a
source .env
set +a

cat "$backup_file" | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
echo "Restore complete from: $backup_file"
