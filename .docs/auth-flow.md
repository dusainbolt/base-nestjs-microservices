# Auth Flow — Summary

> **Scope:** `apps/api-gateway/src/api/auth.controller.ts` → `apps/auth-service/src/auth-service.controller.ts` → `apps/auth-service/src/auth-service.service.ts`
> **Transport:** RabbitMQ (RPC `send` cho request/response, `emit` cho fire-and-forget events)
> **Storage:** PostgreSQL (Prisma) cho credentials, Redis cho tokens / OTPs / cache / blacklist

---

## Kiến trúc tổng quan

```
Client (HTTP)
    │
    ▼
[API Gateway] — JwtAuthGuard (global)
    │  POST /auth/*
    │  @Public() routes: register, verify-email, resend-verification,
    │              login, refresh, forgot-password, reset-password
    │  Protected routes: logout, change-password, GET/DELETE /auth/me
    │
    │  RabbitMQ RPC (send)
    ▼
[Auth Service Controller]  ←→  AuthServiceService
                                   │
                          ┌────────┴──────────┐
                          ▼                   ▼
                       PostgreSQL           Redis
                       (Prisma)         (tokens/OTPs)
                          │
                    ┌─────┴──────┐
                    │ emit       │ emit
                    ▼            ▼
              email-service   user-service
```

---

## Các luồng chi tiết

### 1. Register — `POST /auth/register` (`@Public`)

1. API Gateway forward RPC `{ cmd: REGISTER }` tới Auth Service.
2. Auth Service kiểm tra email / username trùng trong Postgres → `ConflictException` nếu đã tồn tại.
3. Hash password với **bcrypt (12 rounds)**, tạo user record.
4. Tạo **OTP 6 chữ số**, lưu vào Redis với TTL `EMAIL_VERIFY` (15 phút).
5. **Emit** `SEND_VERIFICATION` tới `email-service` (fire-and-forget).
6. **Emit** `CREATE_PROFILE` tới `user-service` để tạo profile rỗng (event-driven).
7. Trả về `{ message, userId, email }`.

---

### 2. Verify Email — `POST /auth/verify-email` (`@Public`)

1. Tìm user theo email → `NotFoundException` nếu không tồn tại.
2. Kiểm tra `isEmailVerified` → `BadRequestException` nếu đã verify.
3. Lấy OTP từ Redis:
   - OTP hết hạn (null) → yêu cầu gửi lại.
   - OTP sai → `BadRequestException`.
4. Cập nhật `isEmailVerified = true` trong Postgres.
5. Xóa OTP khỏi Redis.
6. **Emit** `SEND_WELCOME` tới `email-service`.

### 3. Resend Verification — `POST /auth/resend-verification` (`@Public`)

- **Rate-limit:** Chỉ cho phép gửi lại nếu OTP hiện tại có TTL còn `< (EMAIL_VERIFY_TTL - 60s)`, tức là phải chờ ít nhất 1 phút sau lần gửi gần nhất.
- Tạo OTP mới → ghi đè Redis → emit `SEND_VERIFICATION`.

---

### 4. Login — `POST /auth/login` (`@Public`)

1. Tìm user theo email → so sánh password với `bcrypt.compare`.
2. Kiểm tra `isActive` → `ForbiddenException` nếu bị khoá.
3. Kiểm tra `isEmailVerified` → `ForbiddenException` nếu chưa verify.
4. Gọi `generateTokenPair`:
   - Tạo **Access Token** (JWT, có `jti` = UUID, `sub`, `email`, `username`, `role`).
   - Tạo **Refresh Token** (UUID làm ID, lưu `RefreshTokenData` vào Redis với TTL `REFRESH_TOKEN`).
5. Trả về `{ accessToken, refreshToken, expiresIn, tokenType: 'Bearer' }`.

---

### 5. Refresh Token — `POST /auth/refresh` (`@Public`)

**Token Rotation pattern:**

1. Dùng `refreshToken` (UUID) tra trong Redis → `UnauthorizedException` nếu không tồn tại hoặc hết hạn.
2. Lấy user từ Postgres theo `userId` trong Redis data.
3. **Xóa** refresh token cũ khỏi Redis.
4. Gọi `generateTokenPair` → cấp **cặp token mới** hoàn toàn.

---

### 6. Logout — `POST /auth/logout` (Protected)

