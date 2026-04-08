import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LessonPackController } from './lesson-pack.controller';
import { LessonPackService } from './lesson-pack.service';

@Module({
  controllers: [LessonPackController],
  providers: [LessonPackService, PrismaService],
  exports: [LessonPackService],
})
export class LessonPackModule {}
