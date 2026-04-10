import { EnvironmentVariables, RmqModule, validateEnv } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { LevelModule } from './level/level.module';
import { LessonPackModule } from './lesson-pack/lesson-pack.module';
import { PracticeModule } from './practice/practice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),
    RmqModule,
    CategoryModule,
    LevelModule,
    LessonPackModule,
    PracticeModule,
  ],
  controllers: [],
  providers: [],
})
export class ContentServiceModule {}
