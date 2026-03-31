import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RmqInterceptor } from '@app/common';
import { LogServiceService } from './log-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class LogServiceController {
  constructor(private readonly logServiceService: LogServiceService) {}

  @EventPattern('log_event')
  handleLogEvent(@Payload() data: any) {
    console.log('Log Service received:', data);
  }
}
