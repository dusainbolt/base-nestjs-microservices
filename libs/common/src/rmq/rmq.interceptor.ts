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
        channel.ack(originalMessage);
      }),
      catchError((err) => {
        const statusCode = err instanceof HttpException ? err.getStatus() : 500;
        const response = err instanceof HttpException ? err.getResponse() : null;

        // Lấy chi tiết lỗi đầy đủ (validation errors, custom message, v.v.)
        const errorBody =
          typeof response === 'object' && response !== null
            ? response
            : { message: err.message || 'Internal server error' };

        this.logger.error(
          `${isRequestResponse ? 'RPC' : 'Event'} Error (${statusCode}): ${
            typeof errorBody === 'object' ? JSON.stringify(errorBody) : errorBody
          }`,
        );

        if (statusCode >= 500) {
          channel.nack(originalMessage, false, false);
        } else {
          channel.ack(originalMessage);
        }

        // Trả về full error body để Gateway có thể reconstruct chính xác
        return of({
          __isRpcError: true,
          statusCode,
          ...(typeof errorBody === 'string' ? { message: errorBody } : errorBody),
        });
      }),
    );
  }
}
