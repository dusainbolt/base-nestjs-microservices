import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter cho API Gateway.
 * Chuẩn hóa mọi phản hồi lỗi thành một format thống nhất:
 *
 * {
 *   statusCode: number,
 *   error: string,           // HTTP error name (Bad Request, Not Found, ...)
 *   message: string | string[],
 *   timestamp: string,
 *   path: string,
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, any>;
        message = res.message || exception.message;
        error = res.error || this.getErrorName(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    error = error || this.getErrorName(status);

    const body = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    // Log lỗi 5xx chi tiết hơn
    if (status >= 500) {
      this.logger.error(
        `[${request?.method}] ${request?.url} → ${status}`,
        exception instanceof Error ? exception.stack : JSON.stringify(body),
      );
    } else {
      this.logger.warn(
        `[${request?.method}] ${request?.url} → ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(body);
  }

  private getErrorName(status: number): string {
    const names: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return names[status] || 'Error';
  }
}
