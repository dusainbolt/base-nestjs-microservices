# System Architecture — NestJS Microservices

## 1. Tổng quan (Overall Architecture)

Hệ thống được thiết kế theo kiến trúc **Microservices** hiện đại, sử dụng **NestJS Monorepo**. Giao tiếp chính giữa các services thông qua **RabbitMQ** (Asynchronous) và xác thực tập trung qua **Keycloak**.

```mermaid
graph TD
    Client[Client Next.js / Mobile] -- HTTP/REST --> Gateway[API Gateway :3000]
    
    subgraph "Core Services"
        Gateway -- AMQP --> UserSvc[User Service]
        Gateway -- AMQP --> AuthSvc[Auth Service / Keycloak]
    end

    subgraph "Platform Services"
        UserSvc -- Events --> LogSvc[Log Service]
        Gateway -- Events --> LogSvc
        LogSvc --> ELK[ELK Stack]
        NotificationSvc[Notification Service *]
    end

    subgraph "Business Services (Wedding Project)"
        TemplateSvc[Template Service *]
        CardSvc[Card Service *]
        InvitationSvc[Invitation Service *]
    end

    subgraph "Message Broker"
        RMQ[(RabbitMQ)]
    end

    UserSvc -.-> RMQ
    LogSvc -.-> RMQ
    Gateway -.-> RMQ
    
    style NotificationSvc stroke-dasharray: 5 5
    style TemplateSvc stroke-dasharray: 5 5
    style CardSvc stroke-dasharray: 5 5
    style InvitationSvc stroke-dasharray: 5 5
```

---

## 2. Các thành phần hệ thống

### 🧱 Core Services (Bắt buộc)
Đây là bộ xương sống của hệ thống, đảm bảo khả năng vận hành cơ bản.

*   **API Gateway (`apps/api-gateway`):**
    *   **Port:** `3000`
    *   **Vai trò:** Entry point duy nhất. Xử lý Routing, Rate limiting và chuyển tiếp request.
    *   **Tech:** NestJS (HTTP) → RabbitMQ (ClientProxy).
*   **Auth Service (Keycloak Integration):**
    *   **Vai trò:** Quản lý Login/Register, JWT, Permissions/Roles thông qua Keycloak.
    *   **Infrastructure:** Keycloak (Docker).
*   **User Service (`apps/user-service`):**
    *   **Vai trò:** Quản lý Profile user, thông tin cá nhân, Web3 Wallet. Tách biệt khỏi Auth để scale độc lập.
    *   **Database:** PostgreSQL.
*   **Message Broker (RabbitMQ):**
    *   **Vai trò:** Trái tim của sự giao tiếp (Event-driven). Đảm bảo các service lỏng lẻo (decoupled).

### ⚙️ Platform Services (Nên có)
Các service hỗ trợ giúp hệ thống chuyên nghiệp và dễ quản lý hơn.

*   **Log Service (`apps/log-service`):**
    *   **Vai trò:** Thu thập log tập trung, chuyển tiếp lên ELK Stack (Elasticsearch, Logstash, Kibana).
*   **Notification Service (Planned):**
    *   **Vai trò:** Gửi Email, SMS, Push notification. Chạy async hoàn toàn qua Message Broker.
*   **File Service (Planned):**
    *   **Vai trò:** Xử lý upload ảnh (S3/MinIO), Image resize.
*   **Monitoring:** Prometheus & Grafana (Planned).

### 🧠 Shared Library (`libs/common`)
Thư viện dùng chung cho tất cả các service để đảm bảo tính nhất quán (DRY).

*   **RmqModule:** Cấu hình chuẩn cho RabbitMQ.
*   **Logger:** Custom logger tích hợp sẵn Correlation ID.
*   **Filters/Guards:** `RpcExceptionFilter`, `AuthGuard` (Keycloak).
*   **Utils/DTOs:** Các định dạng dữ liệu dùng chung.

### 🧩 Business Services (Project Wedding)
Các service tập trung vào logic nghiệp vụ cụ thể của dự án Wedding.

*   **Template Service (Planned):** Quản lý các mẫu thiệp cưới.
*   **Card Service (Planned):** Xử lý tạo và tùy chỉnh thiệp.
*   **Invitation Service (Planned):** Quản lý danh sách khách mời và gửi lời mời.

---

## 3. Lộ trình phát triển (Roadmap)

### 🚀 Phase 1: MVP Base (Hiện tại)
*   [x] Khởi tạo Monorepo NestJS.
*   [x] Setup API Gateway & RabbitMQ.
*   [x] Triển khai User Service cơ bản.
*   [x] Tích hợp Keycloak cho Authentication.
*   [x] Xây dựng Log Service & kết nối ELK.
*   [x] Standardize Common Library (Exception, Logger).

### 🛠 Phase 2: Platform Enhancement
*   [ ] Hoàn thiện Logging (MDC, TraceID xuyên suốt services).
*   [ ] Triển khai Notification Service (Email/SMS).
*   [ ] Tích hợp Vault cho Secret Management.
*   [ ] Setup Prometheus & Grafana cho Monitoring.

### 💎 Phase 3: Business Scaling
*   [ ] Phát triển Business Services: Template, Card, Invitation.
*   [ ] Tối ưu hóa hiệu năng, Scaling pods trên Kubernetes.
*   [ ] CI/CD tự động hóa hoàn toàn.

---

## 4. Cấu trúc thư mục (Monorepo)

```text
my-nestjs-microservices/
├── apps/
│   ├── api-gateway/          # Gatekeeper cho hệ thống
│   ├── user-service/         # Nghiệp vụ người dùng
│   └── log-service/          # Thu thập và quản lý logs
├── libs/
│   └── common/               # Shared components, modules, utils
├── .compose/                  # Cấu hình Docker (Keycloak, RMQ, Postgres, ELK)
├── .docs/                     # Tài liệu kiến trúc và hướng dẫn
├── .env                       # Biến môi trường tập trung
└── nest-cli.json              # Cấu hình NestJS Workspace
```

---

## 5. Luồng dữ liệu (Data Flow)

### Request-Response (User Service)
```text
Client → [HTTP] → API Gateway → [RMQ send()] → user_queue → User Service
                                                               ↓
Client ← [HTTP] ← API Gateway ← [RMQ response] ← ──────────────┘
```

### Event-Based (Log Service)
```text
API Gateway → [RMQ emit()] → log_queue → Log Service → ELK Stack
(fire-and-forget, không chờ response)
```

---

## 6. Cấu hình môi trường tiêu chuẩn (.env)

```env
# RabbitMQ
RABBIT_MQ_URI=amqp://user:password@localhost:5672
RABBIT_MQ_USER_QUEUE=user_queue
RABBIT_MQ_LOG_QUEUE=log_queue

# Keycloak
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=my-realm
KEYCLOAK_CLIENT_ID=my-client
```
