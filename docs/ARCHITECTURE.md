# Architecture

## Components
- API server (`src/app.js`)
- HTTP entry (`src/server.js`)
- Static UI (`public/index.html`)
- SQLite file (`data/tracker.db`)

## Runtime
- Stateless API layer with durable DB file
- Suitable for PM2/systemd deployment
