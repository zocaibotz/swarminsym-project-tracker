#!/usr/bin/env bash
set -euo pipefail

fail(){ echo "FAIL: $1"; exit 1; }
assert_contains(){
  local file="$1"; local text="$2"
  grep -Fq "$text" "$file" || fail "$file missing: $text"
}

SD=docs/architecture/SYSTEM_DESIGN.md
AC=docs/architecture/API_CONTRACTS.md

[[ -f "$SD" ]] || fail "Missing $SD"
[[ -f "$AC" ]] || fail "Missing $AC"

# SYSTEM_DESIGN required sections
assert_contains "$SD" "## Technology Stack"
assert_contains "$SD" "## Frontend Architecture"
assert_contains "$SD" "## Backend Architecture"
assert_contains "$SD" "## Database Schema Overview"
assert_contains "$SD" "## API Design Patterns"
assert_contains "$SD" "## Deployment Strategy"
assert_contains "$SD" '```mermaid'

# API contracts required sections/endpoints
assert_contains "$AC" "## Authentication Flows"
assert_contains "$AC" "POST /api/v1/auth/login"
assert_contains "$AC" "POST /api/v1/auth/refresh"
assert_contains "$AC" "GET /api/v1/projects"
assert_contains "$AC" "POST /api/v1/projects"
assert_contains "$AC" "GET /api/v1/projects/{projectId}"
assert_contains "$AC" "GET /api/v1/projects/{projectId}/timeline"
assert_contains "$AC" "POST /api/v1/projects/{projectId}/events"
assert_contains "$AC" "## Error Schema"

echo "PASS: documentation contracts validated"
