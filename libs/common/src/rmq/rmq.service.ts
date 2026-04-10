import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '../interfaces/env.interface';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {}

  /**
   * Trả về cấu hình kết nối RabbitMQ
   * @param queueName Tên hằng số định danh (ví dụ: 'AUTH_SERVICE')
   * @param noAck Có tự động Ack không
   * @param prefetchCount Số lượng message xử lý song song (mặc định là 1)
   */
  getOptions(queueName: string, noAck = false, prefetchCount?: number): RmqOptions {
    // Luôn map từ hằng số sang giá trị thực trong .env
    const resolvedQueue = this.configService.get<string>(`RABBIT_MQ_${queueName}_QUEUE` as any);

    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBIT_MQ_URI') as string],
        queue: resolvedQueue || queueName,
        noAck,
        prefetchCount:
          prefetchCount || this.configService.get<number>('RABBIT_MQ_PREFETCH_COUNT') || 1,
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
