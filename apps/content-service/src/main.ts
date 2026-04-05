import { initTracing } from '../../../libs/common/src/tracing/tracing';
initTracing('content-service');

import { AUTH_SERVICE, RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { ContentServiceModule } from './content-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ContentServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(AUTH_SERVICE));
  await app.startAllMicroservices();
}
bootstrap();
