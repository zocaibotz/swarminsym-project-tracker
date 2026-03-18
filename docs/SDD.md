# SDD

## Design Summary
- Backend: Node.js + Express
- Storage: SQLite (default) via node:sqlite
- Frontend: static HTML/JS (served by Express)

## Data Model
- projects
- decisions
- problems
- resolutions

## Flows
1. Create project
2. Add timeline events by phase
3. Query timeline and debug logs
