import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultPhases,
  getStatusClass,
  reorderPhases,
  togglePhaseExpanded,
} from '../src/phases.js';

test('default phases includes 10 chronological phases', () => {
  assert.equal(defaultPhases.length, 10);
  assert.deepEqual(
    defaultPhases.map((phase) => phase.title),
    [
      'Intake & Discovery',
      'Scope Definition',
      'Solution Architecture',
      'Design & Prototyping',
      'Implementation',
      'Testing & QA',
      'Security & Compliance',
      'Deployment Preparation',
      'Release & Hypercare',
      'Retrospective & Optimization',
    ]
  );
});

test('reorderPhases moves an item from one index to another', () => {
  const reordered = reorderPhases(defaultPhases, 0, 3);
  assert.equal(reordered[3].title, 'Intake & Discovery');
  assert.equal(reordered[0].title, 'Scope Definition');
  assert.equal(reordered.length, 10);
});

test('togglePhaseExpanded toggles only targeted phase', () => {
  const targetId = defaultPhases[2].id;
  const updated = togglePhaseExpanded(defaultPhases, targetId);
  const target = updated.find((phase) => phase.id === targetId);
  const untouched = updated.find((phase) => phase.id === defaultPhases[1].id);

  assert.equal(target.expanded, !defaultPhases[2].expanded);
  assert.equal(untouched.expanded, defaultPhases[1].expanded);
});

test('getStatusClass returns stable class names for supported statuses', () => {
  assert.equal(getStatusClass('pending'), 'status-pending');
  assert.equal(getStatusClass('in-progress'), 'status-in-progress');
  assert.equal(getStatusClass('completed'), 'status-completed');
  assert.equal(getStatusClass('blocked'), 'status-blocked');
});
