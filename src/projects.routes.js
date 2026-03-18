const express = require('express');
const { createProjectSchema, updateProjectSchema } = require('./projects.schemas');
const repo = require('./projects.repository');

const router = express.Router();

function validationError(res, error) {
  return res.status(400).json({
    error: 'Validation failed',
    details: error.issues?.map((i) => ({ path: i.path, message: i.message })) || []
  });
}

router.post('/projects', (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const project = repo.create(parsed.data);
  return res.status(201).json(project);
});

router.get('/projects', (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ error: 'Validation failed', details: [{ message: 'page and limit must be positive integers' }] });
  }

  const { data, total } = repo.list(page, limit);
  return res.status(200).json({
    data,
    meta: { total, page, limit }
  });
});

router.get('/projects/:id', (req, res) => {
  const project = repo.getById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  return res.status(200).json(project);
});

router.put('/projects/:id', (req, res) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const updated = repo.update(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: 'Project not found' });

  return res.status(200).json(updated);
});

router.delete('/projects/:id', (req, res) => {
  const deleted = repo.softDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Project not found' });

  return res.status(204).send();
});

module.exports = router;
