import { EnvironmentVariables, RmqModule, S3Module, validateEnv } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaServiceController } from './media-service.controller';
import { MediaServiceService } from './media-service.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),
    RmqModule,
    S3Module,
    ScheduleModule.forRoot(),
  ],
  controllers: [MediaServiceController],
  providers: [MediaServiceService, PrismaService],
})
export class MediaServiceModule {}
