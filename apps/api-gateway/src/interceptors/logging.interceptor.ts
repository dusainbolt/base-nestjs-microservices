import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

    // Dùng cls.getId() — cùng source với withTrace() trong controller
    // ClsModule middleware đã generate UUID cho mỗi request
    const traceId = (request.headers['x-trace-id'] as string) || this.cls.getId();

    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    // Lưu traceId vào CLS + request object
    // CLS: cho withTrace() và các service call trong request
    // request object: cho AllExceptionsFilter khi CLS context có thể bị mất
    this.cls.set('_traceId', traceId);
    this.cls.set('_requestStart', now);
    (request as any).__traceId = traceId;

    return next.handle().pipe(
      tap(() => {
        const latencyMs = Date.now() - now;
        const statusCode = response.statusCode;

        // Truyền traceId qua closure — không đọc lại từ CLS
        // vì tap() chạy async có thể mất CLS context
        this.logger.http(
          `HTTP ${method} ${url} ${statusCode}`,
          {
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
          },
          traceId, // explicit traceId — không phụ thuộc CLS
        );
      }),
    );
  }
}
