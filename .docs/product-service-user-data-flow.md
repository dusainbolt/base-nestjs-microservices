# Product Service — User Data Flow

> Mô tả cách product-service xử lý dữ liệu liên quan đến user (createdBy, xoá user, cập nhật user).

---

## 1. Lưu trữ

Product chỉ lưu **foreign key**, không duplicate thông tin user:

```
Product {
  id
  name
  price
  ...
  createdByUserId   // chỉ lưu ID
}
```

---

## 2. Xoá User → xử lý sản phẩm liên quan

Dùng **Event-Driven Saga** nối tiếp từ `DELETE_ACCOUNT`:

```
auth-service
  └─emit→ USER_COMMANDS.DELETE_PROFILE

user-service
  └─emit→ PRODUCT_COMMANDS.USER_DELETED  (kèm userId)

product-service  (lắng nghe event)
  └─ Tuỳ business rule, chọn 1 trong 3:
       - Soft delete : set isActive = false
       - Hard delete : xoá toàn bộ sản phẩm
       - Reassign    : set createdByUserId = null
```

> Khuyến nghị: **Soft delete** để giữ lịch sử, hoặc **set null** nếu sản phẩm vẫn cần tồn tại công khai.

---

## 3. Cập nhật User (đổi username / avatar)

**Không cần sync sang product-service** — vì product chỉ lưu `userId`.

Thông tin hiển thị (username, avatar) được resolve **realtime khi query** (xem phần 4).

---

## 4. Hiển thị danh sách Product kèm `createdBy`

Pattern: **API Composition** — thực hiện tại API Gateway hoặc product-service.

```
Client  →  GET /products

  Bước 1: Lấy list products từ product-service
          → [{ id, name, createdByUserId: "u1" }, { ..., createdByUserId: "u2" }, ...]

  Bước 2: Collect unique userIds
          → ["u1", "u2", ...]

  Bước 3: 1 lần RPC batch sang user-service
          USER_COMMANDS.GET_USERS_BY_IDS → [{ id, username, avatar }, ...]

  Bước 4: Merge & trả về client
          → [{ id, name, createdBy: { id, username, avatar } }, ...]
```

> **Tại sao batch?** Tránh N+1 — không gọi RPC riêng lẻ cho từng sản phẩm.

**Cache tuỳ chọn:** Kết quả `GET_USERS_BY_IDS` có thể cache Redis ~5 phút vì username/avatar ít thay đổi.

---

## Tóm tắt

| Tình huống | Cách xử lý |
|---|---|
| Lưu product | Chỉ lưu `createdByUserId` (FK), không duplicate |
| Xoá user | Saga event → product-service tự quyết soft/hard delete / set null |
| Đổi username / avatar | Không cần sync — resolve realtime khi query |
| Hiển thị `createdBy` | API Composition + batch RPC `GET_USERS_BY_IDS` |
