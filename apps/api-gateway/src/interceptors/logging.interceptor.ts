import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { LoggerService } from '@app/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const traceId = (request.headers['x-trace-id'] as string) || uuidv4();
    request.headers['x-trace-id'] = traceId;

    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    // Store request metadata in CLS so AllExceptionsFilter can compute latency
    this.cls.set('_requestStart', now);
    this.cls.set('_requestMethod', method);
    this.cls.set('_requestUrl', url);
    this.cls.set('_requestIp', ip);

    return next.handle().pipe(
      tap(() => {
        const latencyMs = Date.now() - now;
        const statusCode = response.statusCode;
        this.logger.http(`HTTP ${method} ${url} ${statusCode}`, {
          method,
          url,
          statusCode,
          latencyMs,
          ip,
          userId: (request as any).user?.id || 'anonymous',
          inputPayload: {
            body: request.body ?? {},
            query: request.query ?? {},
            params: request.params ?? {},
          },
        });
      }),
    );
  }
}
