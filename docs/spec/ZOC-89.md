# ZOC-89 Specification: Backend API - Projects CRUD

## Scope
Implement REST endpoints for project management with validation and soft-delete behavior.

## Endpoints

### POST `/api/projects`
- Creates a project.
- Request body validated via Zod.
- Success: `201 Created` with created object.
- Invalid payload: `400 Bad Request`.

### GET `/api/projects`
- Returns non-deleted projects with pagination.
- Query params:
  - `page` (default 1)
  - `limit` (default 10)
- Success: `200 OK` with:
  - `data`: array of projects
  - `meta`: `{ total, page, limit }`

### GET `/api/projects/:id`
- Returns single non-deleted project.
- Success: `200 OK`
- Not found or deleted: `404 Not Found`

### PUT `/api/projects/:id`
- Updates an existing non-deleted project.
- Request body validated via Zod.
- Success: `200 OK` with updated object.
- Invalid payload: `400 Bad Request`
- Not found/deleted: `404 Not Found`

### DELETE `/api/projects/:id`
- Soft deletes by setting `deletedAt` timestamp.
- Success: `204 No Content`
- Not found/deleted: `404 Not Found`

## Data Model
Project fields:
- `id` (string)
- `name` (string, required, min length 1)
- `description` (string, optional)
- `status` (enum: `planned | active | completed`)
- `createdAt` (ISO string)
- `updatedAt` (ISO string)
- `deletedAt` (ISO string or null)

## Validation Rules (Zod)
- Create schema requires: `name`, `status`; optional `description`.
- Update schema supports partial updates with same constraints.
- Reject unknown/invalid types and enum violations.

## Testing Strategy (TDD)
Unit/API tests with Supertest + Jest:
1. POST success + validation failure
2. GET list returns pagination metadata
3. GET by id success + 404
4. PUT success + validation failure + 404
5. DELETE soft delete + cannot fetch deleted

## Security/Quality
- Input validation at API boundary using Zod.
- No hard delete in delete route.
- Local security scan via dependency audit and static checks.
