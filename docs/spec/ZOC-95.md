# ZOC-95 Spec: Frontend Search & Global Navigation

## 1. Scope
Implement frontend foundation for:
- Global search across `projects`, `phases`, `decisions`, and `problems`
- Persistent, keyboard-accessible navigation sidebar
- Project switcher with recent projects memory
- Settings access and user preferences (theme)
- Keyboard shortcuts for power workflows

## 2. Functional Design

### 2.1 Global Search
- Build an in-memory normalized index from domain data.
- Search uses case-insensitive substring matching across entity titles.
- Return shape includes entity type and owning project ID.
- Hard performance target: each query returns in `< 500ms` for large datasets.

### 2.2 Navigation Sidebar
- Core nav items: Projects, Search, Settings.
- Sidebar persists state while session is active.
- Keyboard focus is roving-index based (`focusNext`, `focusPrevious`).
- Mobile behavior: automatically collapsed at viewport widths `<= 768px`.

### 2.3 Project Switcher + Recents
- `switchProject(projectId)` updates current project context.
- Recent list is de-duplicated, newest first, max 10 items.
- Stored in preference store under `recentProjects`.

### 2.4 Theme Preference
- Supported themes: `light`, `dark`.
- Default: `light`.
- Theme toggle flips and persists in preference store.

### 2.5 Keyboard Shortcuts
- `Ctrl/Cmd + K` -> open global search
- `Ctrl/Cmd + P` -> open project switcher
- `Ctrl/Cmd + ,` -> open settings

## 3. Non-Functional Requirements
- Query latency measured inside search function must stay below 500ms in test dataset.
- Keyboard operations must be deterministic and test-covered.
- Preference mutations must be side-effect free except explicit state updates.

## 4. Test Strategy (TDD)
1. Write failing tests for search performance/coverage and navigation behaviors.
2. Implement modules to make tests pass.
3. Re-run full suite and capture green output.

## 5. Security Plan
- No dynamic code execution.
- No use of `eval`/Function constructors.
- Run dependency and static checks locally and record outputs in `reports/security_scan.txt`.

## 6. Deliverables
- `src/search/globalSearch.js`
- `src/navigation/sidebarController.js`
- `src/navigation/shortcutManager.js`
- `src/theme/themeManager.js`
- `src/preferences/memoryPreferencesStore.js`
- tests in `tests/`
