import {
  AUTH_SERVICE,
  CommonJwtModule,
  CommonRedisModule,
  JwtAuthGuard,
  LOG_SERVICE,
  PRODUCT_SERVICE,
  RmqModule,
  USER_SERVICE,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './api/auth.controller';
import { UserController } from './api/user.controller';
import { ProductController } from './api/product.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // JWT verify local — không gọi auth-service mỗi request
    CommonJwtModule,

    // Khởi tạo Redis để Guard soi blacklist
    CommonRedisModule,

    RmqModule.register({ name: USER_SERVICE }),
    RmqModule.register({ name: LOG_SERVICE }),
    RmqModule.register({ name: AUTH_SERVICE }),
    RmqModule.register({ name: PRODUCT_SERVICE }),
  ],
  controllers: [ApiGatewayController, AuthController, UserController, ProductController],
  providers: [
    ApiGatewayService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class ApiGatewayModule {}
