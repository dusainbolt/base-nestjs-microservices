import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserServiceController {
  constructor(
    private readonly userServiceService: UserServiceService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern({ cmd: 'ping' })
  ping(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return {
      success: true,
      service: 'user-service',
      messageReceived: data,
    };
  }
}