1. Xóa refresh token khỏi Redis.
2. **Blacklist access token:** Decode JWT lấy `jti` và `exp`, tính remaining TTL, ghi `jti` vào Redis blacklist với TTL = thời gian còn lại của token.
3. API Gateway trích `Authorization` header rồi forward `accessToken` kèm trong payload RPC.

---

### 7. Forgot Password — `POST /auth/forgot-password` (`@Public`)

- **Safe message:** Luôn trả cùng 1 message dù email có tồn tại hay không (chống user enumeration).
- Kiểm tra **rate limit** (Redis flag per userId).
- Tạo `resetTokenId` (UUID), lưu vào Redis với TTL `PASSWORD_RESET`.
- Emit `SEND_PASSWORD_RESET` tới `email-service` kèm token.

### 8. Reset Password — `POST /auth/reset-password` (`@Public`)

1. Tra `token` trong Redis → lấy `userId` → `BadRequestException` nếu không có / hết hạn.
2. Hash password mới (bcrypt 12), cập nhật Postgres.
3. Xóa reset token khỏi Redis.

---

### 9. Change Password — `POST /auth/change-password` (Protected)

- Yêu cầu JWT hợp lệ; `userId` lấy từ `@CurrentUser()` decorator (JwtPayload.sub).
- Verify `currentPassword` với bcrypt.
- Kiểm tra `newPassword !== currentPassword`.
- Hash và update trong Postgres.

---

### 10. Get Profile — `GET /auth/me` (Protected)

- Lấy `userId` từ `@CurrentUser()`.
- RPC tới Auth Service → query Postgres, trả về `AuthUserResponse` (không bao gồm password).

### 11. Delete Account — `DELETE /auth/me` (Protected)

**Saga phase 1 (Auth Service):**

1. Xóa user record khỏi Postgres (bỏ qua nếu không tồn tại).
2. Xóa User Profile Cache trong Redis → chặn request ngay lập tức.
3. **Emit** `DELETE_PROFILE` tới `user-service` để dọn dẹp dữ liệu còn lại (Saga phase 2).

---

## JwtAuthGuard (API Gateway — Global)

Áp dụng cho **tất cả** routes, trừ những route được đánh dấu `@Public()`.

```
Request vào
  │
  ├─ @Public()? → Pass through
  │
  ├─ Extract Bearer token từ Authorization header
  │       └─ Không có → 401 UnauthorizedException
  │
  ├─ jwtService.verifyAsync(token)
  │       └─ Invalid/Expired → 401
  │
  ├─ Parallel Redis check:
  │   ├─ isBlacklisted(jti) → 401 nếu bị revoke
  │   └─ getUserProfileCache(sub)
  │           └─ Cache miss → RPC sang AuthService.GET_PROFILE
  │                           → Lưu lại cache (TTL: 30 phút)
  │
  ├─ userData.isActive === false → 403 ForbiddenException
  │
  └─ Gán request['user'] = JwtPayload (full data)
```

---

## Redis Key Schema (tóm tắt)

| Key | Nội dung | TTL |
|---|---|---|
| `auth:refresh:<tokenId>` | `RefreshTokenData` (JSON) | `REFRESH_TOKEN` TTL |
| `auth:email-verify:<userId>` | OTP 6 chữ số | 15 phút |
| `auth:password-reset:<tokenId>` | userId | `PASSWORD_RESET` TTL |
| `auth:rate-limit:forgot-password:<userId>` | `"1"` | `FORGOT_PASSWORD_RATE_LIMIT` TTL |
| `auth:user-profile:<userId>` | `AuthUserResponse` (JSON) | 30 phút |
| `auth:blacklist:<jti>` | `"1"` | TTL còn lại của access token |

---

## Lưu ý quan trọng

- **Access Token** là JWT stateless, được verify locally tại API Gateway (không cần gọi Auth Service mỗi request).
- **Refresh Token** là opaque UUID — state nằm hoàn toàn trong Redis → có thể revoke ngay lập tức.
- **Token Rotation:** Mỗi lần refresh, refresh token cũ bị xoá, cặp mới được phát.
- **Blacklist** chỉ cần tồn tại đến khi access token hết hạn tự nhiên (tiết kiệm bộ nhớ Redis).
- Auth Service sử dụng `RmqInterceptor` để auto-ack/nack message RabbitMQ.
- `generateTokenPair` lưu `jti` vào cả JWT lẫn refresh token data để liên kết session.
