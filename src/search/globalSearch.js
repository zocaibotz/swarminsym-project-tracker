function createRecord(entityType, projectId, id, text, title) {
  return {
    id,
    entityType,
    projectId,
    title,
    normalized: `${title} ${text}`.toLowerCase()
  };
}

export function buildSearchIndex(data) {
  const records = [];

  for (const project of data.projects ?? []) {
    records.push(createRecord('project', project.id, project.id, project.name ?? '', project.name ?? ''));

    for (const phase of project.phases ?? []) {
      records.push(createRecord('phase', project.id, phase.id, phase.title ?? '', phase.title ?? ''));
    }

    for (const decision of project.decisions ?? []) {
      records.push(createRecord('decision', project.id, decision.id, decision.title ?? '', decision.title ?? ''));
    }

    for (const problem of project.problems ?? []) {
      records.push(createRecord('problem', project.id, problem.id, problem.title ?? '', problem.title ?? ''));
    }
  }

  return records;
}

export function globalSearch(index, rawQuery, { limit = 20 } = {}) {
  const start = performance.now();
  const query = (rawQuery ?? '').trim().toLowerCase();

  if (!query) {
    return { elapsedMs: 0, results: [] };
  }

  const results = [];
  for (const record of index) {
    if (record.normalized.includes(query)) {
      results.push(record);
      if (results.length >= limit) break;
    }
  }

  const elapsedMs = performance.now() - start;
  return { elapsedMs, results };
}
