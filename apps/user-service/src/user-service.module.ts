import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MEDIA_SERVICE, RmqModule } from '@app/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    RmqModule.register({ name: MEDIA_SERVICE }),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService, PrismaService],
})
export class UserServiceModule {}
