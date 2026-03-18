#!/usr/bin/env bash
set -euo pipefail

PROVIDER="${1:-}"
if [[ -z "$PROVIDER" ]]; then
  echo "Usage: $0 <postgresql|mysql|sqlserver>"
  exit 1
fi

SCHEMA_FILE="prisma/schema.${PROVIDER}.prisma"
OUT_DIR="prisma/migrations/${PROVIDER}"
OUT_FILE="${OUT_DIR}/baseline.sql"

if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "Schema file not found: $SCHEMA_FILE"
  exit 1
fi

mkdir -p "$OUT_DIR"

npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel "$SCHEMA_FILE" \
  --script > "$OUT_FILE"

echo "Generated ${OUT_FILE}"
