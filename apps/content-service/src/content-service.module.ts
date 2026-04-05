import { EnvironmentVariables, RmqModule, validateEnv } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContentServiceController } from './content-service.controller';
import { ContentServiceService } from './content-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),
    RmqModule,
  ],
  controllers: [ContentServiceController],
  providers: [ContentServiceService],
})
export class ContentServiceModule {}
