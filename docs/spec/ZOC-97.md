# ZOC-97: Integration Testing Plan (SDD → TDD → Implement → Security → Critic)

## 1) SDD (Solution Design)

### Objective
Add integration/E2E coverage for critical product journeys in the SWARMINSYM Project Tracker:
1. Create project
2. Add phases
3. Log decisions
4. Report problems
5. Add resolutions

### Test Strategy
- Use **Playwright** for browser-level E2E.
- Author BDD scenarios in **Gherkin** (`features/*.feature`).
- Mirror each scenario with runnable Playwright specs (`tests/e2e/*.spec.ts`).
- Configure test evidence:
  - Screenshots on failure
  - HTML report output for CI artifacts

### CI Strategy
- GitHub Actions workflow runs on push/PR.
- Execute headless Chromium tests.
- Upload Playwright HTML report and test-results artifacts.

### Coverage-of-Flow Target
Flow coverage is measured across 5 critical journeys listed above.
- Planned coverage: **5/5 journeys = 100%** (meets minimum 80%).

## 2) TDD Plan
- **Red**: Create E2E tests before implementing the UI and run them (expected fail).
- **Green**: Implement minimal app and persistence-in-memory behavior to satisfy tests, rerun tests to pass.

## 3) Security Plan
- Run local SAST/dependency checks:
  - `npm audit --audit-level=high`
  - `semgrep --config p/owasp-top-ten .`
- Record findings and remediation in `reports/security_scan.txt`.

## 4) Critic Review Checklist
- [x] Tests are meaningful and not brittle
- [x] Feature files reflect user language and acceptance criteria
- [x] CI is deterministic and headless
- [x] Failure artifacts are available (screenshots/report)
- [x] No High/Critical security findings remain

## 5) Execution Evidence

### TDD Red
- Command: `npm run test:e2e`
- Result: Failed as expected (`Cannot find module 'server.js'`), confirming tests were authored before implementation.

### TDD Green
- Command: `npm run test:e2e`
- Result: `5 passed` in headless Chromium.

### Coverage of critical flows
- Implemented journeys: 5/5
- Coverage of critical user-flow set: **100%**

## Deliverables
- `docs/spec/ZOC-97.md`
- `features/project_tracker.feature`
- `tests/e2e/project-tracker.spec.ts`
- `playwright.config.ts`
- `server.js` + minimal app under `app/`
- `.github/workflows/e2e.yml`
- `reports/security_scan.txt`
