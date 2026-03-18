# Deployment

## Local
```bash
npm install
npm start
```

## Production
```bash
npm ci --omit=dev
PORT=3000 TRACKER_DB=sqlite DB_PATH=/var/lib/swarminsym/tracker.db npm start
```

## Reverse proxy
Use Nginx/Caddy to expose HTTPS.
