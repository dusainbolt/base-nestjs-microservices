# Event-Driven Pub/Sub — Rủi ro & Cách xử lý

> Áp dụng cho pattern bắn 1 event (`user.deleted`) → nhiều service lắng nghe song song qua RabbitMQ Topic Exchange.

---

## Kiến trúc tổng quan

```
user-service
  └─emit→  exchange: domain.events  (routing key: user.deleted)
                │
        ┌───────┼────────────────┐
        ▼       ▼                ▼
  product-service  order-service  ...
  (queue riêng)    (queue riêng)
```

Mỗi service có queue **riêng**, bind vào cùng 1 exchange. Thêm service mới chỉ cần subscribe — không sửa code user-service.

---

## Rủi ro & Cách cover

### 1. Message bị mất (No Guarantee Delivery)

**Tình huống:** RabbitMQ crash trước khi deliver message tới queue.

**Cover:** Durable queue + persistent message.

```typescript
queueOptions: {
  durable: true,          // queue tồn tại sau khi RabbitMQ restart
  arguments: {
    'x-dead-letter-exchange': 'dead.letters',   // DLQ
  }
},
// persistent: true — message ghi xuống disk
```

---

### 2. Consumer xử lý fail — message bị drop

**Tình huống:** product-service nhận event, DB lỗi giữa chừng → nếu auto-ack thì message mất vĩnh viễn.

**Cover:** Manual ack — `RmqInterceptor` chỉ ACK sau khi handler thành công. Nếu throw exception → NACK → message về lại queue hoặc vào DLQ.

```typescript
// RmqInterceptor hiện tại: ACK on success, ACK on caught error (trả lỗi về client)
// Với event handler (fire-and-forget): cần NACK + requeue khi lỗi tạm thời
tap(() => channel.ack(msg)),
catchError((err) => {
  const isTransient = isTransientError(err); // DB timeout, network...
  channel.nack(msg, false, isTransient);     // requeue nếu lỗi tạm thời
  return of(null);
})
```

---

### 3. Xử lý 2 lần (At-Least-Once Delivery)

**Tình huống:** Handler xử lý xong nhưng ACK chưa kịp gửi → RabbitMQ redeliver → chạy lại.

**Cover:** **Idempotent handler** — xử lý 2 lần cho kết quả giống lần 1.

```typescript
// Soft delete idempotent tự nhiên — updateMany chỉ update row đang active
await prisma.product.updateMany({
  where: { createdByUserId: userId, isActive: true },
  data: { isActive: false, deletedAt: new Date() },
});
// Chạy lại: không có row nào khớp điều kiện → no-op, không lỗi
```

---

### 4. Một service fail — service khác vẫn chạy (Partial Failure)

**Tình huống:** product-service xử lý thành công, order-service crash → data lệch nhau.

**Cover:** Dead Letter Queue (DLQ) + retry với exponential backoff.

```
Queue bình thường
  └─ Retry 3 lần (delay tăng dần: 5s → 30s → 120s)
  └─ Fail hết → vào DLQ

DLQ
  └─ Alert / monitor (Grafana, Sentry...)
  └─ Có thể replay thủ công hoặc tự động
```

```typescript
// Khai báo DLQ exchange + queue khi setup
queueOptions: {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dead.letters',
    'x-message-ttl': 30000,          // message sống tối đa 30s trước khi sang DLQ
  }
}
```

> Chấp nhận **eventual consistency** — không có distributed transaction. DLQ đảm bảo không mất message.

---

### 5. Event đến sai thứ tự (Out-of-Order)

**Tình huống:** `user.profile_updated` đến sau `user.deleted` (do network lag) → update user đã xoá.

**Cover:** Timestamp check trong handler.

```typescript
@EventPattern('user.deleted')
async handleUserDeleted(@Payload() data: { userId: string; timestamp: number }) {
  const product = await prisma.product.findFirst({
    where: { createdByUserId: data.userId }
  });
  // Bỏ qua nếu đã xử lý event mới hơn
  if (product?.eventTimestamp > data.timestamp) return;
  // ...xử lý
}
```

---

## Tóm tắt mức độ ưu tiên

| Rủi ro | Mức độ | Cover bằng |
|---|---|---|
| Message mất | Cao | `durable: true` + `persistent: true` |
| Xử lý fail → drop | Cao | Manual ACK / NACK (RmqInterceptor) |
| Xử lý 2 lần | Trung bình | Idempotent handler |
| Partial failure | Trung bình | DLQ + retry + alert |
| Sai thứ tự | Thấp | Timestamp check trong payload |

---

## Checklist khi thêm service mới lắng nghe event

- [ ] Tạo queue riêng với tên unique (e.g. `product_domain_events_queue`)
- [ ] Bind queue vào exchange `domain.events` với routing key phù hợp
- [ ] Handler phải **idempotent**
- [ ] Cấu hình `durable: true` + DLQ arguments
- [ ] Manual ack (`noAck: false`)
- [ ] Thêm timestamp vào payload event nếu cần ordering
