import { NestFactory } from '@nestjs/core';
import { RmqService, LOG_SERVICE } from '@app/common';
import { LogServiceModule } from './log-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LogServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(LOG_SERVICE, /* noAck: */ false));
  await app.startAllMicroservices();
}
bootstrap();
