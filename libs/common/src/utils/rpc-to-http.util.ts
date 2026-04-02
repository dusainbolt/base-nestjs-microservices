import { catchError, map, throwError, pipe } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Chuyển đổi lỗi từ Microservice (RPC) sang HttpException của NestJS.
 * Dùng .pipe(rpcToHttp()) trong API Gateway controller.
 */
export function rpcToHttp() {
  return pipe(
    // Bắt các Error-shaped object được trả về từ Interceptor (để tránh double-ack crash)
    map((res: any) => {
      if (res && typeof res === 'object' && res.__isRpcError) {
        throw res;
      }
      return res;
    }),
    // Bắt các Exception thực sự được ném ra
    catchError((err: any) => {
      const status = err?.statusCode || err?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = err?.message || 'Internal server error';
      return throwError(() => new HttpException(message, status));
    }),
  );
}
