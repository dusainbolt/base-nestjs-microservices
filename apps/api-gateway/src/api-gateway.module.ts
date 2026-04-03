import {
  AUTH_SERVICE,
  CommonJwtModule,
  CommonRedisModule,
  GlobalExceptionFilter,
  JwtAuthGuard,
  LOG_SERVICE,
  PRODUCT_SERVICE,
  RmqModule,
  USER_SERVICE,
  UserEnrichService,
  EnvironmentVariables,
  validateEnv,
  CommonHealthController,
} from '@app/common';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './api/auth.controller';
import { UserController } from './api/user.controller';
import { ProductController } from './api/product.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),

    // JWT verify local — không gọi auth-service mỗi request
    CommonJwtModule,

    // Khởi tạo Redis để Guard soi blacklist
    CommonRedisModule,

    RmqModule.register({ name: USER_SERVICE }),
    RmqModule.register({ name: LOG_SERVICE }),
    RmqModule.register({ name: AUTH_SERVICE }),
    RmqModule.register({ name: PRODUCT_SERVICE }),
    TerminusModule,
  ],
  controllers: [
    ApiGatewayController,
    AuthController,
    UserController,
    ProductController,
    CommonHealthController, // <--- Register Aggregator here
  ],
  providers: [
    ApiGatewayService,
    UserEnrichService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class ApiGatewayModule {}
