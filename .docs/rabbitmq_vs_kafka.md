# So sánh RabbitMQ và Kafka (Message Broker)

Tài liệu này cung cấp cái nhìn tổng quan về sự khác biệt giữa **RabbitMQ** (đang sử dụng) và **Kafka** (dự kiến chuyển đổi) để giúp quyết định thời điểm thích hợp cho việc di chuyển.

## 1. Bảng so sánh tổng quan

| Đặc điểm | RabbitMQ (Hiện tại) | Apache Kafka (Dự kiến) |
| :--- | :--- | :--- |
| **Kiến trúc** | Smart Broker / Dumb Consumer | Dumb Broker / Smart Consumer |
| **Lưu trữ dữ liệu** | Xóa message sau khi tiêu thụ (Ack) | Lưu trữ theo thời gian (Retention) |
| **Đơn vị giao tiếp** | Hàng đợi (Queue) & Sàn (Exchange) | Luồng sự kiện (Topic) |
| **Khả năng mở rộng** | Trung bình (Tập trung vào queues) | Rất cao (Tập trung vào partitions) |
| **Thông lượng** | ~ hàng chục nghìn message/giây | ~ hàng triệu message/giây |
| **Độ ưu tiên** | Hỗ trợ Priority Queues tốt | Không hỗ trợ trực tiếp (theo thứ tự nhận) |
| **Replay Message** | Khó khăn (phải dùng plugin) | Rất dễ (chỉ cần đổi offset) |

---

## 2. Phân tích chi tiết

### 🐇 RabbitMQ: Trọng tâm là "Hàng đợi"
- **Cách thức hoạt động**: RabbitMQ tracking trạng thái của từng message. Khi consumer nhận và ack, message biến mất khỏi queue.
- **Ưu điểm**:
    - Dễ cấu hình, hỗ trợ nhiều giao thức (AMQP, MQTT, STOMP).
    - Quản lý logic định tuyến phức tạp (Routing keys, Headers, Topic exchanges).
    - Phù hợp cho các hệ thống cần độ trễ thấp và xử lý request-response cổ điển.
- **Nhược điểm**: 
    - Hiệu năng giảm khi hàng đợi bị tích tụ quá nhiều message.
    - Khó scale theo chiều ngang (horizontal scaling) ở quy mô cực lớn.

### 🎡 Apache Kafka: Trọng tâm là "Ghi chép (Log)"
- **Cách thức hoạt động**: Kafka coi dữ liệu là một cuốn sổ nhật ký (log) chỉ ghi thêm. Broker không quan tâm consumer đã đọc đến đâu, chính consumer tự quản lý vị trí (offset) của mình.
- **Ưu điểm**:
    - Hiệu năng cực cao nhờ kỹ thuật Zero-copy và ghi đĩa tuần tự.
    - Cho phép nhiều consumer đọc cùng một dữ liệu tại các thời điểm khác nhau.
    - Hỗ trợ tốt các bài toán về Big Data và Event Sourcing.
- **Nhược điểm**:
    - Phức tạp hơn trong việc cài đặt và vận hành (Cần Zookeeper hoặc KRaft mode).
    - Không phù hợp nếu logic định tuyến (routing) của bạn cực kỳ phức tạp và thay đổi liên tục.

---

## 3. Khi nào nên dùng loại nào?

| Dùng RabbitMQ khi... | Dùng Kafka khi... |
| :--- | :--- |
| Bạn cần truyền tin tin cậy, xác nhận từng tin nhắn (Ack). | Bạn xử lý hàng triệu sự kiện mỗi giây (Logging, Tracking). |
| Bạn cần các tính năng Exchange/Routing phức tạp. | Bạn cần "re-play" (đọc lại) dữ liệu trong quá khứ. |
| Hệ thống của bạn chủ yếu là Request-Response. | Bạn đang xây dựng Event Streaming hoặc Data Pipeline. |
| Bạn ưu tiên sự đơn giản và dễ vận hành ban đầu. | Bạn cần khả năng mở rộng (Scaling) không giới hạn. |

---

## 4. Dự kiến cho Project này

Hiện tại, hệ thống vẫn duy trì **RabbitMQ** vì:
1.  **Dễ triển khai**: Đã setup ổn định với `libs/common`.
2.  **Đủ đáp ứng**: Quy mô hiện tại của các dịch vụ (User, Log) chưa yêu cầu thông lượng của Kafka.
3.  **Chi phí vận hành**: RabbitMQ tốn ít tài nguyên phần cứng hơn so với cụm Kafka.

> [!TIP]
> Chúng ta sẽ cân nhắc chuyển sang **Kafka** khi Phase 3 (Scaling Business Services) bắt đầu, lúc đó lượng logs và events từ các dịch vụ Template/Card có thể tăng đột biến.
