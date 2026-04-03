import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RmqService, USER_SERVICE, DOMAIN_EXCHANGE, EnvironmentVariables } from '@app/common';
import { UserServiceModule } from './user-service.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  // ── 1. RPC Queue — nhận commands từ api-gateway (GET_PROFILE, UPDATE_PROFILE...)
  app.connectMicroservice(rmqService.getOptions(USER_SERVICE, false));

  // ── 2. Domain Events — subscribe vào Exchange, nhận user.deleted từ auth-service
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.get('RABBIT_MQ_URI')],
      exchange: DOMAIN_EXCHANGE,
      exchangeType: 'topic',
      queue: 'user_domain_events_queue',  // queue riêng, độc lập với product-service
      routingKey: 'user.*',
      wildcardPattern: true,
      noAck: false,
      persistent: true,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'dead.letters',
          'x-dead-letter-routing-key': 'user.dlq',
        },
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
