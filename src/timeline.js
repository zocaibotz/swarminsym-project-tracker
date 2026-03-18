import {
  defaultPhases,
  getStatusClass,
  reorderPhases,
  togglePhaseExpanded,
} from './phases.js';

const timelineRoot = document.querySelector('[data-timeline]');
let phases = [...defaultPhases];

function render() {
  timelineRoot.innerHTML = '';

  phases.forEach((phase, index) => {
    const item = document.createElement('article');
    item.className = `timeline-item ${getStatusClass(phase.status)}`;
    item.draggable = true;
    item.dataset.index = String(index);
    item.dataset.phaseId = phase.id;

    const header = document.createElement('header');
    header.className = 'timeline-header';

    const info = document.createElement('div');
    info.className = 'timeline-title-block';

    const title = document.createElement('h3');
    title.className = 'timeline-title';
    title.textContent = `${index + 1}. ${phase.title}`;

    const meta = document.createElement('p');
    meta.className = 'timeline-meta';
    meta.textContent = `${phase.window} • ${phase.owner}`;

    const summary = document.createElement('p');
    summary.className = 'timeline-summary';
    summary.textContent = phase.summary;

    const badge = document.createElement('span');
    badge.className = `status-pill ${getStatusClass(phase.status)}`;
    badge.textContent = phase.status;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'expand-btn';
    toggleBtn.setAttribute('aria-expanded', String(phase.expanded));
    toggleBtn.textContent = phase.expanded ? 'Collapse' : 'Expand';
    toggleBtn.addEventListener('click', () => {
      phases = togglePhaseExpanded(phases, phase.id);
      render();
    });

    info.append(title, meta, summary);
    header.append(info, badge, toggleBtn);

    const details = document.createElement('section');
    details.className = `timeline-details ${phase.expanded ? 'is-open' : ''}`;

    const detailText = document.createElement('p');
    detailText.textContent = phase.details;
    details.append(detailText);

    item.append(header, details);

    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', String(index));
      item.classList.add('is-dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('is-dragging');
    });

    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (event) => {
      event.preventDefault();
      item.classList.remove('drag-over');

      const from = Number(event.dataTransfer.getData('text/plain'));
      const to = index;

      if (Number.isNaN(from) || from === to) {
        return;
      }

      phases = reorderPhases(phases, from, to);
      render();
    });

    timelineRoot.append(item);
  });
}

render();
