import { Module, DynamicModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CommonHealthController } from './health.controller';
import { CommonRedisModule } from '../redis/redis.module';

@Module({
  imports: [TerminusModule, CommonRedisModule],
  controllers: [CommonHealthController],
  exports: [TerminusModule, CommonRedisModule],
})
export class CommonHealthModule {
  static register(): DynamicModule {
    return {
      module: CommonHealthModule,
      imports: [TerminusModule, CommonRedisModule],
      controllers: [CommonHealthController],
    };
  }
}
