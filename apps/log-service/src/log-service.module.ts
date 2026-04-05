import { EnvironmentVariables, RmqModule, validateEnv } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogServiceController } from './log-service.controller';
import { LogServiceService } from './log-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),
    RmqModule,
  ],
  controllers: [LogServiceController],
  providers: [LogServiceService],
})
export class LogServiceModule {}
