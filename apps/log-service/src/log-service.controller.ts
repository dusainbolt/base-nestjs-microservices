import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { LogServiceService } from './log-service.service';

@Controller()
export class LogServiceController {
  constructor(
    private readonly logServiceService: LogServiceService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('log_event')
  handleLogEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Log Service received:', data);
    this.rmqService.ack(context);
  }
}
