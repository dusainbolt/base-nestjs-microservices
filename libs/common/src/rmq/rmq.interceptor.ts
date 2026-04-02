import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class RmqInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RmqInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'rpc') return next.handle();

    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const channel = rmqContext.getChannelRef();
    const originalMessage = rmqContext.getMessage();
    const isRequestResponse = !!originalMessage?.properties?.replyTo;

    return next.handle().pipe(
      tap(() => {
        // Xử lý thành công -> Chủ động gửi lệnh ACK để xóa tin nhắn
        channel.ack(originalMessage);
      }),
      catchError((err) => {
        const statusCode = err instanceof HttpException ? err.getStatus() : 500;
        const message = err.message || 'Internal server error';

        this.logger.error(
          `${isRequestResponse ? 'RPC' : 'Event'} Error (${statusCode}): ${message}`,
        );

        if (statusCode >= 500) {
          // Lỗi hệ thống (500) -> Đưa về Dead Letter Queue (DLQ) để trace/retry
          // false, false -> không requeue lại queue cũ, bắt buộc đẩy đi hướng khác (DLQ)
          channel.nack(originalMessage, false, false);
        } else {
          // Lỗi nghiệp vụ (400, 401, 404...) -> ACK để xóa message, không nhét vào DLQ
          channel.ack(originalMessage);
        }

        // Trả về Object lỗi cho Gateway (nếu là RPC request thì client vẫn nhận được lỗi ngay)
        return of({
          __isRpcError: true,
          statusCode,
          message,
        });
      }),
    );
  }
}
