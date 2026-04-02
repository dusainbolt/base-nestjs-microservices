import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  RmqModule,
  EMAIL_SERVICE,
  USER_SERVICE,
  CommonRedisModule,
  CommonJwtModule,
} from '@app/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Shared infrastructure from @app/common
    CommonJwtModule,
    CommonRedisModule,

    // RabbitMQ: queue của chính auth-service + client tới các service khác
    RmqModule,
    RmqModule.register({ name: EMAIL_SERVICE }), // emit email events
    RmqModule.register({ name: USER_SERVICE }),  // emit user.registered event

    // Redis Shared infrastructure
    CommonRedisModule,
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, PrismaService, RedisService],
})
export class AuthServiceModule {}
