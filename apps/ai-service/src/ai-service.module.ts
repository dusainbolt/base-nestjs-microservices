import { EnvironmentVariables, RmqModule, validateEnv, S3Module } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),
    RmqModule,
    S3Module,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiServiceModule {}
