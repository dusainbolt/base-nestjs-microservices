import { Module } from '@nestjs/common';
import { DomainEventPublisher } from './domain-event-publisher.service';

/**
 * DomainEventsModule — Pub/Sub Exchange-based messaging.
 *
 * Dùng DomainEventPublisher (amqplib trực tiếp) để đảm bảo routing key
 * được set đúng khi publish lên Topic Exchange.
 * NestJS ClientProxy.emit() không đảm bảo routing key với exchange mode.
 *
 * Usage (publisher side — auth-service, user-service...):
 *   imports: [DomainEventsModule]
 *   inject: [DomainEventPublisher]
 *   await this.domainEvents.publish(DOMAIN_EVENTS.USER_DELETED, { userId, timestamp })
 *
 * Subscriber side được cấu hình trong main.ts của từng service
 * (xem product-service/src/main.ts, user-service/src/main.ts).
 */
@Module({
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class DomainEventsModule {}
