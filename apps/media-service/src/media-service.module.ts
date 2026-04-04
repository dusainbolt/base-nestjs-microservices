import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RmqModule } from '@app/common';
import { MediaServiceController } from './media-service.controller';
import { MediaServiceService } from './media-service.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    RmqModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [MediaServiceController],
  providers: [MediaServiceService, PrismaService],
})
export class MediaServiceModule {}
