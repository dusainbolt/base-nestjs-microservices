import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  RmqService,
  USER_COMMANDS,
  PingUserPayload,
  PingUserResponse,
  WelcomeUserPayload,
  WelcomeUserResponse,
} from '@app/common';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserServiceController {
  constructor(
    private readonly userServiceService: UserServiceService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern({ cmd: USER_COMMANDS.PING })
  ping(@Payload() data: PingUserPayload, @Ctx() context: RmqContext): PingUserResponse {
    this.rmqService.ack(context);
    return {
      success: true,
      service: 'user-service',
      messageReceived: data,
    };
  }

  @MessagePattern({ cmd: USER_COMMANDS.WELCOME })
  welcome(
    @Payload() data: WelcomeUserPayload,
    @Ctx() context: RmqContext,
  ): WelcomeUserResponse {
    this.rmqService.ack(context);
    return {
      success: true,
      service: 'user-service',
      message: `Chào mừng ${data.name || 'bạn'} đến với hệ thống Microservices NestJS!`,
      timestamp: new Date().toISOString(),
    };
  }
}
