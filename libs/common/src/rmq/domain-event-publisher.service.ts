import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { DOMAIN_EXCHANGE } from '../constants/product.constants';
import { EnvironmentVariables } from '../interfaces/env.interface';

/**
 * DomainEventPublisher — Publish domain events lên RabbitMQ Topic Exchange.
 *
 * - Dùng amqplib trực tiếp (NestJS ClientProxy.emit không đảm bảo routing key với exchange)
 * - Lazy connect: nếu connect lần đầu thất bại, tự retry khi publish
 * - Auto-reconnect: lắng nghe sự kiện 'error' / 'close' của connection
 */
@Injectable()
export class DomainEventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DomainEventPublisher.name);

  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private connectingPromise: Promise<void> | null = null;

  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  async onModuleInit() {
    // Cố kết nối lúc khởi động — nếu fail thì log và tiếp tục (lazy retry khi publish)
    await this.connect().catch((err) =>
      this.logger.error(
        'Initial RabbitMQ connection failed, will retry on first publish',
        err?.message,
      ),
    );
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Publish domain event lên exchange với routing key = eventName.
   * Tự động connect/reconnect nếu channel chưa sẵn sàng.
   */
  async publish(eventName: string, data: unknown): Promise<void> {
    await this.ensureChannel();

    if (!this.channel) {
      this.logger.error(
        `Cannot publish [${eventName}]: channel still not ready after connect attempt`,
      );
      return;
    }

    const message = Buffer.from(JSON.stringify({ pattern: eventName, data }));

    this.channel.publish(DOMAIN_EXCHANGE, eventName, message, {
      persistent: true,
      contentType: 'application/json',
    });

    this.logger.log(`Domain event published: [${eventName}]`);
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // bỏ qua lỗi khi shutdown
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /** Đảm bảo channel sẵn sàng — idempotent, không connect 2 lần song song */
  private async ensureChannel(): Promise<void> {
    if (this.channel) return;
    await this.connect().catch((err) => this.logger.error('Reconnect failed:', err?.message));
  }

  private async connect(): Promise<void> {
    // Tránh nhiều coroutine connect cùng lúc
    if (this.connectingPromise) return this.connectingPromise;

    this.connectingPromise = this.doConnect().finally(() => {
      this.connectingPromise = null;
    });

    return this.connectingPromise;
  }

  private async doConnect(): Promise<void> {
    const uri = this.config.get('RABBIT_MQ_URI') as string;

    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();

    // Đảm bảo exchange tồn tại
    await this.channel.assertExchange(DOMAIN_EXCHANGE, 'topic', {
      durable: true,
    });

    // Auto-reset khi mất kết nối → publish tiếp theo sẽ tự reconnect
    this.connection.on('error', (err) => {
      this.logger.error('RabbitMQ connection error:', err?.message);
      this.channel = null;
      this.connection = null;
    });
    this.connection.on('close', () => {
      this.logger.warn('RabbitMQ connection closed, will reconnect on next publish');
      this.channel = null;
      this.connection = null;
    });

    this.logger.log(`Connected to RabbitMQ exchange [${DOMAIN_EXCHANGE}] (topic)`);
  }
}
