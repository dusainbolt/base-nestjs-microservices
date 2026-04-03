import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvironmentVariables } from '../interfaces/env.interface';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Common Redis Infrastructure Module.
 * Cung cấp ioredis client thông qua REDIS_CLIENT token.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => {
        const client = new Redis({
          host: config.get('REDIS_HOST'),
          port: Number(config.get('REDIS_PORT')),
          db: Number(config.get('REDIS_DB') ?? 0),
          password: config.get('REDIS_PASSWORD') || undefined,
          retryStrategy: (times) => Math.min(times * 100, 3000),
          lazyConnect: false,
        });

        client.on('connect', () => console.log('[Redis Shared] Connected'));
        client.on('error', (err) =>
          console.error('[Redis Shared] Error:', err.message),
        );

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class CommonRedisModule {}
