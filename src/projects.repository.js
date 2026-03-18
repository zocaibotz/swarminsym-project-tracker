const { randomUUID } = require('crypto');

const projects = new Map();

function create(data) {
  const now = new Date().toISOString();
  const project = {
    id: randomUUID(),
    name: data.name,
    description: data.description,
    status: data.status,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };

  projects.set(project.id, project);
  return project;
}

function list(page, limit) {
  const active = [...projects.values()].filter((p) => p.deletedAt === null);
  const total = active.length;
  const start = (page - 1) * limit;
  const data = active.slice(start, start + limit);
  return { data, total };
}

function getById(id) {
  const project = projects.get(id);
  if (!project || project.deletedAt !== null) return null;
  return project;
}

function update(id, changes) {
  const existing = getById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...changes,
    updatedAt: new Date().toISOString()
  };

  projects.set(id, updated);
  return updated;
}

function softDelete(id) {
  const existing = getById(id);
  if (!existing) return null;

  const deleted = {
    ...existing,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.set(id, deleted);
  return deleted;
}

function reset() {
  projects.clear();
}

module.exports = {
  create,
  list,
  getById,
  update,
  softDelete,
  reset
};
