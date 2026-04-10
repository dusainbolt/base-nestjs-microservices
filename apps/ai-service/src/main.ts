import { initTracing } from '../../../libs/common/src/tracing/tracing';
initTracing('ai-service');

import { AI_SERVICE, RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { AiServiceModule } from './ai-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AiServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(AI_SERVICE, false));
  await app.startAllMicroservices();
}
bootstrap();
