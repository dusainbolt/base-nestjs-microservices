import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '@app/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

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

    // Trích xuất Stack Trace thực tế từ source code
    const stackTrace = exception instanceof Error ? exception.stack : '';
    const errorCode = exception instanceof HttpException ? `HTTP_ERROR_${status}` : 'INTERNAL_RUNTIME_ERROR';

    const errorMessage = exception instanceof Error ? exception.message : 'Unknown Error';

    // Bắn thẳng Error Log lên ELK thông qua LoggerService vừa tạo
    this.logger.error(
      errorMessage,
      {
        errorCode,
        inputPayload: { body: request.body, query: request.query, params: request.params },
        path: request.url,
        method: request.method,
      },
      stackTrace, // Tự động ghi nhận dòng lỗi/file nào gây lỗi vào thuộc tính exception.stack của ELK
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
