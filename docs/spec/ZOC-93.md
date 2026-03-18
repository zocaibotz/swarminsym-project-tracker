# ZOC-93 – Frontend Phase Timeline Visualization

## Summary
Build an interactive project phase timeline UI that shows 10 phases in chronological order with clear status indicators, expandable details, drag-and-drop reordering, smooth transitions, and responsive mobile behavior.

## Goals
- Visualize all project phases in a timeline format.
- Support user interaction:
  - Expand/collapse phase details
  - Drag-and-drop reordering
- Provide strong status visibility (pending, in-progress, completed, blocked).
- Keep transitions smooth and readable.
- Ensure mobile layout remains usable via horizontal scroll.

## Non-Goals
- Persisting timeline changes to backend storage.
- Authentication, roles, or multi-user collaboration.
- API integration.

## Functional Requirements
1. Timeline renders exactly 10 predefined phases in chronological order on initial load.
2. Each phase card can expand/collapse to reveal full details.
3. Phase cards can be reordered with drag-and-drop.
4. Each phase shows one of four statuses with distinct visual treatments:
   - pending
   - in-progress
   - completed
   - blocked
5. Reordering should update displayed order immediately.

## UX/UI Requirements
- Desktop/tablet:
  - Vertical timeline with left-side line and status nodes.
  - Card transitions animate smoothly (hover, expand/collapse, ordering motion).
- Mobile:
  - Timeline becomes horizontally scrollable.
  - Cards remain readable and interactive.

## Data Model
```ts
type PhaseStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

interface Phase {
  id: string;
  title: string;
  window: string;
  owner: string;
  status: PhaseStatus;
  summary: string;
  details: string;
  expanded: boolean;
}
```

## Interaction Design
- Expand/collapse:
  - Triggered by clicking phase header button.
  - Expanded state toggles in-memory.
- Drag-and-drop:
  - Drag card from index A and drop on index B.
  - Array reorder utility returns updated list.
  - UI re-renders using new order.

## Technical Design
- Plain HTML/CSS/JavaScript implementation.
- Logic split:
  - `src/phases.js`: data + pure functions (reorder/toggle/status classes).
  - `src/timeline.js`: rendering + event wiring.
  - `src/styles.css`: timeline layout, status styles, transitions, responsive behavior.
- Entry point:
  - `index.html` loads `src/timeline.js` as ES module.

## Testing Strategy (TDD)
- Red: write failing tests for pure phase logic:
  - default phases count/order
  - reorder behavior
  - expand/collapse toggle
  - status class mapping
- Green: implement `src/phases.js` to satisfy tests.
- Verify test logs for both failing and passing runs.

## Security Considerations
- No external scripts/CDNs.
- No dynamic HTML injection from untrusted input.
- Use `textContent` for rendering user-visible strings.
- Run local dependency/security checks and document findings.

## Acceptance Criteria Mapping
- Timeline displays all 10 phases in order → predefined phase list + initial render.
- Each phase expands to show full details → toggle + detail panel.
- Status colors clearly distinguishable → status-specific classes/colors.
- Phase transitions animated smoothly → CSS transitions for card/body.
- Mobile view shows horizontal scrollable timeline → responsive media query with horizontal overflow.
