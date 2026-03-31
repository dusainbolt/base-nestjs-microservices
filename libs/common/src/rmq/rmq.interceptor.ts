import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RmqService } from './rmq.service';

@Injectable()
export class RmqInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RmqInterceptor.name);

  constructor(private readonly rmqService: RmqService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();

    // Nếu không phải RMQ request thì bỏ qua
    if (!rmqContext || typeof rmqContext.getArgByIndex !== 'function') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Nếu thành công -> Tự động ACK
        this.rmqService.ack(rmqContext);
      }),
      catchError((err) => {
        // Nếu thất bại -> Gọi logic retry
        this.logger.error(`Error processing RMQ message: ${err.message}`);
        this.handleRetry(rmqContext, err);
        return of(null); // Trả về null để không crash gateway (nếu là request-response)
      }),
    );
  }

  private handleRetry(context: RmqContext, error: any) {
    const message = context.getMessage();
    const headers = message.properties.headers || {};
    const retryCount = (headers['x-retry-count'] || 0) + 1;

    // Retry 3 lần
    if (retryCount <= 3) {
      this.rmqService.retry(context, retryCount);
    } else {
      // Quá 3 lần -> Chuyển vào DLQ
      this.logger.warn(`Max retries reached. Moving to DLQ.`);
      this.rmqService.moveToDlq(context, error);
    }
  }
}
