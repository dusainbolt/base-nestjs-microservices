import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { LOG_SERVICE } from '../constants/services.constants';
import { LOG_EVENTS } from '../constants/log.constants';
import {
  StandardLogPayload,
  LogType,
  LogContextVariant,
  HttpLogContext,
  BusinessLogContext,
  AuthLogContext,
  SystemLogContext,
  ErrorLogContext,
} from '../interfaces/log.interface';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(LOG_SERVICE) private readonly logClient: ClientProxy,
    @Inject('SERVICE_NAME') private readonly serviceName: string,
    private readonly cls: ClsService,
  ) {}

  private getTraceId(): string {
    // HTTP context  : cls.getId() → traceId từ x-trace-id header
    // RMQ context   : cls.get('_traceId') → traceId propagate từ gateway qua payload
    // Fallback      : sys-timestamp nếu không có context nào
    // RMQ context: ưu tiên _traceId propagate từ gateway qua payload
    // HTTP context: cls.getId() → traceId từ x-trace-id header
    return (
      this.cls.get<string>('_traceId') ||
      this.cls.getId() ||
      `sys-${Date.now()}`
    );
  }

  private emitLog(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    logType: LogType,
    context?: LogContextVariant,
    exception?: { stack: string },
    traceId?: string,
  ) {
    const payload: StandardLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      traceId: traceId ?? this.getTraceId(),
      message,
      logType,
      context,
      exception,
    };
    this.logClient.emit(LOG_EVENTS.SYSTEM_LOG, payload);
  }

  http(message: string, context: HttpLogContext, traceId?: string) {
    this.emitLog('info', message, LogType.HTTP, context, undefined, traceId);
  }

  business(message: string, context: BusinessLogContext) {
    this.emitLog('info', message, LogType.BUSINESS, context);
  }

  auth(
    level: 'info' | 'warn' | 'error',
    message: string,
    context: AuthLogContext,
  ) {
    this.emitLog(level, message, LogType.AUTH, context);
  }

  system(
    level: 'info' | 'warn' | 'error',
    message: string,
    context: SystemLogContext,
  ) {
    this.emitLog(level, message, LogType.SYSTEM, context);
  }

  error(
    message: string,
    context: ErrorLogContext,
    stack?: string,
    level: 'error' | 'warn' = 'error',
  ) {
    this.emitLog(
      level,
      message,
      LogType.ERROR,
      context,
      stack ? { stack } : undefined,
    );
  }
}
