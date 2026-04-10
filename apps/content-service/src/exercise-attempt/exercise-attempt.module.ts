import { MEDIA_SERVICE, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExerciseAttemptController } from './exercise-attempt.controller';
import { ExerciseAttemptService } from './exercise-attempt.service';

@Module({
  imports: [
    // Register media-service RMQ client để resolve audioId → audioUrl
    RmqModule.register({ name: MEDIA_SERVICE }),
    // TODO: Register AI_SERVICE khi ai-service được triển khai
    // RmqModule.register({ name: AI_SERVICE }),
  ],
  controllers: [ExerciseAttemptController],
  providers: [ExerciseAttemptService, PrismaService],
  exports: [ExerciseAttemptService],
})
export class ExerciseAttemptModule {}
