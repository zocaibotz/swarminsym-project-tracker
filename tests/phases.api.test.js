const request = require('supertest');
const { app, PHASE_NAMES } = require('../src/app');

describe('Phase Management API', () => {
  const projectId = 'project-1';
  let createdPhases = [];

  test('POST /api/projects/:id/phases creates all 10 default phases', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/phases`)
      .send({});

    expect(response.status).toBe(201);
    expect(response.body.projectId).toBe(projectId);
    expect(response.body.phases).toHaveLength(10);
    expect(response.body.phases.map((p) => p.name)).toEqual(PHASE_NAMES);
    expect(response.body.phases.map((p) => p.order)).toEqual([1,2,3,4,5,6,7,8,9,10]);

    createdPhases = response.body.phases;
  });

  test('GET /api/projects/:id/phases returns ordered phases', async () => {
    const response = await request(app).get(`/api/projects/${projectId}/phases`);

    expect(response.status).toBe(200);
    expect(response.body.phases).toHaveLength(10);
    expect(response.body.phases.map((p) => p.order)).toEqual([1,2,3,4,5,6,7,8,9,10]);
  });

  test('PUT /api/phases/:id updates rich text, attachments, timestamps, and order', async () => {
    const phaseId = createdPhases[0].id;
    const response = await request(app)
      .put(`/api/phases/${phaseId}`)
      .send({
        content: '<h1>Prompt</h1><p><strong>Rich</strong> text content</p>',
        attachments: [
          { name: 'brief.pdf', url: 'https://files.example/brief.pdf', mimeType: 'application/pdf', size: 12345 }
        ],
        status: 'in_progress',
        startAt: '2026-03-18T06:00:00.000Z',
        endAt: null,
        order: 2
      });

    expect(response.status).toBe(200);
    expect(response.body.phase.content).toContain('<strong>Rich</strong>');
    expect(response.body.phase.attachments).toHaveLength(1);
    expect(response.body.phase.attachments[0].name).toBe('brief.pdf');
    expect(response.body.phase.status).toBe('in_progress');
    expect(response.body.phase.startAt).toBe('2026-03-18T06:00:00.000Z');
    expect(response.body.phase.order).toBe(2);
  });

  test('GET /api/phases/:id/details returns full details', async () => {
    const phaseId = createdPhases[0].id;
    const response = await request(app).get(`/api/phases/${phaseId}/details`);

    expect(response.status).toBe(200);
    expect(response.body.phase.id).toBe(phaseId);
    expect(response.body.phase.attachments).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'brief.pdf' })])
    );
  });

  test('status transition validation rejects invalid transitions', async () => {
    const phaseId = createdPhases[0].id;

    await request(app).put(`/api/phases/${phaseId}`).send({ status: 'completed' });

    const invalid = await request(app)
      .put(`/api/phases/${phaseId}`)
      .send({ status: 'in_progress' });

    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toMatch(/Invalid status transition/);
  });

  test('POST with custom order preserves configurable ordering', async () => {
    const project2 = 'project-2';
    const customOrder = [
      'Prompt','PRD','Design','Architecture','SDD','TDD','Coding','Testing','Maintenance','Deployment'
    ];

    const response = await request(app)
      .post(`/api/projects/${project2}/phases`)
      .send({ phaseOrder: customOrder });

    expect(response.status).toBe(201);
    expect(response.body.phases.map((p) => p.name)).toEqual(customOrder);
    expect(response.body.phases[8].name).toBe('Maintenance');
    expect(response.body.phases[9].name).toBe('Deployment');

    const listed = await request(app).get(`/api/projects/${project2}/phases`);
    expect(listed.body.phases.map((p) => p.name)).toEqual(customOrder);
  });

  test('all ten phases are updateable', async () => {
    const list = await request(app).get(`/api/projects/${projectId}/phases`);
    expect(list.status).toBe(200);

    for (const phase of list.body.phases) {
      const updated = await request(app)
        .put(`/api/phases/${phase.id}`)
        .send({ content: `<p>${phase.name} updated</p>` });

      expect(updated.status).toBe(200);
      expect(updated.body.phase.content).toContain(`${phase.name} updated`);
    }
  });
});