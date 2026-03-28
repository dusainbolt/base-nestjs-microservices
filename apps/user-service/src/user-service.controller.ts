import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import {
  RmqService,
  USER_COMMANDS,
  USER_SERVICE,
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
   * 3. Chạy handler, log lỗi nếu throw
   */
  private wrapHandler<T>(
    context: RmqContext,
    data: WithTrace<any>,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    this.rmqService.ack(context);

    return this.cls.run(async () => {
      if (data?._traceId) {
        this.cls.set('_traceId', data._traceId);
      }

      try {
        return await Promise.resolve(fn());
      } catch (err: any) {
        this.logger.error(
          `${err.name}: ${err.message}`,
          { errorCode: 'RPC_HANDLER_ERROR', errorName: err.name },
          err.stack,
        );
        throw err;
      }
    });
  }

  @MessagePattern({ cmd: USER_COMMANDS.PING })
  ping(@Payload() data: WithTrace<PingUserPayload>, @Ctx() context: RmqContext): Promise<PingUserResponse> {
    return this.wrapHandler(context, data, () => ({
      success: true,
      service: 'user-service',
      messageReceived: data,
    }));
  }

  @MessagePattern({ cmd: USER_COMMANDS.WELCOME })
  welcome(@Payload() data: WithTrace<WelcomeUserPayload>, @Ctx() context: RmqContext): Promise<WelcomeUserResponse> {
    return this.wrapHandler(context, data, () => {
      this.logger.business(`Received welcome from: ${data.name || 'Guest'}`, {
        action: 'process_welcome',
        entityId: `usr-${Date.now()}`,
        status: 'PROCESSED',
      });

      return {
        success: true,
        service: 'user-service',
        message: `Chào mừng ${data.name || 'bạn'} đến với hệ thống Microservices NestJS!`,
        timestamp: new Date().toISOString(),
      };
    });
  }

  @MessagePattern({ cmd: 'trigger_error' })
  triggerError(@Payload() data: WithTrace<any>, @Ctx() context: RmqContext): Promise<any> {
    return this.wrapHandler(context, data, () => {
      const fakeUserData: any = null;
      return fakeUserData.propertyThatDoesNotExist;
    });
  }
}
