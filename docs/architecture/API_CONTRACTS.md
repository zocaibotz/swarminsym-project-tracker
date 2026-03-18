# API CONTRACTS — SWARMINSYM Project Tracker

Base URL: `/api/v1`  
Content Type: `application/json`  
Authentication: `Bearer <access_token>` unless noted.

## Envelope Conventions
### Success
```json
{
  "data": {},
  "meta": {
    "traceId": "req_123",
    "timestamp": "2026-03-18T02:00:00Z"
  }
}
```

### Error Schema
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [{ "field": "name", "issue": "required" }],
    "traceId": "req_123"
  }
}
```

## Authentication Flows
### 1) Login
**POST /api/v1/auth/login**  
Auth: none

Request:
```json
{ "email": "user@example.com", "password": "********" }
```
Response 200:
```json
{
  "data": {
    "accessToken": "jwt",
    "expiresIn": 900,
    "user": { "id": "usr_1", "email": "user@example.com", "role": "editor" }
  }
}
```

### 2) Refresh Token
**POST /api/v1/auth/refresh**  
Auth: refresh token cookie

Request:
```json
{ "grantType": "refresh_token" }
```
Response 200:
```json
{ "data": { "accessToken": "jwt", "expiresIn": 900 } }
```

### 3) Logout
**POST /api/v1/auth/logout**
Response 204 (token revoked).

## Users
### Get Current User
**GET /api/v1/users/me**
Response 200:
```json
{
  "data": {
    "id": "usr_1",
    "email": "user@example.com",
    "displayName": "Zi",
    "role": "admin"
  }
}
```

## Projects
### List Projects
**GET /api/v1/projects**

Query params:
- `cursor` (optional)
- `limit` (default 20, max 100)
- `status` (optional: planning|active|blocked|completed)
- `q` (optional text search)

Response 200:
```json
{
  "data": [
    {
      "id": "prj_1",
      "name": "Tracker MVP",
      "slug": "tracker-mvp",
      "status": "active",
      "createdAt": "2026-03-15T10:00:00Z"
    }
  ],
  "meta": { "nextCursor": "prj_1" }
}
```

### Create Project
**POST /api/v1/projects**

Request:
```json
{
  "name": "Tracker MVP",
  "description": "Track all project lifecycle events",
  "status": "planning"
}
```

Response 201:
```json
{
  "data": {
    "id": "prj_1",
    "name": "Tracker MVP",
    "slug": "tracker-mvp",
    "status": "planning"
  }
}
```

### Get Project Detail
**GET /api/v1/projects/{projectId}**
Response 200 includes metadata, members, current phase.

### Update Project
**PATCH /api/v1/projects/{projectId}**
Request fields: `name?`, `description?`, `status?`.
Response 200 updated object.

### Delete Project
**DELETE /api/v1/projects/{projectId}**
Response 204.

## Timeline & Events
### Get Project Timeline
**GET /api/v1/projects/{projectId}/timeline**

Query params:
- `cursor`, `limit`
- `phase` (prompt|planning|coding|debugging|deployment)
- `severity` (low|medium|high|critical)

Response 200:
```json
{
  "data": [
    {
      "id": "evt_1",
      "phase": "coding",
      "eventType": "ai_decision",
      "title": "Selected modular architecture",
      "body": "Rationale and alternatives",
      "severity": "medium",
      "createdAt": "2026-03-16T14:10:00Z",
      "createdBy": "usr_1"
    }
  ],
  "meta": { "nextCursor": null }
}
```

### Add Timeline Event
**POST /api/v1/projects/{projectId}/events**

Request:
```json
{
  "phase": "debugging",
  "eventType": "incident",
  "title": "Auth refresh loop",
  "body": "Token cookie mismatch under safari",
  "severity": "high",
  "artifacts": [
    { "type": "log", "url": "https://storage/...", "checksum": "sha256:..." }
  ]
}
```

Response 201:
```json
{
  "data": {
    "id": "evt_77",
    "projectId": "prj_1",
    "phase": "debugging",
    "eventType": "incident",
    "severity": "high"
  }
}
```

## Incidents
### List Incidents
**GET /api/v1/projects/{projectId}/incidents**

### Create Incident
**POST /api/v1/projects/{projectId}/incidents**

### Resolve Incident
**POST /api/v1/projects/{projectId}/incidents/{incidentId}/resolve**

## Artifacts
### Request Upload URL
**POST /api/v1/artifacts/upload-url**
Request: `{ "filename": "debug.log", "contentType": "text/plain" }`  
Response: signed URL + headers.

### Attach Artifact to Event
**POST /api/v1/projects/{projectId}/events/{eventId}/artifacts**

## Audit
### List Audit Logs
**GET /api/v1/projects/{projectId}/audit-logs**
- Admin only.
- Supports `cursor`, `limit`, `action`, `actorUserId`.

## Authorization Matrix
- Viewer: read-only projects/timeline/artifacts.
- Editor: viewer + create/update events/incidents/projects.
- Admin: editor + delete project, view audit logs, manage members.

## Status Code Policy
- `200` success read/update
- `201` created
- `204` no content
- `400` validation
- `401` unauthenticated
- `403` unauthorized
- `404` not found
- `409` conflict
- `422` semantic validation
- `429` rate limited
- `500` internal

## Versioning & Compatibility
- Backward-compatible changes allowed in v1 (additive fields/endpoints).
- Breaking changes require v2 path introduction.
- Deprecation policy: at least 90 days with changelog notice.
