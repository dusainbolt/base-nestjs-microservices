import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { LoggerService } from '@app/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

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

    return next.handle().pipe(
      tap(() => {
        const latencyMs = Date.now() - now;
        const statusCode = response.statusCode;

        this.logger.http(`HTTP Request: ${method} ${url}`, {
          method,
          url,
          statusCode,
          latencyMs,
          ip,
          // Extract from JWT guard when available
          userId: (request as any).user?.id || 'anonymous',
        });
      }),
    );
  }
}
