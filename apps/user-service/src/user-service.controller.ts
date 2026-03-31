import {
  PingUserPayload,
  PingUserResponse,
  RmqInterceptor,
  USER_COMMANDS,
  WelcomeUserPayload,
  WelcomeUserResponse,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern({ cmd: USER_COMMANDS.PING })
  ping(@Payload() data: PingUserPayload): PingUserResponse {
    return {
      success: true,
      service: 'user-service',
      messageReceived: data,
    };
  }

  @MessagePattern({ cmd: USER_COMMANDS.WELCOME })
  welcome(@Payload() data: WelcomeUserPayload): WelcomeUserResponse {
    return {
      success: true,
      service: 'user-service',
      message: `Chào mừng ${data.name || 'bạn'} đến với hệ thống Microservices NestJS!`,
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern({ cmd: USER_COMMANDS.TRIGGER_ERROR })
  triggerError(@Payload() data: any) {
    console.log('--- Triggering Error for Retry Demo ---');
    console.log('Data received:', data);
    throw new Error('DEMO_ERROR: Service failure simulation for retry flow');
  }
}
