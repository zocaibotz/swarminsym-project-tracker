const request = require('supertest');
const { app } = require('../src/app');
const repo = require('../src/projects.repository');

describe('Projects CRUD API', () => {
  beforeEach(() => {
    repo.reset();
  });
  test('POST /api/projects creates project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Project A', status: 'planned', description: 'desc' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'Project A',
      status: 'planned',
      description: 'desc',
      deletedAt: null
    });
  });

  test('POST /api/projects rejects invalid payload', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: '', status: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  test('GET /api/projects returns pagination metadata', async () => {
    await request(app).post('/api/projects').send({ name: 'P1', status: 'active' });
    await request(app).post('/api/projects').send({ name: 'P2', status: 'active' });

    const res = await request(app).get('/api/projects?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({
      total: expect.any(Number),
      page: 1,
      limit: 1
    });
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /api/projects/:id returns single project', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ name: 'FindMe', status: 'active' });

    const res = await request(app).get(`/api/projects/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  test('GET /api/projects/:id returns 404 for missing', async () => {
    const res = await request(app).get('/api/projects/non-existent-id');
    expect(res.status).toBe(404);
  });

  test('PUT /api/projects/:id updates project', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ name: 'Old Name', status: 'planned' });

    const res = await request(app)
      .put(`/api/projects/${created.body.id}`)
      .send({ name: 'New Name', status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.status).toBe('completed');
  });

  test('PUT /api/projects/:id rejects invalid payload', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ name: 'Update Me', status: 'planned' });

    const res = await request(app)
      .put(`/api/projects/${created.body.id}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  test('DELETE /api/projects/:id soft deletes project', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ name: 'Delete Me', status: 'active' });

    const del = await request(app).delete(`/api/projects/${created.body.id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/projects/${created.body.id}`);
    expect(get.status).toBe(404);
  });

  test('DELETE /api/projects/:id returns 404 for missing', async () => {
    const res = await request(app).delete('/api/projects/non-existent-id');
    expect(res.status).toBe(404);
  });
});
