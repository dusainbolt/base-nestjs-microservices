# Quy trình Làm việc với Prisma trong Microservices Monorepo

Tài liệu này hướng dẫn cách quản lý Database dùng Prisma trong dự án của chúng ta.

---

## 1. Môi trường Development (Local)

Ở local, chúng ta tập trung vào việc thay đổi schema nhanh chóng và đồng bộ hóa với Database cá nhân.

### Các lệnh quan trọng:

| Lệnh | Ý nghĩa | Khi nào dùng? |
| :--- | :--- | :--- |
| `pnpm prisma:migrate:<service> <name>` | Tạo file migration SQL và áp dụng vào DB local. | Khi bạn **thêm/mới/sửa/xóa** bất kỳ cột/bảng nào trong `schema.prisma`. |
| `pnpm prisma:generate:<service>` | Chỉ cập nhật lại bộ "Type" (Prisma Client) trong code. | Khi bạn đổi tên model, hoặc chỉ muốn cập nhật Typescript mà không đổi DB. |
| `npx prisma studio --config <path>` | Mở giao diện xem/sửa dữ liệu trực quan trên trình duyệt. | Khi bạn muốn xem dữ liệu nhanh mà không dùng pgAdmin. |

### Quy trình sửa đổi Database:
1.  Chỉnh sửa file `schema.prisma` của service tương ứng.
2.  Chạy lệnh: `pnpm prisma:migrate:auth rename-column-xyz` (ví dụ cho auth).
3.  Prisma sẽ hỏi xác nhận (nếu có nghi ngờ đổi tên). Chọn `y/n`.
4.  Prisma tạo ra folder migration mới chứa file `migration.sql`. **Bạn phải commit folder này lên Git.**

---

## 2. Môi trường Production (Deploy)

**TUYỆT ĐỐI KHÔNG** chạy lệnh `migrate dev` trên môi trường Production vì nó có thể tự động xóa (`drop`) dữ liệu nếu phát hiện xung đột.

### Quy trình Deploy:
1.  **Build Step:** Hệ thống CI/CD sẽ chạy lệnh `prisma generate` để tạo ra bộ Client tương ứng với môi trường đó.
2.  **Migration Step:** Chạy lệnh `prisma migrate deploy`.
    *   Lệnh này chỉ đọc các file `.sql` trong folder `migrations/` mà bạn đã commit lên Git.
    *   Nó sẽ so sánh với bảng `_prisma_migrations` trên Production và chỉ chạy những file nào "còn thiếu".
    *   Nó **không bao giờ** yêu cầu reset database hay hỏi ý kiến user.

---

## 3. Đặc thù trong dự án Microservices của chúng ta

Hiện tại dự án đang cấu hình theo mô hình **Database-per-Service** (Mỗi service 1 DB riêng):

*   **Auth Service:** Database `nest_mcr_auth`
*   **User Service:** Database `nest_mcr_user`

### Tại sao lại làm vậy?
1.  **Isolation (Cô lập):** Lỗi của DB `user` không làm sập DB `auth`.
2.  **Independent Migration (Độc lập):** Bạn có thể migrate cho `auth-service` mà không cần quan tâm đến `user-service`. Dễ dàng nâng cấp hoặc chuyển đổi database cho từng service riêng lẻ sau này.

---

## 4. Các lưu ý quan trọng (Best Practices)

1.  **Đọc kỹ file SQL:** Trước khi commit folder migration, hãy mở file `migration.sql` ra đọc. Nếu thấy có dòng `DROP COLUMN` trong khi bạn chỉ muốn `RENAME` thì phải sửa lại ngay.
2.  **Thứ tự ưu tiên:** Luôn chạy Migration trước khi khởi động (start) Code mới để tránh lỗi `Table not found`.
3.  **Không sửa tay SQL cũ:** Nếu một migration đã được deploy lên production, tuyệt đối không được sửa nội dung file SQL đó. Nếu muốn sửa lỗi, hãy tạo một migration mới.

---
*Tài liệu được tạo tự động bởi Antigravity AI.*
