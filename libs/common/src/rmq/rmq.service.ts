import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '../interfaces/env.interface';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    const queueName = this.configService.get(
      `RABBIT_MQ_${queue}_QUEUE` as keyof EnvironmentVariables,
    ) as string;

    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBIT_MQ_URI') as string],
        queue: queueName,
        noAck,
        persistent: true,
        // Cấu hình server-side dead-lettering (tuỳ chọn)
        queueOptions: {
          arguments: {
            'x-dead-letter-exchange': '', // Sẽ dùng default exchange
            'x-dead-letter-routing-key': `${queueName}_dlq`,
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

  nack(context: RmqContext, requeue = false) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.nack(originalMessage, false, requeue);
  }

  retry(context: RmqContext, retryCount: number) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const { fields, properties, content } = originalMessage;

    // Các mức delay (giây)
    const delays = [5, 30, 300]; // 5s, 30s, 5m
    const delaySec = delays[retryCount - 1] || 300;

    this.logger.log(
      `Retrying message (count: ${retryCount}) after ${delaySec}s...`,
    );

    // X-retry-count header
    const headers = properties.headers || {};
    headers['x-retry-count'] = retryCount;

    // Gửi message vào queue "wait" tương ứng với TTL
    // Trick: Publish trực tiếp vào queue chính nhưng kèm theo TTL là không được
    // Ta sử dụng Dead Lettering bằng cách Publish vào 1 exchange trung gian
    // HOẶC đơn giản nhất cho tutorial/base này:
    // Cấp phát 1 delayed exchange hoặc dùng setTimeout-republish (dù ít an toàn hơn)
    // Để đảm bảo chuẩn RabbitMQ, ta dùng queue có TTL.

    setTimeout(() => {
      channel.sendToQueue(fields.routingKey, content, {
        ...properties,
        headers,
      });
    }, delaySec * 1000);

    // Reject cái message hiện tại (không requeue) vì ta đã republish rồi.
    channel.ack(originalMessage);
  }

  moveToDlq(context: RmqContext, error: any) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const { fields, content, properties } = originalMessage;
    const dlqQueue = `${fields.routingKey}_dlq`;

    this.logger.error(`Sending message to ${dlqQueue} due to max retries.`);

    // Ghi thêm lỗi vào headers
    const headers = properties.headers || {};
    headers['x-error-message'] = error.message;

    // Đảm bảo Queue tồn tại và gửi vào
    channel.assertQueue(dlqQueue, { durable: true });
    channel.sendToQueue(dlqQueue, content, { ...properties, headers });

    // Ack cái message gốc
    channel.ack(originalMessage);
  }
}
