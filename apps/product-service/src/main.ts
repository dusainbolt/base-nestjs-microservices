import { initTracing } from '../../../libs/common/src/tracing/tracing';
initTracing('product-service');

import {
  DOMAIN_EXCHANGE,
  EnvironmentVariables,
  PRODUCT_SERVICE,
  RmqService,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductServiceModule } from './product-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  // ── 1. RPC Queue — nhận CRUD commands từ api-gateway ──────────────────────
  app.connectMicroservice(rmqService.getOptions(PRODUCT_SERVICE, false));

  // ── 2. Domain Events — lắng nghe Pub/Sub exchange 'domain.events' ─────────
  //    Queue riêng cho product-service, bind vào topic exchange
  //    DLQ cấu hình qua x-dead-letter-exchange
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.get('RABBIT_MQ_URI') || ''],
      exchange: DOMAIN_EXCHANGE,
      exchangeType: 'topic',
      // Queue riêng: mỗi service tạo queue riêng để nhận event độc lập
      queue: 'product_domain_events_queue',
      routingKey: 'user.*', // wildcard: nhận tất cả user.* events
      wildcardPattern: true,
      noAck: false,
      persistent: true,
      queueOptions: {
        durable: true,
        arguments: {
          // Dead Letter Queue: message fail sau retry → vào DLQ
          'x-dead-letter-exchange': 'dead.letters',
          'x-dead-letter-routing-key': 'product.dlq',
        },
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
