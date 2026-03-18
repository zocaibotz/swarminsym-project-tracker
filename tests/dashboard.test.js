import { describe, it, expect } from 'vitest';
import {
  sampleDecisions,
  sampleProblems,
  filterRecords,
  renderDecisionCard,
  renderProblemCard,
  exportReport
} from '../src/dashboard.js';

describe('ZOC-94 Decisions & Problems UI', () => {
  it('filters by phase, severity and date range', () => {
    const filtered = filterRecords(sampleProblems, {
      phase: 'implementation',
      severity: 'high',
      startDate: '2026-03-01',
      endDate: '2026-03-31'
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('P-100');
  });

  it('renders decisions with reasoning and outcomes', () => {
    const el = renderDecisionCard(sampleDecisions[0]);
    const text = el.textContent;

    expect(text).toContain('Reasoning');
    expect(text).toContain(sampleDecisions[0].reasoning);
    expect(text).toContain('Outcome');
    expect(text).toContain(sampleDecisions[0].outcome);
  });

  it('renders problems with all resolution outcomes and highlighted debug logs', () => {
    const el = renderProblemCard(sampleProblems[0]);
    const text = el.textContent;

    expect(text).toContain(sampleProblems[0].issueDescription);
    for (const resolution of sampleProblems[0].resolutions) {
      expect(text).toContain(resolution.attempt);
      expect(text).toContain(resolution.outcome);
    }

    const codeBlocks = el.querySelectorAll('code.token, pre code');
    expect(codeBlocks.length).toBeGreaterThan(0);
  });

  it('exports a JSON report for the active view', () => {
    const report = exportReport('decisions', sampleDecisions);
    const parsed = JSON.parse(report.content);

    expect(report.filename).toMatch(/^decisions-report-\d{4}-\d{2}-\d{2}\.json$/);
    expect(parsed.view).toBe('decisions');
    expect(parsed.items.length).toBe(sampleDecisions.length);
  });
});
