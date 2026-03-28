# System Architecture — NestJS Microservices

## Tổng quan

Hệ thống sử dụng kiến trúc **Microservices** với **NestJS Monorepo**, giao tiếp bất đồng bộ qua **RabbitMQ** và xác thực tập trung qua **Keycloak**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Web / Mobile)                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP (REST)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Port 3000)                      │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Auth Guard │  │   Routing    │  │  RabbitMQ ClientProxy   │  │
│  │ (Keycloak) │  │ (REST → RMQ) │  │  (USER, LOG services)  │  │
│  └────────────┘  └──────────────┘  └─────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ AMQP (RabbitMQ)
                    ┌──────────┴──────────┐
                    ▼                     ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   USER SERVICE (RMQ)     │  │    LOG SERVICE (RMQ)     │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ @MessagePattern     │  │  │  │ @EventPattern      │  │
│  │ CRUD User Profile  │  │  │  │ Receive & Forward  │  │
│  │ Web3 Wallet        │  │  │  │ Logs → ELK Stack   │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
│  ┌────────────────────┐  │  └──────────────────────────┘
│  │   PostgreSQL DB    │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## Thành phần hệ thống

### 1. API Gateway (`apps/api-gateway`)
| Thuộc tính       | Giá trị                          |
|------------------|----------------------------------|
| **Port**         | `3000`                           |
| **Vai trò**      | Entry point duy nhất cho Client  |
| **Transport**    | HTTP (nhận) → RabbitMQ (gửi)    |
| **Auth**         | Keycloak JWT Guard               |

- Nhận request HTTP từ Client.
- Xác thực JWT token thông qua Keycloak.
- Chuyển tiếp request tới các Microservice qua RabbitMQ `ClientProxy`.
- Sử dụng pattern `send()` (request-response) hoặc `emit()` (event-based).

### 2. User Service (`apps/user-service`)
| Thuộc tính       | Giá trị                          |
|------------------|----------------------------------|
| **Queue**        | `user_queue`                     |
| **Vai trò**      | Quản lý thông tin người dùng     |
| **Transport**    | RabbitMQ (lắng nghe)             |
| **Database**     | PostgreSQL                       |

- Lắng nghe message từ `user_queue`.
- Xử lý CRUD user profile, Web3 wallet.
- Sử dụng `@MessagePattern` để xử lý request-response.

### 3. Log Service (`apps/log-service`)
| Thuộc tính       | Giá trị                          |
|------------------|----------------------------------|
| **Queue**        | `log_queue`                      |
| **Vai trò**      | Thu thập và chuyển tiếp log      |
| **Transport**    | RabbitMQ (lắng nghe)             |
| **Output**       | ELK Stack (Elasticsearch)        |

- Lắng nghe log events từ `log_queue`.
- Sử dụng `@EventPattern` (fire-and-forget, không cần response).
- Chuyển tiếp log lên ELK Stack.

### 4. Common Library (`libs/common`)
- **RmqModule**: Dynamic module cung cấp cấu hình RabbitMQ Client/Server.
- **RmqService**: Helper để lấy RMQ options và acknowledge messages.
- **Constants**: Tên các service (`USER`, `LOG`) dùng chung.

---

## Infrastructure (Docker Compose)

| Service       | Image                              | Port(s)         | Thư mục                  |
|---------------|-------------------------------------|-----------------|--------------------------|
| **Keycloak**  | `quay.io/keycloak/keycloak:24.0.0` | `8080`          | `.compose/keycloak/`     |
| **PostgreSQL**| `postgres:16-alpine`               | (internal)      | `.compose/keycloak/`     |
| **RabbitMQ**  | `rabbitmq:3.13-management-alpine`  | `5672`, `15672` | `.compose/rabbitmq/`     |

---

## Luồng dữ liệu (Data Flow)

### Request-Response (User Service)
```
Client → [HTTP] → API Gateway → [RMQ send()] → user_queue → User Service
                                                              ↓
Client ← [HTTP] ← API Gateway ← [RMQ response] ← ──────────┘
```

### Event-Based (Log Service)
```
API Gateway → [RMQ emit()] → log_queue → Log Service → ELK Stack
(fire-and-forget, không chờ response)
```

---

## Cấu hình môi trường (.env)

```env
# RabbitMQ
RABBIT_MQ_URI=amqp://user:password@localhost:5672
RABBIT_MQ_USER_QUEUE=user_queue
RABBIT_MQ_LOG_QUEUE=log_queue
```

---

## Cấu trúc thư mục

```
my-nestjs-microservices/
├── apps/
│   ├── api-gateway/          # HTTP Gateway → RMQ Client
│   │   └── src/
│   │       ├── main.ts
│   │       ├── api-gateway.module.ts
│   │       └── api-gateway.controller.ts
│   ├── user-service/         # RMQ Microservice
│   │   └── src/
│   │       ├── main.ts
│   │       ├── user-service.module.ts
│   │       └── user-service.controller.ts
│   └── log-service/          # RMQ Microservice
│       └── src/
│           ├── main.ts
│           ├── log-service.module.ts
│           └── log-service.controller.ts
├── libs/
│   └── common/               # Shared Library
│       └── src/
│           ├── index.ts
│           ├── rmq/
│           │   ├── rmq.module.ts
│           │   └── rmq.service.ts
│           └── constants/
│               └── services.ts
├── .compose/                  # Docker Compose configs
│   ├── keycloak/
│   └── rabbitmq/
├── .docs/                     # Documentation
├── .env                       # Environment variables
└── nest-cli.json              # Monorepo config
```
