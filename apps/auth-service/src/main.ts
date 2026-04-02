import { AUTH_SERVICE, RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(AUTH_SERVICE));
  await app.startAllMicroservices();
}
bootstrap();
