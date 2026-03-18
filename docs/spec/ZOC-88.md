# ZOC-88 Specification — Database Schema & ORM Setup

## Summary
Implement Prisma ORM database layer for the SWARMINSYM project tracker with SQLite as default runtime, plus migration pathways for PostgreSQL, MySQL, and SQL Server.

## Scope
- Define Prisma models:
  - `Project`
  - `Phase`
  - `PhaseDetail`
  - `Decision`
  - `Problem`
  - `Resolution`
  - `DebugLog`
  - `Artifact`
  - `User`
- Configure default datasource to SQLite.
- Provide migration scripts for PostgreSQL/MySQL/SQL Server.
- Add demo seed script with one project and multiple phases.
- Verify DB connectivity and seeded records through automated tests.

## Data Model Requirements

### User
- Represents a person interacting with project lifecycle.
- Relations:
  - Owns created projects.
  - Can author decisions, problems, resolutions, debug logs, and artifacts.

### Project
- Top-level project entity.
- Relations:
  - Created by one user.
  - Contains many phases.

### Phase
- Project execution stage (planning, coding, testing, deployment).
- Relations:
  - Belongs to one project.
  - Has one optional `PhaseDetail`.
  - Has many decisions/problems/resolutions/debugLogs/artifacts.

### PhaseDetail
- Expanded metadata for a phase (objectives, status notes, acceptance checks).
- One-to-one with phase.

### Decision / Problem / Resolution / DebugLog / Artifact
- Timeline detail entities attached to a phase.
- Optional author relation to user.

## Non-functional Requirements
- Deterministic seed data IDs (where practical) for test repeatability.
- Works with `npx prisma db push` on SQLite.
- All scripts executable in CI/non-interactive shell.

## Test Plan (TDD)
1. Red: fail when schema/models/scripts/seed behavior are absent.
2. Green: implement schema, scripts, seed and pass tests.
3. Validate seeded relational data through Prisma client query.

## Security Plan
- Run dependency scan: `npm audit --json`.
- Run static checks/lint-oriented scan: `npx prisma validate` and test suite.
- Record findings in `reports/security_scan.txt`.
- Remediate High/Critical vulnerabilities where feasible.

## Deliverables
- `prisma/schema.prisma`
- `prisma/seed.js`
- provider migration helper scripts under `scripts/`
- tests under `tests/`
- `reports/security_scan.txt`
