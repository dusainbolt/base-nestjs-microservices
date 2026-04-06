# 📜 Microservices & Prisma Manager Scripts

Thư mục này chứa các script (.mjs) để quản lý microservices và Prisma database, giúp file `package.json` gọn gàng hơn.

## 🛠️ Tích hợp với `package.json`

File `package.json` ở root đã được cập nhật để sử dụng các script này thông qua các alias rút gọn:

- `pnpm start:svc auth` -> nhanh gọn hơn việc gõ lệnh node dài dòng.
- `pnpm prisma:op migrate auth --name init`
- `pnpm seed:svc content`

## 🚀 Quản lý Microservices (`services.mjs`)

Dùng để khởi động các microservice ở chế độ watch mode.

- **Cấu trúc lệnh**: `node scripts/services.mjs <service-key>`
- **Các service hỗ trợ**: `gateway`, `auth`, `user`, `email`, `log`, `product`, `media`, `content`

**VD:**

```bash
node scripts/services.mjs auth
node scripts/services.mjs content
```

---

## 💎 Quản lý Prisma (`prisma.mjs`)

Quản lý generate, migrate, studio và deploy cho từng service có database riêng biệt.

- **Cấu trúc lệnh**: `node scripts/prisma.mjs <operation> <service-key> [extraArgs]`
- **Các operation hỗ trợ**: `generate`, `migrate`, `studio`, `deploy`
- **Các service hỗ trợ**: `auth`, `user`, `product`, `media`, `content`

**VD:**

```bash
# Generate Client (Toàn bộ)
node scripts/prisma.mjs generate

# Generate Client (Từng service)
node scripts/prisma.mjs generate auth

# Migration (Tạo hoặc cập nhật db)
node scripts/prisma.mjs migrate auth --name init
node scripts/prisma.mjs migrate content --name update_level

# Mở Prisma Studio
node scripts/prisma.mjs studio user

# Deploy Migration (dùng cho CI/CD hoặc production)
node scripts/prisma.mjs deploy auth
```

---

## 🌱 Seeding Data (`seed.mjs`)

Dùng để nạp dữ liệu mẫu vào database.

- **Cấu trúc lệnh**: `node scripts/seed.mjs <service-key>`
- **Các service hỗ trợ**: `content` (seeding levels)

**VD:**

```bash
pnpm seed:svc content:levels
pnpm seed:svc content:categories
pnpm seed:svc content:lesson-packs
```

---
