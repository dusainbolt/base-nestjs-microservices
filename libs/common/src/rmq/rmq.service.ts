import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Trả về cấu hình kết nối RabbitMQ
   * @param queueName Tên hằng số định danh (ví dụ: 'AUTH_SERVICE')
   * @param noAck Có tự động Ack không
   */
  getOptions(queueName: string, noAck = false): RmqOptions {
    // Luôn map từ hằng số sang giá trị thực trong .env
    const resolvedQueue = this.configService.get<string>(
      `RABBIT_MQ_${queueName}_QUEUE`,
    );

    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBIT_MQ_URI') as string],
        queue: resolvedQueue || queueName,
        noAck,
        persistent: true,
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': '', // Dùng default exchange
            'x-dead-letter-routing-key': '_dlq', // Chuyển thẳng vào queue tên '_dlq'
          },
        },
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
