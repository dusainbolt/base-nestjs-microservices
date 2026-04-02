import { NestFactory } from '@nestjs/core';
import { RmqService, EMAIL_SERVICE } from '@app/common';
import { EmailServiceModule } from './email-service.module';

async function bootstrap() {
  const app = await NestFactory.create(EmailServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(EMAIL_SERVICE));
  await app.startAllMicroservices();
  console.log('--- EMAIL SERVICE IS RUNNING ---');
}
bootstrap();
