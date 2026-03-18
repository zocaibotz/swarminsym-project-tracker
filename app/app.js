const state = {
  projectName: '',
  phases: [],
  decisions: [],
  problems: [],
  resolutions: []
};

const projectNameEl = document.querySelector('#projectName');
const projectSummaryEl = document.querySelector('[data-testid="project-name"]');
const phaseNameEl = document.querySelector('#phaseName');
const decisionNoteEl = document.querySelector('#decisionNote');
const problemReportEl = document.querySelector('#problemReport');
const resolutionDetailsEl = document.querySelector('#resolutionDetails');

const phasesList = document.querySelector('#phases');
const decisionsList = document.querySelector('#decisions');
const problemsList = document.querySelector('#problems');
const resolutionsList = document.querySelector('#resolutions');

function renderList(listEl, items, testId, formatter = (i) => i) {
  listEl.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.dataset.testid = testId;
    li.setAttribute('data-testid', testId);
    li.textContent = formatter(item);
    listEl.appendChild(li);
  }
}

function ensureProject() {
  return state.projectName.trim().length > 0;
}

document.querySelector('#createProject').addEventListener('click', () => {
  state.projectName = projectNameEl.value.trim();
  projectSummaryEl.textContent = state.projectName || 'No project yet';
});

document.querySelector('#addPhase').addEventListener('click', () => {
  if (!ensureProject()) return;
  const phase = phaseNameEl.value.trim();
  if (!phase) return;
  state.phases.push(phase);
  renderList(phasesList, state.phases, 'phase-item');
  phaseNameEl.value = '';
});

document.querySelector('#logDecision').addEventListener('click', () => {
  if (!ensureProject()) return;
  const decision = decisionNoteEl.value.trim();
  if (!decision) return;
  state.decisions.push(decision);
  renderList(decisionsList, state.decisions, 'decision-item');
  decisionNoteEl.value = '';
});

document.querySelector('#reportProblem').addEventListener('click', () => {
  if (!ensureProject()) return;
  const problem = problemReportEl.value.trim();
  if (!problem) return;
  state.problems.push(problem);
  renderList(problemsList, state.problems, 'problem-item');
  problemReportEl.value = '';
});

document.querySelector('#addResolution').addEventListener('click', () => {
  if (!ensureProject()) return;
  const resolution = resolutionDetailsEl.value.trim();
  if (!resolution || state.problems.length === 0) return;
  const linkedProblem = state.problems[state.problems.length - 1];
  state.resolutions.push({ resolution, problem: linkedProblem });
  renderList(resolutionsList, state.resolutions, 'resolution-row', (entry) => `${entry.resolution} (Problem: ${entry.problem})`);

  const spans = [...resolutionsList.querySelectorAll('li')];
  spans.forEach((item, index) => {
    item.innerHTML = '';
    const text = document.createElement('span');
    text.setAttribute('data-testid', 'resolution-item');
    text.textContent = state.resolutions[index].resolution;

    const meta = document.createElement('span');
    meta.setAttribute('data-testid', 'resolution-problem');
    meta.textContent = `Problem: ${state.resolutions[index].problem}`;

    item.appendChild(text);
    item.appendChild(document.createTextNode(' '));
    item.appendChild(meta);
  });

  resolutionDetailsEl.value = '';
});
