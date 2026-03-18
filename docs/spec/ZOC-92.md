# ZOC-92 Spec — Frontend Project Dashboard

## 1) Objective
Build a responsive React + TypeScript dashboard for project tracking with:
- project overview cards for active projects,
- phase progress indicators,
- recent activity feed with real-time updates,
- quick stats,
- project name search,
- functional create project modal.

## 2) Scope
### In Scope
- Single-page dashboard UI built with React + TypeScript + TailwindCSS.
- Local state management for projects and activity feed.
- Real-time feed simulation via interval updates.
- Accessibility-oriented form labels and semantic elements.
- Unit/integration tests using Vitest + Testing Library.

### Out of Scope
- Backend persistence or API integration.
- Authentication/authorization.
- Multi-user synchronization.

## 3) Functional Requirements
1. **Dashboard render performance**
   - Initial dashboard render should complete within 2 seconds in local test context.
2. **Project overview cards**
   - Display active project cards with owner, phase label, and a visual progress bar.
3. **Quick stats**
   - Show active projects count, average progress, and activity events count.
4. **Real-time activity feed**
   - Add new activity items every 5 seconds and keep latest items at top.
5. **Search**
   - Search box filters projects by project name (case-insensitive).
6. **Create project modal**
   - Modal opens/closes; submitting a valid form adds a project card and activity entry.

## 4) UX & Responsive Behavior
- Mobile-first layout.
- Stacked content on small screens.
- Two-column composition (`projects` + `recent activity`) on larger screens.
- Tailwind utility classes for spacing, typography, cards, and interactive states.

## 5) Data Model (Frontend)
```ts
type Project = {
  id: number;
  name: string;
  owner: string;
  phase: 'Planning' | 'Design' | 'Build' | 'Testing' | 'Deploy';
  progress: number;
  active: boolean;
};

type Activity = {
  id: number;
  message: string;
  time: string;
};
```

## 6) Validation & Testing Plan (TDD)
- Red phase: write tests that fail for missing dashboard features.
- Green phase: implement until tests pass.

Tests cover:
- render under 2 seconds,
- quick stats and project cards present,
- search filtering by project name,
- create project modal flow,
- activity feed real-time growth after timer advance.

## 7) Security Considerations
- No dangerous HTML injection (`dangerouslySetInnerHTML`) used.
- Controlled inputs for modal form.
- Dependency audit performed; no High/Critical vulnerabilities in production deps.

## 8) Deliverables
- `src/App.tsx` dashboard implementation.
- `src/App.test.tsx` test suite for acceptance criteria.
- Tailwind/Vite/TypeScript project scaffolding.
- `reports/security_scan.txt` with scan commands and findings.
