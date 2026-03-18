const request = require('supertest');
const { createApp } = require('../src/app');

describe('ZOC-91 Decisions & Problems API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('POST /api/projects/:id/decisions creates decision with required reasoning fields', async () => {
    const res = await request(app)
      .post('/api/projects/p1/decisions')
      .send({
        phase: 'design',
        context: 'Need cache strategy',
        reasoning: 'Read-heavy access pattern',
        outcome: 'Adopt Redis LRU',
      })
      .expect(201);

    expect(res.body.decision).toMatchObject({
      projectId: 'p1',
      phase: 'design',
      context: 'Need cache strategy',
      reasoning: 'Read-heavy access pattern',
      outcome: 'Adopt Redis LRU',
      entryType: 'decision',
    });
  });

  test('POST /api/projects/:id/problems creates problem and links attempted resolutions', async () => {
    const res = await request(app)
      .post('/api/projects/p1/problems')
      .send({
        phase: 'build',
        title: 'Intermittent timeout',
        description: 'API times out under load',
        attemptedResolutions: ['increase timeout', 'reduce payload size'],
      })
      .expect(201);

    expect(res.body.problem).toMatchObject({
      projectId: 'p1',
      phase: 'build',
      title: 'Intermittent timeout',
      description: 'API times out under load',
      attemptedResolutions: ['increase timeout', 'reduce payload size'],
      entryType: 'problem',
    });
    expect(res.body.problem.resolutionIds).toEqual([]);
  });

  test('POST /api/problems/:id/resolutions attaches resolution to problem', async () => {
    const problemRes = await request(app)
      .post('/api/projects/p1/problems')
      .send({
        phase: 'build',
        title: 'Queue backlog',
        description: 'Workers not draining quickly enough',
      })
      .expect(201);

    const problemId = problemRes.body.problem.id;

    const resolutionRes = await request(app)
      .post(`/api/problems/${problemId}/resolutions`)
      .send({
        phase: 'build',
        description: 'Scaled workers from 5 to 12',
        outcome: 'improved',
      })
      .expect(201);

    expect(resolutionRes.body.resolution).toMatchObject({
      problemId,
      phase: 'build',
      description: 'Scaled workers from 5 to 12',
      outcome: 'improved',
      entryType: 'resolution',
    });

    const logsRes = await request(app)
      .get('/api/projects/p1/debug-logs?type=resolution')
      .expect(200);

    expect(logsRes.body.entries.some((e) => e.entryType === 'resolution' && e.problemId === problemId)).toBe(true);
  });

  test('GET /api/projects/:id/debug-logs supports level/type/phase/date/full-text filters', async () => {
    await request(app)
      .post('/api/projects/p1/decisions')
      .send({
        phase: 'design',
        context: 'Need observability',
        reasoning: 'Cannot trace failures',
        outcome: 'Add structured logs',
      })
      .expect(201);

    await request(app)
      .post('/api/projects/p1/problems')
      .send({
        phase: 'build',
        title: 'Null pointer in parser',
        description: 'Crash when token list is empty',
      })
      .expect(201);

    const phaseRes = await request(app)
      .get('/api/projects/p1/debug-logs?phase=design&type=decision&q=observability')
      .expect(200);

    expect(phaseRes.body.total).toBeGreaterThan(0);
    expect(phaseRes.body.entries.every((e) => e.phase === 'design')).toBe(true);
    expect(phaseRes.body.entries.every((e) => e.entryType === 'decision')).toBe(true);

    const levelRes = await request(app)
      .get('/api/projects/p1/debug-logs?level=warn')
      .expect(200);

    expect(levelRes.body.entries.length).toBeGreaterThan(0);
    expect(levelRes.body.entries.every((e) => e.level === 'warn')).toBe(true);

    const from = new Date(Date.now() - 60_000).toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();
    const dateRes = await request(app)
      .get(`/api/projects/p1/debug-logs?startDate=${encodeURIComponent(from)}&endDate=${encodeURIComponent(to)}`)
      .expect(200);

    expect(dateRes.body.total).toBeGreaterThan(0);
  });
});
