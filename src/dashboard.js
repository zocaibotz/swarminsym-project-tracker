import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';

export const sampleDecisions = [
  {
    id: 'D-001',
    title: 'Retry strategy for flaky node',
    phase: 'implementation',
    severity: 'medium',
    timestamp: '2026-03-10T08:00:00Z',
    reasoning: 'Transient timeout signatures matched previous recoverable failures.',
    outcome: 'Enabled capped exponential backoff and reduced failure rate by 42%.'
  },
  {
    id: 'D-002',
    title: 'Escalate model hallucination event',
    phase: 'testing',
    severity: 'high',
    timestamp: '2026-03-15T10:30:00Z',
    reasoning: 'Incorrect domain assertions persisted after prompt guardrails.',
    outcome: 'Introduced policy check gate and routed suspicious answers for human review.'
  }
];

export const sampleProblems = [
  {
    id: 'P-100',
    phase: 'implementation',
    severity: 'high',
    timestamp: '2026-03-12T14:22:00Z',
    issueDescription: 'Worker queue deadlocked after partial retry storm.',
    resolutions: [
      {
        attempt: 'Increase worker pool from 4 to 8',
        outcome: 'No improvement; lock contention remained.',
        at: '2026-03-12T15:00:00Z'
      },
      {
        attempt: 'Add per-job timeout and dead letter fallback',
        outcome: 'Resolved deadlock path and restored throughput.',
        at: '2026-03-12T17:05:00Z'
      }
    ],
    debugLogs: [
      {
        id: 'LOG-44',
        language: 'javascript',
        content: 'if (job.retries > limit) {\n  queue.deadLetter(job);\n}\n'
      }
    ]
  },
  {
    id: 'P-101',
    phase: 'testing',
    severity: 'medium',
    timestamp: '2026-02-11T14:22:00Z',
    issueDescription: 'Snapshot drift after UI token change.',
    resolutions: [
      {
        attempt: 'Update baseline snapshots',
        outcome: 'Resolved after visual verification.',
        at: '2026-02-11T15:10:00Z'
      }
    ],
    debugLogs: [
      {
        id: 'LOG-45',
        language: 'json',
        content: '{"theme":"dark","token":"surface-2"}'
      }
    ]
  }
];

export function filterRecords(records, filters = {}) {
  return records.filter((record) => {
    const recordDate = new Date(record.timestamp);
    const phaseOk = !filters.phase || filters.phase === 'all' || record.phase === filters.phase;
    const sevOk = !filters.severity || filters.severity === 'all' || record.severity === filters.severity;
    const startOk = !filters.startDate || recordDate >= new Date(`${filters.startDate}T00:00:00Z`);
    const endOk = !filters.endDate || recordDate <= new Date(`${filters.endDate}T23:59:59Z`);
    return phaseOk && sevOk && startOk && endOk;
  });
}

function createCard(title) {
  const article = document.createElement('article');
  article.className = 'card';
  const header = document.createElement('h3');
  header.textContent = title;
  article.appendChild(header);
  return article;
}

export function renderDecisionCard(decision) {
  const card = createCard(`${decision.id} — ${decision.title}`);

  const reasoning = document.createElement('p');
  const reasoningLabel = document.createElement('strong');
  reasoningLabel.textContent = 'Reasoning: ';
  reasoning.append(reasoningLabel, document.createTextNode(decision.reasoning));

  const outcome = document.createElement('p');
  const outcomeLabel = document.createElement('strong');
  outcomeLabel.textContent = 'Outcome: ';
  outcome.append(outcomeLabel, document.createTextNode(decision.outcome));

  card.append(reasoning, outcome);
  return card;
}

export function renderProblemCard(problem) {
  const card = createCard(`${problem.id} — ${problem.issueDescription}`);

  const resolutionsTitle = document.createElement('h4');
  resolutionsTitle.textContent = 'Attempted Resolutions';
  const list = document.createElement('ul');

  problem.resolutions.forEach((resolution, index) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#resolution-${problem.id}-${index}`;
    link.textContent = resolution.attempt;
    li.append(link, document.createTextNode(` — ${resolution.outcome}`));
    list.appendChild(li);
  });

  const logsTitle = document.createElement('h4');
  logsTitle.textContent = 'Debug Logs';
  const logsWrapper = document.createElement('div');
  logsWrapper.className = 'logs';

  for (const log of problem.debugLogs) {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    const lang = log.language || 'javascript';
    code.className = `language-${lang}`;
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    code.innerHTML = Prism.highlight(log.content, grammar, lang);
    pre.appendChild(code);
    logsWrapper.appendChild(pre);
  }

  card.append(resolutionsTitle, list, logsTitle, logsWrapper);
  return card;
}

export function exportReport(view, items, now = new Date()) {
  const dateStamp = now.toISOString().slice(0, 10);
  return {
    filename: `${view}-report-${dateStamp}.json`,
    content: JSON.stringify({ view, generatedAt: now.toISOString(), items }, null, 2)
  };
}

export function renderDashboard(root) {
  const state = {
    view: 'decisions',
    filters: {
      phase: 'all',
      severity: 'all',
      startDate: '',
      endDate: ''
    }
  };

  root.innerHTML = `
    <div class="toolbar">
      <button data-view="decisions">Decisions</button>
      <button data-view="problems">Problems</button>
      <select data-filter="phase"><option value="all">All Phases</option><option value="planning">Planning</option><option value="implementation">Implementation</option><option value="testing">Testing</option></select>
      <select data-filter="severity"><option value="all">All Severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
      <input data-filter="startDate" type="date" aria-label="start date" />
      <input data-filter="endDate" type="date" aria-label="end date" />
      <button data-action="clear">Clear Filters</button>
      <button data-action="export">Export</button>
    </div>
    <section id="content"></section>
  `;

  const content = root.querySelector('#content');

  function currentData() {
    const base = state.view === 'decisions' ? sampleDecisions : sampleProblems;
    return filterRecords(base, state.filters);
  }

  function draw() {
    content.innerHTML = '';
    const data = currentData();

    if (state.view === 'decisions') {
      data.forEach((decision) => content.appendChild(renderDecisionCard(decision)));
    } else {
      data.forEach((problem) => content.appendChild(renderProblemCard(problem)));
    }
  }

  root.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.getAttribute('data-view');
      draw();
    });
  });

  root.querySelectorAll('[data-filter]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.getAttribute('data-filter');
      state.filters[key] = input.value;
      draw();
    });
  });

  root.querySelector('[data-action="clear"]').addEventListener('click', () => {
    state.filters = { phase: 'all', severity: 'all', startDate: '', endDate: '' };
    root.querySelectorAll('[data-filter]').forEach((el) => {
      el.value = state.filters[el.getAttribute('data-filter')];
    });
    draw();
  });

  root.querySelector('[data-action="export"]').addEventListener('click', () => {
    const data = currentData();
    const report = exportReport(state.view, data);
    const blob = new Blob([report.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.filename;
    a.click();
    URL.revokeObjectURL(url);
  });

  draw();
}
