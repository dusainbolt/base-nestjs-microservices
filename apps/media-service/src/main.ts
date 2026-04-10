import { initTracing } from '../../../libs/common/src/tracing/tracing';
initTracing('media-service');

import { DOMAIN_EXCHANGE, EnvironmentVariables, MEDIA_SERVICE, RmqService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MediaServiceModule } from './media-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MediaServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  // ── 1. RPC Queue — nhận commands từ api-gateway ─────────────────────────
  app.connectMicroservice(rmqService.getOptions(MEDIA_SERVICE, false));

  // ── 2. Domain Events — lắng nghe Pub/Sub exchange 'domain.events' ──────
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.get('RABBIT_MQ_URI') || ''],
      exchange: DOMAIN_EXCHANGE,
      exchangeType: 'topic',
      queue: 'media_domain_events_queue',
      routingKey: 'user.*',
      wildcardPattern: true,
      noAck: false,
      persistent: true,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'dead.letters',
          'x-dead-letter-routing-key': 'media.dlq',
        },
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
