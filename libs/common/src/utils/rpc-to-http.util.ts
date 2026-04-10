import { catchError, map, throwError, pipe } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Chuyển đổi lỗi từ Microservice (RPC) sang HttpException của NestJS.
 * Giữ lại toàn bộ chi tiết lỗi (validation errors, custom message, v.v.)
 * Dùng .pipe(rpcToHttp()) trong API Gateway controller.
 */
export function rpcToHttp() {
  return pipe(
    // Bắt các Error-shaped object được trả về từ Interceptor
    map((res: any) => {
      if (res && typeof res === 'object' && res.__isRpcError) {
        throw res;
      }
      return res;
    }),
    // Bắt các Exception thực sự được ném ra
    catchError((err: any) => {
      const status = err?.statusCode || err?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      // Reconstruct response body đầy đủ cho HttpException
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __isRpcError, statusCode: _sc, ...errorDetails } = err;

      // Nếu có message array (class-validator) hoặc object → giữ nguyên cấu trúc
      const responseBody = Object.keys(errorDetails).length
        ? { statusCode: status, ...errorDetails }
        : { statusCode: status, message: 'Internal server error' };

      return throwError(() => new HttpException(responseBody, status));
    }),
  );
}
