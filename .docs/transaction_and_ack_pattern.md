# Database Transaction & RabbitMQ Ack — Toàn vẹn dữ liệu

Tài liệu này giải thích mối quan hệ giữa **RabbitMQ Manual Ack** và **Database Transaction**, và khi nào cần phối hợp cả hai.

---

## 1. Vấn đề cốt lõi

Một hàm xử lý nghiệp vụ (business handler) phải đảm bảo **tính toàn vẹn** theo 2 lớp:

| Lớp | Công cụ | Mục đích |
|---|---|---|
| **Toàn vẹn Message** | `rmqService.ack()` | Đảm bảo message không bị mất hoặc xử lý trùng |
| **Toàn vẹn Dữ liệu** | `DB Transaction` | Đảm bảo các thao tác DB thành công toàn bộ hoặc không thao tác nào |

---

## 2. Transaction DB là gì?

Transaction là cơ chế cho phép nhóm nhiều câu lệnh SQL thành một đơn vị công việc duy nhất theo nguyên tắc **ACID**:

- **A**tomicity (Nguyên tử): Tất cả thành công hoặc tất cả rollback.
- **C**onsistency (Nhất quán): Dữ liệu luôn chuyển từ trạng thái hợp lệ sang trạng thái hợp lệ.
- **I**solation (Cô lập): Các transaction không ảnh hưởng lẫn nhau.
- **D**urability (Bền vững): Dữ liệu được commit sẽ không bị mất dù có sự cố.

---

## 3. Khi nào cần Transaction DB?

### ✅ CẦN dùng Transaction khi:

**Tình huống 1: Một nghiệp vụ cần ghi vào nhiều bảng cùng lúc**

Ví dụ: Đặt hàng — phải ghi vào `orders`, `order_items`, và trừ `inventory` cùng lúc.

```typescript
// Nếu ghi orders thành công nhưng trừ inventory bị lỗi → Dữ liệu sai!
// Phải dùng transaction để rollback cả orders nếu inventory thất bại.
async createOrder(data: CreateOrderDto): Promise<void> {
  await this.dataSource.transaction(async (manager) => {
    const order = await manager.save(Order, { userId: data.userId });
    for (const item of data.items) {
      await manager.save(OrderItem, { orderId: order.id, ...item });
      await manager.decrement(Inventory, { productId: item.productId }, 'stock', item.quantity);
    }
  });
}
```

**Tình huống 2: Đọc rồi ghi (Read-Modify-Write) — tránh race condition**

Ví dụ: Trừ điểm thưởng — đọc số điểm hiện tại, trừ đi, ghi lại.

```typescript
// NGUY HIỂM: 2 request đồng thời đọc cùng số điểm → trừ 2 lần nhưng chỉ trừ 1 lần
// Dùng transaction với PESSIMISTIC_WRITE lock để khoá hàng trong khi xử lý.
await this.dataSource.transaction(async (manager) => {
  const user = await manager.findOne(User, {
    where: { id: userId },
    lock: { mode: 'pessimistic_write' }, // Khoá hàng DB
  });
  if (user.points < amount) throw new Error('Insufficient points');
  user.points -= amount;
  await manager.save(user);
});
```

**Tình huống 3: Ghi nhiều bảng liên quan đến tài chính, tài khoản**

Chuyển tiền, thanh toán, hoàn tiền — không bao giờ được ghi một nửa.

### ❌ KHÔNG cần Transaction khi:

- Chỉ đọc dữ liệu (SELECT).
- Chỉ ghi vào **một bảng duy nhất** (ghi một bản ghi đơn giản).
- Các thao tác không phụ thuộc nhau (ghi log, ghi cache).

---

## 4. Phối hợp Transaction + RabbitMQ Ack — Pattern chuẩn

Đây là pattern đúng khi nhận message từ RabbitMQ và cần ghi DB:

```typescript
@MessagePattern({ cmd: USER_COMMANDS.CREATE_USER })
async createUser(
  @Payload() data: CreateUserPayload,
  @Ctx() context: RmqContext,
): Promise<CreateUserResponse> {
  try {
    // 1. Thực thi Business Logic bên trong Transaction
    const result = await this.userService.createUserWithTransaction(data);

    // 2. Chỉ ACK khi DB đã commit thành công
    this.rmqService.ack(context);

    return { success: true, data: result };

  } catch (error) {
    // 3. Lỗi → KHÔNG ACK → RabbitMQ sẽ re-queue message
    // (Chú ý: cần Dead Letter Queue để tránh vòng lặp vô hạn - xem mục 5)
    throw error;
  }
}
```

```typescript
// user.service.ts
async createUserWithTransaction(data: CreateUserPayload): Promise<User> {
  return this.dataSource.transaction(async (manager) => {
    // Tất cả các ghi DB đều nằm trong 1 transaction
    const profile = await manager.save(UserProfile, { name: data.name });
    const wallet = await manager.save(Wallet, { userId: profile.id, balance: 0 });
    const settings = await manager.save(UserSettings, { userId: profile.id });
    return profile;
    // Nếu bất kỳ bước nào fail → tất cả tự động rollback
  });
}
```

---

## 5. Vòng lặp vô hạn — Dead Letter Queue (DLQ)

Nếu handler luôn bị lỗi và không `ack`, message sẽ bị re-queue **vô hạn lần**. Giải pháp là cấu hình **Dead Letter Queue (DLQ)**:

```
[Lỗi lần 1] → Re-queue → [Lỗi lần 2] → Re-queue → ... → [Hết retry] → Chuyển vào DLQ
```

Trong DLQ, message được lưu lại để:
- Developer kiểm tra và xử lý thủ công.
- Hệ thống monitoring gửi alert.

> [!WARNING]
> Chưa cấu hình DLQ = Nguy cơ "poison message" làm nghẽn toàn bộ hàng đợi.

---

## 6. Tổng kết — Decision Tree

```
Nhận message từ RabbitMQ
        ↓
 Cần ghi DB không?
   /         \
 Không        Có
  ↓            ↓
 ack()    Ghi vào 1 bảng   Ghi vào nhiều bảng
 ngay     đơn giản?         hoặc phức tạp?
            /    \              /         \
          Có     Không        Có           Không
          ↓        ↓          ↓             ↓
        Ghi DB   Dùng     Dùng DB       Xem lại
        → ack()  Transaction Transaction  thiết kế
                 → ack()    + DLQ → ack()
```

---

## 7. Ví dụ trong Project này

| Handler | Transaction? | Lý do |
|---|---|---|
| `ping` / `welcome` | ❌ Không cần | Chỉ trả dữ liệu, không ghi DB |
| `createUser` (tương lai) | ✅ Cần | Ghi `user_profile` + `wallet` cùng lúc |
| `handleLogEvent` | ❌ Không cần | Fire & forget, mất 1 log không ảnh hưởng |
| `transferPoints` (tương lai) | ✅ Bắt buộc | Tài chính, phải toàn vẹn tuyệt đối |
