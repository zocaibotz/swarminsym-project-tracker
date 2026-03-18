import { describe, it, expect } from 'vitest';
import { bootstrapObservability } from '@/lib/observability';

describe('observability bootstrap (red)', () => {
  it('should initialize logger, tracing and apm', async () => {
    const result = await bootstrapObservability();
    expect(result.logger).toBeDefined();
    expect(result.tracer).toBeDefined();
    expect(result.apm).not.toBeUndefined();
  });
});
