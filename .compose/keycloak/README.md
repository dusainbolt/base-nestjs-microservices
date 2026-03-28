# Hướng dẫn Chạy và Sử dụng Keycloak với Docker Compose

Tài liệu này hướng dẫn cách triển khai và cấu hình cơ bản Keycloak sử dụng Docker Compose trong môi trường phát triển (Development).

## 1. Yêu cầu hệ thống
- Đã cài đặt **Docker** và **Docker Compose**.
- Đảm bảo cổng `8080` (Keycloak) và không có xung đột với các service khác.

## 2. Cách chạy Keycloak

Di chuyển vào thư mục chứa file `docker-compose.yml`:
```bash
cd /Users/dusainbolt/Documents/vcb/vpdt-gitops-project/vpdt-document/devops/compose/keycloak
```

### Chạy các dịch vụ (Keycloak & Postgres)
Sử dụng lệnh sau để khởi chạy:
```bash
docker compose up -d
```

### Kiểm tra trạng thái
```bash
docker compose ps
```
Đảm bảo cả `keycloak_app` và `keycloak_db` đều ở trạng thái `Up`.

### Xem log (nếu cần debug)
```bash
docker compose logs -f keycloak_app
```

---

## 3. Thông tin truy cập và Đăng nhập

Sau khi service khởi động thành công, bạn có thể truy cập vào giao diện quản trị:

- **URL**: [http://localhost:8080](http://localhost:8080)
- **Administration Console**: Click vào "Administration Console" hoặc truy cập trực tiếp [http://localhost:8080/admin/](http://localhost:8080/admin/)

### Tài khoản quản trị (Admin Credentials)
Dựa trên cấu hình trong `docker-compose.yml`:
- **Username**: `admin`
- **Password**: `admin`

---

## 4. Hướng dẫn sử dụng cơ bản sau khi chạy

### Bước 1: Tạo một Realm mới
1. Đăng nhập vào Admin Console.
2. Di chuột vào menu thả xuống ở góc trên bên trái (mặc định là `master`).
3. Chọn **Create Realm**.
4. Nhập tên Realm (ví dụ: `myrealm`) và nhấn **Create**.

### Bước 2: Tạo Client (Ứng dụng kết nối)
1. Chọn Realm vừa tạo.
2. Chọn menu **Clients** ở cột bên trái.
3. Nhấn **Create client**.
4. Nhập `Client ID` (ví dụ: `myapp`) và nhấn **Next** -> **Save**.
5. Trong tab **Settings**, bạn có thể cấu hình `Valid Redirect URIs` (ví dụ: `http://localhost:3000/*` cho ứng dụng frontend).

### Bước 3: Tạo User (Người dùng)
1. Chọn menu **Users** ở cột bên trái.
2. Nhấn **Add user**.
3. Nhập `Username` và nhấn **Create**.
4. Sang tab **Credentials**, nhấn **Set password**.
5. Nhập mật khẩu, tắt mục "Temporary" nếu không muốn đổi pass lúc login lần đầu, rồi nhấn **Save**.

---

## 5. Các lệnh thường dùng khác

### Dừng dịch vụ
```bash
docker compose stop
```

### Xóa bỏ các container (Giữ lại dữ liệu database)
```bash
docker compose down
```

### Xóa bỏ hoàn toàn (Bao gồm cả dữ liệu database)
```bash
docker compose down -v
```

### Khởi động lại
```bash
docker compose restart
```

---

## 6. Cấu hình chi tiết (docker-compose.yml)
- **Database**: Sử dụng PostgreSQL 16 Alpine.
- **Dữ liệu**: Được lưu trữ tại volume `postgres_data` để không bị mất khi xóa container.
- **Chế độ chạy**: `start-dev` (KC_HOSTNAME_STRICT=false, KC_HTTP_ENABLED=true).
