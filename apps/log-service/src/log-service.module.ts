import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common';
import { LogServiceController } from './log-service.controller';
import { LogServiceService } from './log-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RmqModule,
  ],
  controllers: [LogServiceController],
  providers: [LogServiceService],
})
export class LogServiceModule {}
