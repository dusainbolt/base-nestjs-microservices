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

    const method = this.cls.get<string>('_requestMethod') || request.method;
    const url = this.cls.get<string>('_requestUrl') || request.url;
    const ip = this.cls.get<string>('_requestIp') || request.ip || 'unknown';

    // Log as HTTP_API_LOG — same channel as successful requests
    this.logger.http(
      `HTTP Error: ${method} ${url} ${status}`,
      {
        method,
        url,
        statusCode: status,
        latencyMs,
        ip,
        userId: (request as any).user?.id || 'anonymous',
        errorMessage: exception instanceof Error ? exception.message : 'Unknown Error',
        ...(status !== HttpStatus.NOT_FOUND && exception instanceof Error
          ? { errorStack: exception.stack }
          : {}),
      },
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
