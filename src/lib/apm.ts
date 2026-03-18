import logger from '@/lib/logger';

type APMClient = {
  active?: boolean;
  isStarted?: () => boolean;
  captureError?: (...args: unknown[]) => void;
};

let apmClient: APMClient | null = null;

export async function initAPM() {
  const enabled = (process.env.APM_ENABLED || 'false') === 'true';
  if (!enabled) {
    logger.info({ apmEnabled: false }, 'APM disabled by configuration');
    return null;
  }

  try {
    const elastic = await import('elastic-apm-node');
    apmClient = elastic.default.start({
      serviceName: process.env.APM_SERVICE_NAME || 'swarminsym-project-tracker',
      serverUrl: process.env.APM_SERVER_URL || 'http://localhost:8200',
      environment: process.env.NODE_ENV || 'development',
      captureExceptions: false,
      centralConfig: false
    }) as unknown as APMClient;

    logger.info({ apmConnected: !!apmClient }, 'APM client initialized and connected');
    return apmClient;
  } catch (error) {
    logger.error({ err: error }, 'APM initialization failed');
    return null;
  }
}

export function getAPMClient() {
  return apmClient;
}
