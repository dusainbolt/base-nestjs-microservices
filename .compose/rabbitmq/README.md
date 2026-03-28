# Hướng dẫn Chạy và Sử dụng RabbitMQ với Docker Compose

Tài liệu này hướng dẫn cách triển khai và cấu hình cơ bản RabbitMQ sử dụng Docker Compose trong môi trường phát triển (Development).

## 1. Yêu cầu hệ thống
- Đã cài đặt **Docker** và **Docker Compose**.
- Đảm bảo cổng `5672` (AMQP) và `15672` (Management UI) không bị xung đột với các service khác.

## 2. Cách chạy RabbitMQ

Di chuyển vào thư mục chứa file `docker-compose.yml`:
```bash
cd compose/rabbitmq
```

### Chạy dịch vụ RabbitMQ
Sử dụng lệnh sau để khởi chạy:
```bash
docker compose up -d
```

### Kiểm tra trạng thái
```bash
docker compose ps
```
Đảm bảo `nestjs_rabbitmq` ở trạng thái `Up`.

### Xem log (nếu cần debug)
```bash
docker compose logs -f rabbitmq
```

---

## 3. Thông tin truy cập và Đăng nhập

Sau khi service khởi động thành công, bạn có thể truy cập vào giao diện quản trị:

- **Management UI**: [http://localhost:15672](http://localhost:15672)
- **AMQP URL**: `amqp://user:password@localhost:5672`

### Tài khoản quản trị (Admin Credentials)
Dựa trên cấu hình trong `docker-compose.yml`:
- **Username**: `user`
- **Password**: `password`

---

## 4. Hướng dẫn sử dụng cơ bản sau khi chạy

### Bước 1: Kiểm tra kết nối qua Management UI
1. Truy cập [http://localhost:15672](http://localhost:15672).
2. Đăng nhập bằng tài khoản `user` / `password`.
3. Tab **Overview**: Xem tổng quan về node, connections, channels.

### Bước 2: Kiểm tra Queues
1. Chọn tab **Queues and Streams** trên thanh menu.
2. Khi các NestJS Microservices kết nối, bạn sẽ thấy các queue tự động được tạo:
   - `user_queue` — dùng cho User Service.
   - `log_queue` — dùng cho Log Service.

### Bước 3: Kết nối từ NestJS
Trong file `.env` của project NestJS, thêm:
```env
RABBIT_MQ_URI=amqp://user:password@localhost:5672
RABBIT_MQ_USER_QUEUE=user_queue
RABBIT_MQ_LOG_QUEUE=log_queue
```

---

## 5. Các lệnh thường dùng khác

### Dừng dịch vụ
```bash
docker compose stop
```

### Xóa bỏ container (Giữ lại dữ liệu)
```bash
docker compose down
```

### Xóa bỏ hoàn toàn (Bao gồm cả dữ liệu)
```bash
docker compose down -v
```

### Khởi động lại
```bash
docker compose restart
```

---

## 6. Cấu hình chi tiết (docker-compose.yml)
- **Image**: `rabbitmq:3.13-management-alpine` (bao gồm Management Plugin).
- **Cổng AMQP**: `5672` — Cổng giao tiếp chính cho các ứng dụng.
- **Cổng Management**: `15672` — Giao diện web để quản trị.
- **Dữ liệu**: Được lưu trữ tại volume `rabbitmq_data` để không bị mất khi xóa container.
- **Network**: Sử dụng network `nestjs_network` (bridge) để các service NestJS có thể kết nối khi chạy trong Docker.
