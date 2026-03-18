# ZOC-94 – Frontend Decisions & Problems UI Spec

## 1. Summary
Implement a frontend dashboard with two dedicated views:
- **Decisions Log View** for AI decision records (reasoning + outcome)
- **Problems Tracker View** for problem cards, attempted resolutions, outcomes, and linked debug logs

The UI must support filtering by phase, severity, and date range, with export support for reports.

## 2. Goals
- Provide clear visibility into AI decision rationale and outcomes.
- Track problems and all attempted resolutions in one place.
- Make filters intuitive and quickly actionable.
- Enable data export for external reporting.

## 3. Non-Goals
- Backend APIs or persistence layer changes.
- Authentication/authorization flows.
- Real-time updates or websockets.

## 4. Data Model (Frontend)

### Decision
- `id: string`
- `title: string`
- `phase: string` (e.g., planning, implementation, testing, release)
- `severity: string` (low, medium, high, critical)
- `timestamp: string` (ISO datetime)
- `reasoning: string`
- `outcome: string`

### Problem
- `id: string`
- `phase: string`
- `severity: string`
- `timestamp: string` (ISO datetime)
- `issueDescription: string`
- `resolutions: Array<{ attempt: string, outcome: string, at: string }>`
- `debugLogs: Array<{ id: string, language: string, content: string }>`

## 5. UX Requirements
- Top-level tabs: **Decisions** and **Problems**.
- Shared filter panel:
  - phase dropdown (with “all”)
  - severity dropdown (with “all”)
  - start date and end date
  - clear/reset filters control
- Export control:
  - Export current view data to JSON report
- Decision cards must render reasoning and outcome clearly.
- Problem cards must show:
  - issue description
  - each attempted resolution + outcome
  - linked debug logs with syntax highlighting

## 6. Functional Acceptance Mapping
1. Decisions view shows reasoning and outcomes. ✅
2. Problems view links to all resolutions. ✅
3. Debug logs display with syntax highlighting. ✅
4. Filter controls intuitive and functional. ✅
5. Export functionality works for reports. ✅

## 7. Testing Strategy (TDD)
- Unit tests for filtering by phase, severity, and date range.
- Component tests for decisions rendering (reasoning + outcome).
- Component tests for problem cards (resolution links/list + syntax highlighted logs).
- Export tests validating report payload content and filename semantics.

## 8. Security Considerations
- Escape/handle untrusted log content via text rendering (no raw HTML injection).
- Keep dependencies audited and patch High/Critical vulnerabilities before completion.
- Lint for obvious anti-patterns (optional if lint pipeline exists).

## 9. Deliverables
- `docs/spec/ZOC-94.md`
- UI implementation files
- Test suite with red->green evidence
- `reports/security_scan.txt`
