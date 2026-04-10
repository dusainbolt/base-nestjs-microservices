import { AI_SERVICE, MEDIA_SERVICE, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

@Module({
  imports: [
    // Register media-service RMQ client để resolve audioId → audioUrl
    RmqModule.register({ name: MEDIA_SERVICE }),
    // Register AI_SERVICE
    RmqModule.register({ name: AI_SERVICE }),
  ],
  controllers: [PracticeController],
  providers: [PracticeService, PrismaService],
  exports: [PracticeService],
})
export class PracticeModule {}
