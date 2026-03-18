# ZOC-90 Backend API Spec - Phase Management

## Objective
Implement backend APIs to manage a project's 10 lifecycle phases:
1. Prompt
2. PRD
3. Design
4. Architecture
5. SDD
6. TDD
7. Coding
8. Testing
9. Deployment
10. Maintenance

## Endpoints
- `POST /api/projects/:id/phases`
  - Initialize/create all 10 phases for project.
  - Optional payload can override default phase order.
- `GET /api/projects/:id/phases`
  - List phases for project in preserved configured order.
- `PUT /api/phases/:id`
  - Update phase fields (`content`, `attachments`, `status`, `order`, timestamps).
  - Validate status transitions.
- `GET /api/phases/:id/details`
  - Return full phase detail with rich text and attachments.

## Data Model
Phase:
- `id: string`
- `projectId: string`
- `name: PhaseName`
- `order: number`
- `status: "not_started" | "in_progress" | "blocked" | "completed"`
- `content: string` (rich text payload, stored raw)
- `attachments: Attachment[]`
- `startAt: string | null` (ISO timestamp)
- `endAt: string | null` (ISO timestamp)
- `createdAt: string`
- `updatedAt: string`

Attachment:
- `name: string`
- `url: string`
- `mimeType?: string`
- `size?: number`

## Validation Rules
- Exactly the 10 known phase names are managed.
- Create initializes all 10 phases in requested or default order.
- Status transitions:
  - `not_started -> in_progress | blocked`
  - `in_progress -> blocked | completed`
  - `blocked -> in_progress`
  - `completed -> completed` (immutable terminal except idempotent update)
- `startAt`/`endAt` must be ISO date strings or null.
- `endAt` cannot be earlier than `startAt` when both provided.
- `attachments` must be an array of structured objects.

## Test Plan
Red/Green TDD flow:
1. Add endpoint tests for create/list/update/details.
2. Verify 10 phases generated, ordered, and re-orderable.
3. Verify rich text + attachments persisted.
4. Verify timestamps and transition validation.
5. Implement API and in-memory repository to satisfy tests.

## Non-Goals
- Persistent DB storage.
- Authentication/authorization.
- Binary file upload handling (metadata only).
