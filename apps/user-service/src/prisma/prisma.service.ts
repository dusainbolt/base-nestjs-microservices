import { EnvironmentVariables } from '@app/common';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    // Prisma 7: kết nối qua adapter, không dùng url trong schema.prisma
    const adapter = new PrismaPg({
      connectionString: config.get('USER_DATABASE_URL'),
    });
    super({ adapter });
    // return this.$extends(softDeleteExtension(Prisma)) as any;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma [user-service] connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma [user-service] disconnected');
  }
}
