import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';
import logger from '@/lib/logger';
import { bootstrapObservability } from '@/lib/observability';
import { requestLoggingMiddleware } from '@/middleware/requestLogging';
import { errorHandler } from '@/middleware/errorHandler';

function makeReqRes() {
  const req: any = {
    method: 'GET',
    path: '/health',
    headers: { 'x-request-id': 'req-1' },
    body: { foo: 'bar' },
    params: { id: '1' },
    query: { q: 'z' }
  };

  const res: any = new EventEmitter();
  res.statusCode = 200;
  res.headers = {};
  res.setHeader = (k: string, v: string) => {
    res.headers[k.toLowerCase()] = v;
  };
  res.getHeader = (k: string) => res.headers[k.toLowerCase()];
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return { req, res };
}

describe('observability bootstrap (green)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('provides global logger + tracer and supports env log level', async () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBe(process.env.LOG_LEVEL || 'info');

    const result = await bootstrapObservability();
    expect(result.logger).toBeDefined();
    expect(result.tracer).toBeDefined();
  });

  it('attaches trace IDs to requests and responses', () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const { req, res } = makeReqRes();

    requestLoggingMiddleware(req, res, () => undefined);
    expect(req.traceId).toBeDefined();
    expect(res.headers['x-trace-id']).toBe(req.traceId);

    res.emit('finish');
    expect(infoSpy).toHaveBeenCalled();
  });

  it('logs full error context with stack traces', () => {
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const { req, res } = makeReqRes();
    req.traceId = 'abc123';

    const err = new Error('boom');
    errorHandler(err, req, res, () => undefined);

    expect(errorSpy).toHaveBeenCalled();
    const firstArg = errorSpy.mock.calls[0][0] as any;
    expect(firstArg.err.stack).toContain('Error: boom');
    expect(firstArg.context.traceId).toBe('abc123');
  });
});
