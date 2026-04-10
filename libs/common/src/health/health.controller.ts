import { Controller, Get, Inject, Optional, Res } from '@nestjs/common';
import { HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { ClientProxy, Transport } from '@nestjs/microservices';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { ConfigService } from '@nestjs/config';
import { Public } from '../decorators/public.decorator';
import { AUTH_SERVICE, PRODUCT_SERVICE, USER_SERVICE } from '../constants/services';
import { USER_COMMANDS } from '../constants/user.constants';
import { AUTH_COMMANDS } from '../constants/auth.constants';
import { PRODUCT_COMMANDS } from '../constants/product.constants';
import { firstValueFrom, timeout } from 'rxjs';
import { Response } from 'express';

@Public()
@Controller('health')
export class CommonHealthController {
  constructor(
    protected health: HealthCheckService,
    protected microservice: MicroserviceHealthIndicator,
    @Inject(REDIS_CLIENT) protected redis: Redis,
    protected configService: ConfigService,

    @Optional() @Inject(AUTH_SERVICE) private authClient: ClientProxy,
    @Optional() @Inject(USER_SERVICE) private userClient: ClientProxy,
    @Optional() @Inject(PRODUCT_SERVICE) private productClient: ClientProxy,
  ) {}

  @Get()
  async check(@Res() res: Response) {
    const checks: any[] = [
      // 1. Check Redis (Đặt tên 'redis')
      () => this.pingRedis('redis'),

      // 2. Check RabbitMQ Local (Đặt tên 'rabbitmq_local')
      () =>
        this.microservice.pingCheck('rabbitmq_local', {
          transport: Transport.RMQ,
          options: {
            urls: [this.configService.get<string>('RABBIT_MQ_URI')],
          },
        }),
    ];

    // 3. RPC Pings tới Microservices
    if (this.authClient) {
      checks.push(() => this.pingServiceRpc('auth_service', this.authClient, AUTH_COMMANDS.PING));
    }
    if (this.userClient) {
      checks.push(() => this.pingServiceRpc('user_service', this.userClient, USER_COMMANDS.PING));
    }
    if (this.productClient) {
      checks.push(() =>
        this.pingServiceRpc('product_service', this.productClient, PRODUCT_COMMANDS.PING),
      );
    }

    try {
      const result = await this.health.check(checks);
      return res.status(200).json(result.info);
    } catch (err) {
      // Trả về info ngay cả khi có lỗi (statusCode 503)
      return res.status(503).json(err.response?.info || { status: 'error', message: err.message });
    }
  }

  private async pingRedis(key: string) {
    try {
      await this.redis.ping();
      return { [key]: { status: 'up' } };
    } catch (err) {
      throw new Error(`[${key}] down: ${err.message}`);
    }
  }

  private async pingServiceRpc(key: string, client: ClientProxy, cmd: string) {
    try {
      const response = await firstValueFrom(client.send({ cmd }, {}).pipe(timeout(2000)));
      // Kết quả lồng đúng vào Key để Terminus hiển thị
      return { [key]: { status: 'up', db: response.db || 'up' } };
    } catch (err) {
      throw new Error(`[${key}] unreachable: ${err.message}`);
    }
  }
}
