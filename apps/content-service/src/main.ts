import { initTracing } from '../../../libs/common/src/tracing/tracing';
initTracing('content-service');

import { CONTENT_SERVICE, RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { ContentServiceModule } from './content-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ContentServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(CONTENT_SERVICE, false));
  await app.startAllMicroservices();
}
bootstrap();
