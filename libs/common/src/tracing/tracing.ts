import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

/**
 * Khởi tạo OpenTelemetry Tracing SDK.
 */
export function initTracing(serviceName: string): NodeSDK {
  // Debug log để verify
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

  const exporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
  });

  const sdk = new NodeSDK({
    resource: new (Resource as any)({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: exporter as any,
    // SỬ DỤNG CONTEXT MANAGER NÀY ĐỂ LIÊN KẾT REDIS VÀO HTTP REQUEST
    contextManager: new AsyncLocalStorageContextManager(),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation() as any,
      new NestInstrumentation() as any,
      new AmqplibInstrumentation() as any,
      new IORedisInstrumentation({
        requireParentSpan: true,
        dbStatementSerializer: (cmdName, args) => `${cmdName} ${args.join(' ')}`,
      } as any),
      new PgInstrumentation() as any,
      new PrismaInstrumentation(),
    ],
  });

  sdk.start();

  const shutdown = async () => {
    try {
      await sdk.shutdown();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  console.log(`[Tracing] Service: ${serviceName} is tracing to ${otlpEndpoint}`);

  return sdk;
}
