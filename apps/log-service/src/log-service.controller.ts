import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService, LOG_EVENTS, StandardLogPayload } from '@app/common';
import { LogServiceService } from './log-service.service';

@Controller()
export class LogServiceController {
  constructor(
    private readonly logServiceService: LogServiceService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern(LOG_EVENTS.SYSTEM_LOG)
  handleSystemLog(@Payload() data: StandardLogPayload, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    
    // Transform to exactly match the requested ELK format
    const elkLog = {
      '@timestamp': data.timestamp,
      level: data.level,
      service: data.service,
      traceId: data.traceId,
      logType: data.logType,
      message: data.message,
      context: data.context || {},
      ...(data.exception && { exception: data.exception }),
    };

    // In a real app, this would be pushed to Elasticsearch/Logstash via HTTP/TCP
    // For now, we simulate by printing the formatted JSON
    console.log(JSON.stringify(elkLog, null, 2));
  }
}
