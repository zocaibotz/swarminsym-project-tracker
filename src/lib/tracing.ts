import { context, trace, ROOT_CONTEXT, SpanStatusCode } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

const serviceName = process.env.OTEL_SERVICE_NAME || 'swarminsym-project-tracker';
const exporter = new InMemorySpanExporter();

const provider = new NodeTracerProvider({
  resource: new Resource({
    'service.name': serviceName,
    'service.version': process.env.npm_package_version || '0.0.0'
  })
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

export const tracer = trace.getTracer('app-tracer', '1.0.0');

export function startRequestSpan(name: string) {
  return tracer.startSpan(name, undefined, ROOT_CONTEXT);
}

export function getTraceId(): string | undefined {
  const span = trace.getSpan(context.active());
  return span?.spanContext().traceId;
}

export function endSpanWithError(span: ReturnType<typeof startRequestSpan>, error?: Error) {
  if (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  }
  span.end();
}

export function getInMemorySpans() {
  return exporter.getFinishedSpans();
}
