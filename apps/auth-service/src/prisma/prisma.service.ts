import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Prisma 7: import từ output đã generate riêng cho auth-service
import { PrismaClient } from '../generated/prisma/client';
// Prisma 7: dùng adapter-pg thay vì url trong datasource
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvironmentVariables } from '@app/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    // Prisma 7: kết nối qua adapter, không dùng url trong schema.prisma
    const adapter = new PrismaPg({
      connectionString: config.get('AUTH_DATABASE_URL'),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma [auth-service] connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma [auth-service] disconnected');
  }
}
