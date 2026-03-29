import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import {
  RmqService,
  USER_COMMANDS,
  PingUserPayload,
  PingUserResponse,
  WelcomeUserPayload,
  WelcomeUserResponse,
  LoggerService,
} from '@app/common';
import { UserServiceService } from './user-service.service';

/** Mọi RMQ payload đều có thể kèm _traceId từ gateway */
type WithTrace<T> = T & { _traceId?: string };

@Controller()
export class UserServiceController {
  constructor(
    private readonly userServiceService: UserServiceService,
    private readonly rmqService: RmqService,
    private readonly logger: LoggerService,
    private readonly cls: ClsService,
  ) {}

  /**
   * Wrapper dùng chung cho mọi @MessagePattern handler:
   * 1. Ack message
   * 2. Tạo CLS context mới → set _traceId từ payload (propagate từ gateway)
   * 3. Log rpc_handler_start / rpc_handler_end với durationMs
   * 4. Catch lỗi + log đầy đủ nếu throw
   */
  private wrapHandler<T>(
    context: RmqContext,
    data: WithTrace<any>,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    this.rmqService.ack(context);

    // Lấy cmd từ pattern để log rõ handler nào đang chạy
    const rawPattern: any = context.getPattern();
    const cmd: string =
      typeof rawPattern === 'string'
        ? (JSON.parse(rawPattern)?.cmd ?? rawPattern)
        : (rawPattern?.cmd ?? 'unknown');

    return this.cls.run(async () => {
      if (data?._traceId) {
        this.cls.set('_traceId', data._traceId);
      }

      const rpcStart = Date.now();

      try {
        const result = await Promise.resolve(fn());
        this.logger.system('info', `RPC success: ${cmd}`, {
          action: 'rpc_success',
          cmd,
          durationMs: Date.now() - rpcStart,
        });
        return result;
      } catch (err: any) {
        this.logger.error(
          `${err.name}: ${err.message}`,
          {
            errorCode: 'RPC_HANDLER_ERROR',
            errorName: err.name,
            cmd,
            durationMs: Date.now() - rpcStart,
          },
          err.stack,
        );
        throw err;
      }
    });
  }

  @MessagePattern({ cmd: USER_COMMANDS.PING })
  ping(
    @Payload() data: WithTrace<PingUserPayload>,
    @Ctx() context: RmqContext,
  ): Promise<PingUserResponse> {
    return this.wrapHandler(context, data, () => ({
      success: true,
      service: 'user-service',
      messageReceived: data,
    }));
  }

  @MessagePattern({ cmd: USER_COMMANDS.WELCOME })
  welcome(
    @Payload() data: WithTrace<WelcomeUserPayload>,
    @Ctx() context: RmqContext,
  ): Promise<WelcomeUserResponse> {
    return this.wrapHandler(context, data, () => ({
      success: true,
      service: 'user-service',
      message: `Chào mừng ${data.name || 'bạn'} đến với hệ thống Microservices NestJS!`,
      timestamp: new Date().toISOString(),
    }));
  }

  @MessagePattern({ cmd: USER_COMMANDS.SEND_MESSAGE })
  sendMessage(
    @Payload()
    data: WithTrace<{
      userId: string;
      lang?: string;
      content: string;
      priority?: number;
    }>,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    return this.wrapHandler(context, data, () => ({
      success: true,
      userId: data.userId,
      message: `Message delivered: "${data.content}"`,
      lang: data.lang || 'en',
      timestamp: new Date().toISOString(),
    }));
  }

  @MessagePattern({ cmd: 'trigger_error' })
  triggerError(
    @Payload() data: WithTrace<any>,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    return this.wrapHandler(context, data, () => {
      const fakeUserData: any = null;
      return fakeUserData.propertyThatDoesNotExist;
    });
  }
}
