const express = require('express');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PHASE_NAMES = [
  'Prompt',
  'PRD',
  'Design',
  'Architecture',
  'SDD',
  'TDD',
  'Coding',
  'Testing',
  'Deployment',
  'Maintenance'
];

const VALID_STATUSES = ['not_started', 'in_progress', 'blocked', 'completed'];
const STATUS_TRANSITIONS = {
  not_started: ['in_progress', 'blocked'],
  in_progress: ['blocked', 'completed'],
  blocked: ['in_progress'],
  completed: ['completed']
};

const projects = new Map(); // projectId -> phaseIds[]
const phases = new Map(); // phaseId -> phase data
let nextId = 1;

function nowISO() {
  return new Date().toISOString();
}

function isValidIsoOrNull(value) {
  if (value === null) return true;
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function ensureValidPhaseOrder(phaseOrder) {
  if (!Array.isArray(phaseOrder) || phaseOrder.length !== 10) {
    return false;
  }
  const set = new Set(phaseOrder);
  return set.size === 10 && PHASE_NAMES.every((name) => set.has(name));
}

function normalizeAttachments(input) {
  if (input === undefined) return undefined;
  if (!Array.isArray(input)) throw new Error('attachments must be an array');

  return input.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('attachment must be an object');
    if (typeof item.name !== 'string' || typeof item.url !== 'string') {
      throw new Error('attachment name and url are required strings');
    }

    return {
      name: item.name,
      url: item.url,
      mimeType: item.mimeType,
      size: item.size
    };
  });
}

function sortProjectPhases(projectId) {
  const ids = projects.get(projectId) || [];
  const sorted = ids
    .map((id) => phases.get(id))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  projects.set(projectId, sorted.map((p) => p.id));
  return sorted;
}

function movePhaseWithinProject(phase, newOrder) {
  const projectPhases = sortProjectPhases(phase.projectId);
  const without = projectPhases.filter((p) => p.id !== phase.id);

  const bounded = Math.max(1, Math.min(without.length + 1, newOrder));
  without.splice(bounded - 1, 0, phase);

  without.forEach((p, index) => {
    p.order = index + 1;
    p.updatedAt = nowISO();
    phases.set(p.id, p);
  });

  projects.set(phase.projectId, without.map((p) => p.id));
}

app.post('/api/projects/:id/phases', (req, res) => {
  const projectId = req.params.id;

  if (projects.has(projectId)) {
    return res.status(409).json({ error: 'Phases already initialized for project' });
  }

  const configuredOrder = req.body?.phaseOrder || PHASE_NAMES;
  if (!ensureValidPhaseOrder(configuredOrder)) {
    return res.status(400).json({ error: 'phaseOrder must contain exactly the 10 predefined phase names' });
  }

  const ids = [];
  const created = configuredOrder.map((name, index) => {
    const ts = nowISO();
    const phase = {
      id: `phase-${nextId++}`,
      projectId,
      name,
      order: index + 1,
      status: 'not_started',
      content: '',
      attachments: [],
      startAt: null,
      endAt: null,
      createdAt: ts,
      updatedAt: ts
    };

    phases.set(phase.id, phase);
    ids.push(phase.id);
    return phase;
  });

  projects.set(projectId, ids);
  return res.status(201).json({ projectId, phases: created });
});

app.get('/api/projects/:id/phases', (req, res) => {
  const projectId = req.params.id;
  if (!projects.has(projectId)) {
    return res.status(404).json({ error: 'Project phases not found' });
  }

  return res.status(200).json({ projectId, phases: sortProjectPhases(projectId) });
});

app.put('/api/phases/:id', (req, res) => {
  const phase = phases.get(req.params.id);
  if (!phase) {
    return res.status(404).json({ error: 'Phase not found' });
  }

  const updates = req.body || {};

  if (updates.status !== undefined) {
    if (!VALID_STATUSES.includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const allowed = STATUS_TRANSITIONS[phase.status] || [];
    if (updates.status !== phase.status && !allowed.includes(updates.status)) {
      return res.status(400).json({ error: `Invalid status transition: ${phase.status} -> ${updates.status}` });
    }
    phase.status = updates.status;
  }

  if (updates.content !== undefined) {
    if (typeof updates.content !== 'string') {
      return res.status(400).json({ error: 'content must be a string' });
    }
    phase.content = updates.content;
  }

  try {
    const normalizedAttachments = normalizeAttachments(updates.attachments);
    if (normalizedAttachments !== undefined) {
      phase.attachments = normalizedAttachments;
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  if (updates.startAt !== undefined) {
    if (!isValidIsoOrNull(updates.startAt)) {
      return res.status(400).json({ error: 'startAt must be a valid ISO timestamp or null' });
    }
    phase.startAt = updates.startAt;
  }

  if (updates.endAt !== undefined) {
    if (!isValidIsoOrNull(updates.endAt)) {
      return res.status(400).json({ error: 'endAt must be a valid ISO timestamp or null' });
    }
    phase.endAt = updates.endAt;
  }

  if (phase.startAt && phase.endAt && new Date(phase.endAt) < new Date(phase.startAt)) {
    return res.status(400).json({ error: 'endAt cannot be earlier than startAt' });
  }

  phase.updatedAt = nowISO();
  phases.set(phase.id, phase);

  if (updates.order !== undefined) {
    if (!Number.isInteger(updates.order)) {
      return res.status(400).json({ error: 'order must be an integer' });
    }
    movePhaseWithinProject(phase, updates.order);
  }

  return res.status(200).json({ phase: phases.get(phase.id) });
});

app.get('/api/phases/:id/details', (req, res) => {
  const phase = phases.get(req.params.id);
  if (!phase) {
    return res.status(404).json({ error: 'Phase not found' });
  }

  return res.status(200).json({ phase });
});

module.exports = {
  app,
  PHASE_NAMES,
  __store: { projects, phases }
};