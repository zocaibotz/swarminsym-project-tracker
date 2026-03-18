import type { NextFunction, Request, Response } from 'express';
import { context, trace } from '@opentelemetry/api';
import logger from '@/lib/logger';
import { startRequestSpan } from '@/lib/tracing';

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const span = startRequestSpan(`${req.method} ${req.path}`);
  const traceId = span.spanContext().traceId;

  (req as Request & { traceId?: string }).traceId = traceId;
  res.setHeader('x-trace-id', traceId);

  const ctx = trace.setSpan(context.active(), span);

  logger.info({
    event: 'request.start',
    method: req.method,
    path: req.path,
    traceId,
    requestId: req.headers['x-request-id']
  });

  res.on('finish', () => {
    logger.info({
      event: 'request.end',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      traceId,
      durationMs: Number(res.getHeader('x-response-time-ms') || 0)
    });
    span.end();
  });

  context.with(ctx, next);
}
