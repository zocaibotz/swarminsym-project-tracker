import test from 'node:test';
import assert from 'node:assert/strict';
import { globalSearch, buildSearchIndex } from '../src/search/globalSearch.js';

const seed = {
  projects: [
    {
      id: 'p1',
      name: 'Apollo',
      phases: [
        { id: 'ph1', title: 'Discovery' },
        { id: 'ph2', title: 'Build' }
      ],
      decisions: [{ id: 'd1', title: 'Use TypeScript' }],
      problems: [{ id: 'pr1', title: 'Latency spikes' }]
    },
    {
      id: 'p2',
      name: 'Zephyr',
      phases: [{ id: 'ph3', title: 'Planning' }],
      decisions: [{ id: 'd2', title: 'Use queue' }],
      problems: [{ id: 'pr2', title: 'Retry storms' }]
    }
  ]
};

test('global search returns entities across all domains', () => {
  const index = buildSearchIndex(seed);
  const { results } = globalSearch(index, 'type');
  const types = new Set(results.map((item) => item.entityType));
  assert.ok(types.has('decision'));
});

test('global search responds within 500ms for 10k entities', () => {
  const projects = [];
  for (let i = 0; i < 2000; i += 1) {
    projects.push({
      id: `p-${i}`,
      name: `Project ${i}`,
      phases: [{ id: `ph-${i}`, title: `Phase ${i}` }],
      decisions: [{ id: `d-${i}`, title: `Decision ${i}` }],
      problems: [{ id: `pr-${i}`, title: `Problem ${i}` }]
    });
  }

  const index = buildSearchIndex({ projects });
  const { elapsedMs } = globalSearch(index, 'Project 1999');
  assert.ok(elapsedMs < 500, `Expected <500ms but got ${elapsedMs}`);
});
