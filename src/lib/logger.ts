import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const isPretty = process.env.LOG_PRETTY === 'true';

const logger = pino({
  level,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    }
  },
  ...(isPretty
    ? {
        transport: {
          target: 'pino-pretty'
        }
      }
    : {})
});

export default logger;
