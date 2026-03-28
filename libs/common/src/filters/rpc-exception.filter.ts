import { ArgumentsHost, Catch, Injectable } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

/**
 * RpcExceptionFilter — Đặt trực tiếp lên Controller qua @UseFilters()
 *
 * Vì SERVICE_NAME không được export ra khỏi LoggerModule,
 * filter này KHÔNG dùng @Inject('SERVICE_NAME').
 * Thay vào đó dùng factory provider trong module của mỗi service:
 *
 *   {
 *     provide: RpcExceptionFilter,
 *     useFactory: (logger: LoggerService) =>
 *       new RpcExceptionFilter('user-service', logger),
 *     inject: [LoggerService],
 *   }
 *
 * Trên controller:
 *   @UseFilters(RpcExceptionFilter)
 */
@Catch()
@Injectable()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  constructor(
    private readonly serviceName: string,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  catch(exception: any, host: ArgumentsHost): Observable<never> {
    const message: string = exception?.message || 'Unknown error';
    const stack: string = exception?.stack || '';
    const name: string = exception?.name || 'Error';

    try {
      this.logger.error(
        `${name}: ${message}`,
        {
          errorCode: 'RPC_HANDLER_ERROR',
          errorName: name,
          originService: this.serviceName,
        },
        stack,
      );
    } catch {
      console.error(`[RpcExceptionFilter][${this.serviceName}] ${name}: ${message}\n${stack}`);
    }

    return throwError(() => exception);
  }
}
