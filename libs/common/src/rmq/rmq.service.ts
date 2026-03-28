import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '../interfaces/env.interface';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBIT_MQ_URI') as string],
        queue: this.configService.get(`RABBIT_MQ_${queue}_QUEUE` as keyof EnvironmentVariables) as string,
        noAck,
        persistent: true,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
