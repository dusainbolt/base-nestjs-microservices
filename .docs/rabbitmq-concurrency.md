# RabbitMQ Concurrency & Scalability Logic

Tài liệu này giải thích cách hệ thống xử lý khi có **1 hoặc N yêu cầu** cùng lúc gọi vào các microservice (ví dụ: `media-service`) thông qua RabbitMQ.

---

## 1. Cơ chế Hàng đợi (FIFO - First In, First Out)
Khi API Gateway gửi lệnh sang RabbitMQ (ví dụ: `SAVE_METADATA`), yêu cầu này không được đẩy thẳng vào CPU của service mà được **xếp hàng (Queue)** tại Broker.

- **1 Request**: Message được đưa vào hàng đợi và lấy ra ngay lập tức bởi service đang rảnh.
- **N Request cùng lúc**: RabbitMQ sẽ xếp chúng thành một hàng dài. Service sẽ lấy từng message ra để xử lý theo thứ tự.

## 2. Prefetch Count (Kiểm soát "tải" trên mỗi Worker)
Trong cấu hình NestJS RMQ (thường nằm ở `main.ts` hoặc `rmq.service.ts`), có một tham số quan trọng là `prefetchCount`.

- **Mặc định**: Nếu không cấu hình, một Worker có thể nhận hàng trăm message cùng lúc (dễ gây nghẽn RAM/CPU).
- **Thực tế dự án**: Chúng ta thường set `prefetchCount: 1` hoặc `prefetchCount: 10`.
  - Nếu `prefetchCount: 1`: Service chỉ "ăn" 1 message, xử lý xong `ack` (xác nhận) rồi mới nhận tiếp cái thứ 2.
  - Điều này giúp server **không bao giờ bị quá tải** (OOM - Out of Memory) vì nó tự giới hạn sức ăn của mình.

## 3. Horizontal Scaling (Quy tắc Round-Robin)
Đây là điểm mạnh nhất của RabbitMQ. Nếu bạn chạy **3 instance** của `media-service` cùng lúc:

1. RabbitMQ sẽ quan sát có 3 "miệng ăn" đang kết nối vào cùng 1 hàng đợi.
2. Nó sẽ chia đều message (Round-Robin):
   - Request 1 -> Instance A
   - Request 2 -> Instance B
   - Request 3 -> Instance C
   - Request 4 -> Quay lại Instance A
3. **Kết quả**: Hệ thống xử lý được gấp 3 lần tải (Parallelism) mà code không cần thay đổi gì.

## 4. Bảo vệ dữ liệu khi có lỗi
- **Ack (Acknowledgement)**: Yêu cầu chỉ bị xóa khỏi hàng đợi khi service báo: "Tôi đã xử lý xong và lưu DB thành công".
- **Lỗi & Retry**: Nếu trong lúc xử lý `media-service` bị sập (Crash), message đó sẽ tự động quay ngược lại hàng đợi để thằng khác (Instance B hoặc C) xử lý giúp.

## 5. Tóm tắt kịch bản "N request cùng lúc"
- **Tại Gateway**: Các request HTTP vẫn mở (Waiting).
- **Tại RabbitMQ**: N message nằm trong hàng đợi.
- **Tại Media-Service**: Các Worker "miệt mài" gắp message ra xử lý theo năng lực CPU.
- **Hiệu quả**: Hệ thống không bị sập, tải được dàn đều, và mọi request cuối cùng đều sẽ có phản hồi (trừ khi timeout).

---
> [!TIP]
> Để tăng tốc độ khi tải cao, bạn chỉ cần scale up số lượng pod/container của service đó lên. RabbitMQ sẽ tự biết cách phân phối.
