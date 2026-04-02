import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Queue trực tiếp của product-service — dùng cho RPC (CRUD commands)
    RmqModule,
  ],
  controllers: [ProductServiceController],
  providers: [ProductServiceService, PrismaService],
})
export class ProductServiceModule {}
