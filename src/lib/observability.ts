import logger from '@/lib/logger';
import { tracer } from '@/lib/tracing';
import { initAPM } from '@/lib/apm';

export async function bootstrapObservability() {
  const apm = await initAPM();

  logger.info({
    observability: {
      logger: true,
      tracing: true,
      apm: !!apm
    }
  }, 'Observability initialized');

  return {
    logger,
    tracer,
    apm
  };
}
