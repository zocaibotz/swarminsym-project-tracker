export const defaultPhases = [
  {
    id: 'phase-1',
    title: 'Intake & Discovery',
    window: 'Week 1',
    owner: 'Product Lead',
    status: 'completed',
    summary: 'Gather goals, constraints, and success metrics.',
    details:
      'Stakeholder interviews, problem framing, dependency mapping, and project charter sign-off.',
    expanded: true,
  },
  {
    id: 'phase-2',
    title: 'Scope Definition',
    window: 'Week 2',
    owner: 'Project Manager',
    status: 'completed',
    summary: 'Define in-scope features and delivery milestones.',
    details:
      'Finalize MVP boundaries, acceptance criteria, and estimate risks across timeline lanes.',
    expanded: false,
  },
  {
    id: 'phase-3',
    title: 'Solution Architecture',
    window: 'Week 3',
    owner: 'Architect',
    status: 'in-progress',
    summary: 'Validate technical approach and system seams.',
    details:
      'Establish component boundaries, data contracts, and integration checkpoints.',
    expanded: false,
  },
  {
    id: 'phase-4',
    title: 'Design & Prototyping',
    window: 'Week 4',
    owner: 'UX Designer',
    status: 'in-progress',
    summary: 'Iterate interaction flows and visual language.',
    details:
      'Produce wireframes, run UX walkthroughs, and align design tokens with engineering constraints.',
    expanded: false,
  },
  {
    id: 'phase-5',
    title: 'Implementation',
    window: 'Week 5-6',
    owner: 'Frontend Team',
    status: 'pending',
    summary: 'Build core user stories and shared UI modules.',
    details:
      'Deliver timeline interactions, state handling, and accessible component behaviors.',
    expanded: false,
  },
  {
    id: 'phase-6',
    title: 'Testing & QA',
    window: 'Week 7',
    owner: 'QA Lead',
    status: 'pending',
    summary: 'Execute functional, regression, and exploratory testing.',
    details:
      'Cover timeline ordering, expand/collapse controls, visual regressions, and cross-device behavior.',
    expanded: false,
  },
  {
    id: 'phase-7',
    title: 'Security & Compliance',
    window: 'Week 8',
    owner: 'Security Engineer',
    status: 'blocked',
    summary: 'Complete baseline security and policy checks.',
    details:
      'Resolve dependency warnings, sanitize render paths, and document compliance controls.',
    expanded: false,
  },
  {
    id: 'phase-8',
    title: 'Deployment Preparation',
    window: 'Week 9',
    owner: 'DevOps',
    status: 'pending',
    summary: 'Prepare release pipelines and environment validation.',
    details:
      'Run final smoke tests, deployment rehearsal, rollback plan, and production checklist.',
    expanded: false,
  },
  {
    id: 'phase-9',
    title: 'Release & Hypercare',
    window: 'Week 10',
    owner: 'Release Manager',
    status: 'pending',
    summary: 'Launch release and monitor incident channels.',
    details:
      'Coordinate release communications, watch KPIs, and triage high-priority post-release defects.',
    expanded: false,
  },
  {
    id: 'phase-10',
    title: 'Retrospective & Optimization',
    window: 'Week 11',
    owner: 'Leadership Team',
    status: 'pending',
    summary: 'Capture lessons learned and optimize backlog.',
    details:
      'Review outcomes, quantify delivery quality, and prioritize continuous improvements.',
    expanded: false,
  },
];

export function reorderPhases(phases, fromIndex, toIndex) {
  const reordered = [...phases];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
}

export function togglePhaseExpanded(phases, phaseId) {
  return phases.map((phase) =>
    phase.id === phaseId ? { ...phase, expanded: !phase.expanded } : phase
  );
}

export function getStatusClass(status) {
  const classes = {
    pending: 'status-pending',
    'in-progress': 'status-in-progress',
    completed: 'status-completed',
    blocked: 'status-blocked',
  };

  return classes[status] ?? 'status-pending';
}
