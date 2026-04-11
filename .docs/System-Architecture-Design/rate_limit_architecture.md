# Rate Limiting & Throttling Architecture

Hệ thống Microservices sử dụng mô hình "**Defense in Depth**" (Phòng ngự theo chiều sâu) để bảo vệ tài nguyên khỏi spam, DDoS, và Brute-force attacks. 

Hệ thống được thiết kế với hai lớp bảo mật:
1. **API Gateway Layer (`@nestjs/throttler`)**: Ngăn chặn quá tải dựa trên địa chỉ IP.
2. **Microservice Layer (Redis TTL)**: Ngăn chặn tác vụ lặp lại dựa trên tài khoản người dùng/email.

---

## 1. Lớp thứ nhất: Lớp Mạng (Gateway Throttler)

Được cấu hình tại `ApiGatewayModule`, sử dụng thư viện `@nestjs/throttler`. Lớp này đánh giá và chặn request thuần dựa vào **IP của Client**.

### Khai báo Default (Global)
Sử dụng `ThrottlerGuard` làm Global Guard trong API Gateway để bảo vệ toàn bộ các Public API.
- **Limit mặc định**: `100 requests / 60 seconds`.
- **Áp dụng**: Tất cả các API thông thường (như Product, Category, Content) không có logic rào chắn riêng.

### Khai báo Override (Tùy chỉnh phân quyền)
Đối với những Endpoint mang tính chất nhạy cảm (như Auth) hoặc có mật độ gọi khác biệt (như Profile User), chúng ta dùng decorator `@Throttle()` để đè cấu hình:

| Endpoint Mảng | Route | Cấu hình Throttler | Mô tả |
| --- | --- | --- | --- |
| **User Profile** | `GET /users/*` | `60 req / 60s` | Giảm từ mức 300 xuống 60 cho mỗi IP một phút nhằm tránh scrape user data. |
| **Auth Căn Bản** | `POST /auth/login` <br/> `POST /auth/google` <br/> `POST /auth/register` <br/> `POST /auth/verify-email` <br/> `POST /auth/reset-password` | `5 req / 60s` | Chống vét cạn mật khẩu (Brute-force) hoặc spam đăng nhập/đăng ký tự động. |
| **Auth Cấp cứu** | `POST /auth/forgot-password` <br/> `POST /auth/resend-verification` | `3 req / 60s` | Ngăn gửi email liên tục gây rác inbox hoặc cạn kiệt tài khoản gửi mail API. |

---

## 2. Lớp thứ hai: Lớp Logic (Redis Business Layer)

Bảo mật phía Gateway bằng IP là không đủ, bởi vì kẻ tấn công có thể thay đổi Proxy, dùng Botnet (hàng vạn IP khác nhau) để nhắm mục tiêu vào **cùng một tài khoản/email**. Lớp 2 được viết riêng ở tầng logic của `AuthService` thay vì tầng Gateway.

### Ý tưởng cốt lõi
Ghi nhận lệnh (Command) từ người dùng vào **Redis** và sử dụng Time-To-Live (TTL) để khóa không cho truy xuất tiếp theo diễn ra nếu chưa hết thời gian chờ.

### Áp dụng (Ví dụ cho Resend Verification & Forgot Password)
1. Request nạp Email cần gửi lại OTP.
2. Hệ thống kiểm tra Redis: Khoá `resend_email:johndoe@example.com` có tồn tại không?
   - **Có**: Ném lỗi Exception báo người dùng thử lại sau 1 khoảng thời gian (do chưa đủ 60s cooldown).
   - **Không**: Tiến hành gửi Email.
3. Đồng thời lưu khoá Redis có cú pháp `resend_email:johndoe@example.com` kèm một TTL là `60 giây` ngay lúc gửi email xong.

### Ưu điểm
Bảo vệ chính User (hộp thư) cũng như chi phí Operation của chúng ta, **bất chấp** lượng requests đến từ bao nhiêu địa chỉ IP. 

---

## 3. Tổng kết

Kết hợp cả 2 lớp mang lại khả năng chống spam toàn diện:

- **Hacker dùng 1 IP spam 10.000 user khác nhau**: Sẽ bị vướng **Lớp 1** (API Gateway giới hạn 5 req/phút trên địa chỉ IP đó).
- **Hacker dùng 10.000 IP khác nhau spam vào 1 user**: Sẽ bị vướng **Lớp 2** (Ngăn gửi mail nếu email đó vừa được gửi cách đây ít hơn 60s).
