import { NestFactory } from '@nestjs/core';
import { RmqService, USER_SERVICE } from '@app/common';
import { UserServiceModule } from './user-service.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(USER_SERVICE, /* noAck: */ false));
  await app.startAllMicroservices();
}
bootstrap();
