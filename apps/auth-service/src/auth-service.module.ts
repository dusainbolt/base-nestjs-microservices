import {
  CommonJwtModule,
  CommonRedisModule,
  DomainEventsModule,
  EMAIL_SERVICE,
  EnvironmentVariables,
  RmqModule,
  USER_SERVICE,
  validateEnv,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),

    // Shared infrastructure from @app/common
    CommonJwtModule,
    CommonRedisModule,

    // RabbitMQ: queue của chính auth-service + client tới các service khác
    RmqModule,
    RmqModule.register({ name: EMAIL_SERVICE }), // emit email events
    RmqModule.register({ name: USER_SERVICE }), // emit CREATE_PROFILE event (register flow)
    DomainEventsModule, // DomainEventPublisher — publish lên exchange trực tiếp qua amqplib

    // Redis Shared infrastructure
    CommonRedisModule,
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, PrismaService, RedisService],
})
export class AuthServiceModule {}
