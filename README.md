# SWARMINSYM Project Tracker

Track **live and historical** SWARMINSYM projects from prompt → PRD → design → architecture → SDD → TDD → coding → testing → deployment, including decisions, problems, and resolutions.

## Features

- Project registry with historical retention
- Timeline view per project (decisions / problems / resolutions)
- API for ingesting run artifacts and debugging records
- Persistent storage using **SQLite** by default
- Optional DB adapter path for Postgres/MySQL (documented interface)
- Self-hostable Node.js service

## Quick Start

### Requirements
- Node.js 22+

### Install
```bash
npm install
```

### Run
```bash
npm start
# http://localhost:3000
```

### Environment Variables
- `PORT` (default: `3000`)
- `TRACKER_DB` (`sqlite` default; use `memory` for ephemeral mode)
- `DB_PATH` (default: `./data/tracker.db`)

## API (core)

### Projects
- `POST /api/projects` → create project `{ name, prompt }`
- `GET /api/projects` → list projects (historical)

### Timeline data
- `POST /api/projects/:id/decisions`
- `POST /api/projects/:id/problems`
- `POST /api/problems/:id/resolutions`
- `GET /api/projects/:id/timeline`
- `GET /api/projects/:id/debug-logs`

## Docs Bundle
See `docs/`:
- `docs/PRD.md`
- `docs/SDD.md`
- `docs/TDD.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/OPERATIONS.md`

## Self-hosting

### Bare metal / VPS
```bash
npm ci --omit=dev
PORT=3000 TRACKER_DB=sqlite DB_PATH=./data/tracker.db npm start
```

### PM2
```bash
pm2 start "npm start" --name swarminsym-tracker
pm2 save
```

## Testing
```bash
npm test
```

## License
MIT
