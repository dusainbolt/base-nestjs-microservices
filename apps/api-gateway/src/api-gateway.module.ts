import {
  AUTH_SERVICE,
  CommonJwtModule,
  CommonRedisModule,
  CONTENT_SERVICE,
  GlobalExceptionFilter,
  JwtAuthGuard,
  LOG_SERVICE,
  MEDIA_SERVICE,
  PRODUCT_SERVICE,
  RmqModule,
  USER_SERVICE,
  UserEnrichService,
  EnvironmentVariables,
  validateEnv,
  CommonHealthController,
} from '@app/common';
import { S3Module } from '@app/common/s3/s3.module';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './api/auth.controller';
import { UserController } from './api/user.controller';
import { ProductController } from './api/product.controller';
import { MediaController } from './api/media.controller';
import { CategoryController } from './api/category.controller';
import { PracticeController } from './api/practice.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),

    // JWT verify local — không gọi auth-service mỗi request
    CommonJwtModule,

    // Rate Limiting toàn hệ thống mặc định (60 req / 1 phút)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Khởi tạo Redis để Guard soi blacklist
    CommonRedisModule,

    RmqModule.register({ name: USER_SERVICE }),
    RmqModule.register({ name: LOG_SERVICE }),
    RmqModule.register({ name: AUTH_SERVICE }),
    RmqModule.register({ name: PRODUCT_SERVICE }),
    RmqModule.register({ name: MEDIA_SERVICE }),
    RmqModule.register({ name: CONTENT_SERVICE }),
    S3Module,
    TerminusModule,
  ],
  controllers: [
    ApiGatewayController,
    AuthController,
    UserController,
    ProductController,
    MediaController,
    CategoryController,
    PracticeController,
    CommonHealthController, // <--- Register Aggregator here
  ],
  providers: [
    ApiGatewayService,
    UserEnrichService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // Guard chống Spam
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // Guard kiểm tra JWT
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class ApiGatewayModule {}
