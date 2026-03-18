const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  DatabaseSync = null;
}

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

class MemoryStore {
  constructor() {
    this.projects = new Map();
    this.decisions = [];
    this.problems = [];
    this.resolutions = [];
  }

  ensureProject(projectId, name = null, prompt = '') {
    if (!this.projects.has(projectId)) {
      const t = nowIso();
      this.projects.set(projectId, {
        id: projectId,
        name: name || projectId,
        prompt,
        status: 'active',
        createdAt: t,
        updatedAt: t,
      });
    }
    return this.projects.get(projectId);
  }

  createProject({ name, prompt = '' }) {
    const t = nowIso();
    const id = crypto.randomUUID();
    const row = { id, name, prompt, status: 'active', createdAt: t, updatedAt: t };
    this.projects.set(id, row);
    return row;
  }

  listProjects() {
    return [...this.projects.values()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  createDecision(data) {
    this.ensureProject(data.projectId);
    const t = nowIso();
    const row = { ...data, id: crypto.randomUUID(), createdAt: t, updatedAt: t };
    this.decisions.push(row);
    this.projects.get(data.projectId).updatedAt = t;
    return row;
  }

  createProblem(data) {
    this.ensureProject(data.projectId);
    const t = nowIso();
    const row = {
      ...data,
      id: crypto.randomUUID(),
      attemptedResolutions: data.attemptedResolutions || [],
      resolutionIds: data.resolutionIds || [],
      createdAt: t,
      updatedAt: t,
    };
    this.problems.push(row);
    this.projects.get(data.projectId).updatedAt = t;
    return row;
  }

  updateProblem(problemId, patch) {
    const p = this.problems.find((x) => x.id === problemId);
    if (!p) return null;
    if (patch.status) p.status = patch.status;
    if (patch.resolution) {
      p.resolution = patch.resolution;
      p.attemptedResolutions = p.attemptedResolutions || [];
      p.attemptedResolutions.push(patch.resolution);
    }
    p.updatedAt = nowIso();
    const prj = this.projects.get(p.projectId);
    if (prj) prj.updatedAt = p.updatedAt;
    return p;
  }

  getProblem(problemId) {
    return this.problems.find((x) => x.id === problemId) || null;
  }

  createResolution(data) {
    const p = this.getProblem(data.problemId);
    if (!p) return null;
    this.ensureProject(p.projectId);
    const t = nowIso();
    const row = { ...data, id: crypto.randomUUID(), projectId: p.projectId, createdAt: t, updatedAt: t };
    this.resolutions.push(row);
    p.resolutionIds = p.resolutionIds || [];
    p.resolutionIds.push(row.id);
    p.attemptedResolutions = p.attemptedResolutions || [];
    p.attemptedResolutions.push(data.description);
    p.updatedAt = t;
    this.projects.get(p.projectId).updatedAt = t;
    return { resolution: row, problem: p };
  }

  getProjectEvents(projectId) {
    return [
      ...this.decisions.filter((d) => d.projectId === projectId),
      ...this.problems.filter((p) => p.projectId === projectId),
      ...this.resolutions.filter((r) => r.projectId === projectId),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
}

class SqliteStore {
  constructor(dbPath) {
    const abs = path.resolve(dbPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    this.db = new DatabaseSync(abs);
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        prompt TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        context TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        outcome TEXT NOT NULL,
        title TEXT,
        rationale TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS problems (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT,
        status TEXT DEFAULT 'open',
        attempted_resolutions TEXT DEFAULT '[]',
        resolution_ids TEXT DEFAULT '[]',
        resolution TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS resolutions (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        description TEXT NOT NULL,
        outcome TEXT DEFAULT 'attempted',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  ensureProject(projectId, name = null, prompt = '') {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (row) return this._projectRow(row);
    const t = nowIso();
    this.db.prepare('INSERT INTO projects (id, name, prompt, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(projectId, name || projectId, prompt || '', 'active', t, t);
    return this._projectRow(this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId));
  }

  createProject({ name, prompt = '' }) {
    const id = crypto.randomUUID();
    const t = nowIso();
    this.db.prepare('INSERT INTO projects (id, name, prompt, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, prompt, 'active', t, t);
    return this._projectRow(this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id));
  }

  listProjects() {
    return this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all().map((r) => this._projectRow(r));
  }

  createDecision(data) {
    this.ensureProject(data.projectId);
    const id = crypto.randomUUID();
    const t = nowIso();
    this.db.prepare(`INSERT INTO decisions
      (id, project_id, phase, context, reasoning, outcome, title, rationale, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, data.projectId, data.phase, data.context, data.reasoning, data.outcome, data.title || null, data.rationale || null, t, t);
    this.db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(t, data.projectId);
    return this._decisionRow(this.db.prepare('SELECT * FROM decisions WHERE id = ?').get(id));
  }

  createProblem(data) {
    this.ensureProject(data.projectId);
    const id = crypto.randomUUID();
    const t = nowIso();
    this.db.prepare(`INSERT INTO problems
      (id, project_id, phase, title, description, severity, status, attempted_resolutions, resolution_ids, resolution, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id,
        data.projectId,
        data.phase,
        data.title,
        data.description,
        data.severity || null,
        data.status || 'open',
        JSON.stringify(data.attemptedResolutions || []),
        JSON.stringify(data.resolutionIds || []),
        data.resolution || null,
        t,
        t,
      );
    this.db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(t, data.projectId);
    return this._problemRow(this.db.prepare('SELECT * FROM problems WHERE id = ?').get(id));
  }

  updateProblem(problemId, patch) {
    const row = this.db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
    if (!row) return null;
    const p = this._problemRow(row);
    if (patch.status) p.status = patch.status;
    if (patch.resolution) {
      p.resolution = patch.resolution;
      p.attemptedResolutions = p.attemptedResolutions || [];
      p.attemptedResolutions.push(patch.resolution);
    }
    p.updatedAt = nowIso();
    this.db.prepare(`UPDATE problems SET status = ?, resolution = ?, attempted_resolutions = ?, updated_at = ? WHERE id = ?`)
      .run(p.status, p.resolution || null, JSON.stringify(p.attemptedResolutions || []), p.updatedAt, p.id);
    this.db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(p.updatedAt, p.projectId);
    return p;
  }

  getProblem(problemId) {
    const row = this.db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
    return row ? this._problemRow(row) : null;
  }

  createResolution(data) {
    const p = this.getProblem(data.problemId);
    if (!p) return null;
    const id = crypto.randomUUID();
    const t = nowIso();
    this.db.prepare(`INSERT INTO resolutions
      (id, problem_id, project_id, phase, description, outcome, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, p.id, p.projectId, data.phase, data.description, data.outcome || 'attempted', t, t);

    const updatedProblem = this.updateProblem(p.id, { resolution: data.description });
    updatedProblem.resolutionIds = updatedProblem.resolutionIds || [];
    updatedProblem.resolutionIds.push(id);
    this.db.prepare('UPDATE problems SET resolution_ids = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(updatedProblem.resolutionIds), nowIso(), p.id);

    const resolution = this._resolutionRow(this.db.prepare('SELECT * FROM resolutions WHERE id = ?').get(id));
    return { resolution, problem: this.getProblem(p.id) };
  }

  getProjectEvents(projectId) {
    const decisions = this.db.prepare('SELECT * FROM decisions WHERE project_id = ?').all(projectId).map((r) => this._decisionRow(r));
    const problems = this.db.prepare('SELECT * FROM problems WHERE project_id = ?').all(projectId).map((r) => this._problemRow(r));
    const resolutions = this.db.prepare('SELECT * FROM resolutions WHERE project_id = ?').all(projectId).map((r) => this._resolutionRow(r));
    return [...decisions, ...problems, ...resolutions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  _projectRow(r) {
    return { id: r.id, name: r.name, prompt: r.prompt, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at };
  }
  _decisionRow(r) {
    return {
      id: r.id,
      projectId: r.project_id,
      phase: r.phase,
      context: r.context,
      reasoning: r.reasoning,
      outcome: r.outcome,
      title: r.title || r.context,
      rationale: r.rationale || r.reasoning,
      entryType: 'decision',
      level: 'info',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
  _problemRow(r) {
    return {
      id: r.id,
      projectId: r.project_id,
      phase: r.phase,
      title: r.title,
      description: r.description,
      summary: r.title,
      severity: r.severity,
      status: r.status,
      attemptedResolutions: JSON.parse(r.attempted_resolutions || '[]'),
      resolutionIds: JSON.parse(r.resolution_ids || '[]'),
      resolution: r.resolution,
      entryType: 'problem',
      level: 'warn',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
  _resolutionRow(r) {
    return {
      id: r.id,
      problemId: r.problem_id,
      projectId: r.project_id,
      phase: r.phase,
      description: r.description,
      outcome: r.outcome,
      entryType: 'resolution',
      level: 'info',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}

function createStore() {
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'tracker.db');
  const wantSqlite = process.env.TRACKER_DB !== 'memory' && process.env.NODE_ENV !== 'test';
  if (wantSqlite && DatabaseSync) return new SqliteStore(dbPath);
  return new MemoryStore();
}

function createApp() {
  const app = express();
  const store = createStore();

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.post('/api/projects', (req, res) => {
    const { name, prompt = '' } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name is required' } });
    }
    const project = store.createProject({ name: String(name).trim(), prompt: String(prompt || '') });
    return res.status(201).json({ project });
  });

  app.get('/api/projects', (_req, res) => {
    const projects = store.listProjects();
    return res.json({ total: projects.length, projects });
  });

  function addDebugLog() {
    // debug logs are derived from events in this implementation
    return null;
  }

  app.post('/api/decisions', (req, res) => {
    const { projectId, title, rationale } = req.body || {};
    if (!projectId || !title || !rationale) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'projectId, title, rationale required' } });
    }

    const decision = store.createDecision({
      projectId,
      phase: 'unspecified',
      context: title,
      reasoning: rationale,
      outcome: title,
      title,
      rationale,
    });
    addDebugLog({});
    return res.status(201).json(decision);
  });

  app.post('/api/problems', (req, res) => {
    const { projectId, summary, severity } = req.body || {};
    if (!projectId || !summary || !severity) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'projectId, summary, severity required' } });
    }

    const problem = store.createProblem({
      projectId,
      phase: 'unspecified',
      title: summary,
      description: summary,
      summary,
      severity,
      status: 'open',
      attemptedResolutions: [],
      resolutionIds: [],
    });
    addDebugLog({});
    return res.status(201).json(problem);
  });

  app.patch('/api/problems/:id', (req, res) => {
    const problem = store.updateProblem(req.params.id, req.body || {});
    if (!problem) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    return res.status(200).json(problem);
  });

  app.get('/api/projects/:id/timeline', (req, res) => {
    const projectId = req.params.id;
    const events = store.getProjectEvents(projectId).map((e) => {
      if (e.entryType === 'decision') return { ...e, type: 'decision' };
      if (e.entryType === 'problem') return { ...e, type: 'problem' };
      return { ...e, type: 'resolution' };
    });
    return res.json({ projectId, events });
  });

  app.post('/api/projects/:id/decisions', (req, res) => {
    const { phase, context, reasoning, outcome } = req.body || {};
    if (![phase, context, reasoning, outcome].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'phase, context, reasoning, outcome are required' });
    }

    const decision = store.createDecision({ projectId: req.params.id, phase, context, reasoning, outcome });
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

    const problem = store.createProblem({
      projectId: req.params.id,
      phase,
      title,
      description,
      attemptedResolutions: attemptedResolutions || [],
      resolutionIds: [],
    });

    return res.status(201).json({ problem });
  });

  app.post('/api/problems/:id/resolutions', (req, res) => {
    const { phase, description, outcome = 'attempted' } = req.body || {};
    if (![phase, description].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'phase and description are required' });
    }

    const payload = store.createResolution({ problemId: req.params.id, phase, description, outcome });
    if (!payload) return res.status(404).json({ error: 'problem not found' });

    return res.status(201).json(payload);
  });

  app.get('/api/projects/:id/debug-logs', (req, res) => {
    const { q, phase, type, level, startDate, endDate } = req.query;
    const projectId = req.params.id;

    let entries = store.getProjectEvents(projectId);

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