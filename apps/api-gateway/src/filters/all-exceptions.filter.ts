import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { LoggerService } from '@app/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly cls: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Compute latency from CLS (set by LoggingInterceptor at request start)
    const requestStart = this.cls.get<number>('_requestStart');
    const latencyMs = requestStart != null ? Date.now() - requestStart : undefined;

    const method = request.method;
    const url = request.url;
    const ip = request.ip || 'unknown';

    // Đọc traceId từ request object (set bởi LoggingInterceptor)
    // Không dùng CLS vì filter có thể chạy ngoài CLS context
    const traceId = (request as any).__traceId;

    // Log as HTTP_API_LOG — same channel as successful requests
    this.logger.http(
      `HTTP ${method} ${url} ${status}`,
      {
        method,
        url,
        statusCode: status,
        latencyMs,
        ip,
        userId: (request as any).user?.id || 'anonymous',
        errorMessage: exception instanceof Error ? exception.message : 'Unknown Error',
        inputPayload: {
          body: request.body ?? {},
          query: request.query ?? {},
          params: request.params ?? {},
        },
        ...(status !== HttpStatus.NOT_FOUND && exception instanceof Error
          ? { errorStack: exception.stack }
          : {}),
      },
      traceId,
    );

    // Chuẩn hoá Response trả về cho client/frontend
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
