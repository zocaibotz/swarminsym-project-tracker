const express = require('express');
const crypto = require('crypto');

function nowIso() {
  return new Date().toISOString();
}

function textMatches(entry, q) {
  if (!q) return true;
  const hay = JSON.stringify(entry).toLowerCase();
  return hay.includes(String(q).toLowerCase());
}

function inDateRange(entry, startDate, endDate) {
  const ts = new Date(entry.createdAt).getTime();
  if (Number.isNaN(ts)) return false;
  if (startDate) {
    const start = new Date(startDate).getTime();
    if (Number.isNaN(start) || ts < start) return false;
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    if (Number.isNaN(end) || ts > end) return false;
  }
  return true;
}

function createStore() {
  return {
    decisions: [],
    problems: [],
    resolutions: [],
    debugLogs: [],
  };
}

function createApp() {
  const app = express();
  const store = createStore();

  app.use(express.json());

  function addDebugLog({ projectId, phase, level, type, message, entityId }) {
    const createdAt = nowIso();
    const log = {
      id: crypto.randomUUID(),
      projectId,
      phase,
      level,
      entryType: 'debug',
      type,
      message,
      entityId,
      createdAt,
      updatedAt: createdAt,
    };
    store.debugLogs.push(log);
    return log;
  }

  // Backward-compatible endpoint used by existing tests
  app.post('/api/decisions', (req, res) => {
    const { projectId, title, rationale } = req.body || {};
    if (!projectId || !title || !rationale) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'projectId, title, rationale required' } });
    }

    const createdAt = nowIso();
    const decision = {
      id: crypto.randomUUID(),
      projectId,
      phase: 'unspecified',
      context: title,
      reasoning: rationale,
      outcome: title,
      title,
      rationale,
      entryType: 'decision',
      createdAt,
      updatedAt: createdAt,
    };
    store.decisions.push(decision);
    addDebugLog({ projectId, phase: 'unspecified', level: 'info', type: 'decision', message: `Decision created: ${title}`, entityId: decision.id });
    return res.status(201).json(decision);
  });

  // Backward-compatible endpoint used by existing tests
  app.post('/api/problems', (req, res) => {
    const { projectId, summary, severity } = req.body || {};
    if (!projectId || !summary || !severity) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'projectId, summary, severity required' } });
    }

    const createdAt = nowIso();
    const problem = {
      id: crypto.randomUUID(),
      projectId,
      phase: 'unspecified',
      title: summary,
      description: summary,
      summary,
      severity,
      status: 'open',
      attemptedResolutions: [],
      resolutionIds: [],
      entryType: 'problem',
      createdAt,
      updatedAt: createdAt,
    };
    store.problems.push(problem);
    addDebugLog({ projectId, phase: 'unspecified', level: 'warn', type: 'problem', message: `Problem created: ${summary}`, entityId: problem.id });
    return res.status(201).json(problem);
  });

  // Backward-compatible endpoint used by existing tests
  app.patch('/api/problems/:id', (req, res) => {
    const problem = store.problems.find((p) => p.id === req.params.id);
    if (!problem) return res.status(404).json({ error: { code: 'NOT_FOUND' } });

    const { status, resolution } = req.body || {};
    if (status) problem.status = status;
    if (resolution) {
      problem.resolution = resolution;
      problem.attemptedResolutions.push(resolution);
    }
    problem.updatedAt = nowIso();

    addDebugLog({
      projectId: problem.projectId,
      phase: problem.phase,
      level: 'info',
      type: 'problem',
      message: `Problem updated: ${problem.id}`,
      entityId: problem.id,
    });

    return res.status(200).json(problem);
  });

  // Backward-compatible timeline endpoint used by existing tests
  app.get('/api/projects/:id/timeline', (req, res) => {
    const projectId = req.params.id;
    const events = [
      ...store.decisions.filter((d) => d.projectId === projectId).map((d) => ({ ...d, type: 'decision' })),
      ...store.problems.filter((p) => p.projectId === projectId).map((p) => ({ ...p, type: 'problem' })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.json({ projectId, events });
  });

  app.post('/api/projects/:id/decisions', (req, res) => {
    const { phase, context, reasoning, outcome } = req.body || {};
    if (![phase, context, reasoning, outcome].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'phase, context, reasoning, outcome are required' });
    }

    const createdAt = nowIso();
    const decision = {
      id: crypto.randomUUID(),
      projectId: req.params.id,
      phase,
      context,
      reasoning,
      outcome,
      entryType: 'decision',
      level: 'info',
      createdAt,
      updatedAt: createdAt,
    };
    store.decisions.push(decision);
    addDebugLog({
      projectId: req.params.id,
      phase,
      level: 'info',
      type: 'decision',
      message: `Decision recorded: ${context}`,
      entityId: decision.id,
    });

    return res.status(201).json({ decision });
  });

  app.post('/api/projects/:id/problems', (req, res) => {
    const { phase, title, description, attemptedResolutions } = req.body || {};
    if (![phase, title, description].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'phase, title, description are required' });
    }

    if (attemptedResolutions && !Array.isArray(attemptedResolutions)) {
      return res.status(400).json({ error: 'attemptedResolutions must be an array of strings' });
    }

    const createdAt = nowIso();
    const problem = {
      id: crypto.randomUUID(),
      projectId: req.params.id,
      phase,
      title,
      description,
      attemptedResolutions: attemptedResolutions || [],
      resolutionIds: [],
      entryType: 'problem',
      level: 'warn',
      createdAt,
      updatedAt: createdAt,
    };
    store.problems.push(problem);
    addDebugLog({
      projectId: req.params.id,
      phase,
      level: 'warn',
      type: 'problem',
      message: `Problem recorded: ${title}`,
      entityId: problem.id,
    });

    return res.status(201).json({ problem });
  });

  app.post('/api/problems/:id/resolutions', (req, res) => {
    const problem = store.problems.find((p) => p.id === req.params.id);
    if (!problem) return res.status(404).json({ error: 'problem not found' });

    const { phase, description, outcome = 'attempted' } = req.body || {};
    if (![phase, description].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'phase and description are required' });
    }

    const createdAt = nowIso();
    const resolution = {
      id: crypto.randomUUID(),
      problemId: problem.id,
      projectId: problem.projectId,
      phase,
      description,
      outcome,
      entryType: 'resolution',
      level: 'info',
      createdAt,
      updatedAt: createdAt,
    };
    store.resolutions.push(resolution);
    problem.resolutionIds.push(resolution.id);
    problem.attemptedResolutions.push(description);
    problem.updatedAt = nowIso();

    addDebugLog({
      projectId: problem.projectId,
      phase,
      level: 'info',
      type: 'resolution',
      message: `Resolution attempted for problem ${problem.id}`,
      entityId: resolution.id,
    });

    return res.status(201).json({ resolution, problem });
  });

  app.get('/api/projects/:id/debug-logs', (req, res) => {
    const { q, phase, type, level, startDate, endDate } = req.query;
    const projectId = req.params.id;

    let entries = [
      ...store.decisions.filter((d) => d.projectId === projectId),
      ...store.problems.filter((p) => p.projectId === projectId),
      ...store.resolutions.filter((r) => r.projectId === projectId),
    ];

    if (phase) entries = entries.filter((e) => e.phase === phase);
    if (type) entries = entries.filter((e) => e.entryType === type);
    if (level) entries = entries.filter((e) => e.level === level);
    if (startDate || endDate) entries = entries.filter((e) => inDateRange(e, startDate, endDate));
    if (q) entries = entries.filter((e) => textMatches(e, q));

    entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.json({
      projectId,
      filters: { q, phase, type, level, startDate, endDate },
      total: entries.length,
      entries,
    });
  });

  return app;
}

module.exports = { createApp };
