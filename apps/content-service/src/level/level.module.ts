import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';

@Module({
  controllers: [LevelController],
  providers: [LevelService, PrismaService],
  exports: [LevelService],
})
export class LevelModule {}
