import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

/**
 * Chuyển RpcException từ microservice sang HTTP response đúng status code.
 *
 * Flow:
 *   auth-service throw HttpException (401)
 *     → RmqInterceptor bọc thành RpcException({ statusCode: 401, message })
 *       → RabbitMQ transport gửi về gateway
 *         → Filter này bắt và trả HTTP 401 cho client
 */
@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error = exception.getError();

    let statusCode: number;
    let message: string;

    if (typeof error === 'object' && error !== null) {
      statusCode =
        (error as any).statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = (error as any).message ?? 'Internal server error';
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = String(error);
    }

    this.logger.error(`RpcException → HTTP ${statusCode}: ${message}`);

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
