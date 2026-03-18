import type { NextFunction, Request, Response } from 'express';
import logger from '@/lib/logger';
import { getAPMClient } from '@/lib/apm';

type ErrorContext = {
  requestId?: string;
  traceId?: string;
  path: string;
  method: string;
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction) {
  const context: ErrorContext = {
    requestId: String(req.headers['x-request-id'] || ''),
    traceId: (req as Request & { traceId?: string }).traceId,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  };

  logger.error(
    {
      err: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      context
    },
    'Unhandled application error'
  );

  const apm = getAPMClient();
  apm?.captureError?.(error, { custom: context });

  res.status(500).json({
    error: 'Internal Server Error',
    traceId: context.traceId
  });
}
