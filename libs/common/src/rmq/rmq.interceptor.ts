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

        // Lỗi xảy ra nhưng đã bắt được -> Vẫn phải ACK để không bị kẹt ở trạng thái Unacked
        channel.ack(originalMessage);

        // Trả về Object lỗi cho Gateway
        return of({
          __isRpcError: true,
          statusCode,
          message,
        });
      }),
    );
  }
}
