# Hướng dẫn & Tiêu chuẩn Tạo Microservice Mới

Dự án này tuân thủ kiến trúc microservices và monorepo chặt chẽ, được điều phối qua RabbitMQ và ConfigService chung (`libs/common`). Để thêm một microservice mới, bạn cần làm đúng theo checklist dưới đây để service khởi động được và join vào hệ sinh thái một cách suôn sẻ.

## Checklist 7 Bước Tạo Mới Microservice

### 1. Khởi tạo Application
Sử dụng Nest CLI để generate ứng dụng mới vào folder `apps/`:
```bash
npx nest generate app name-service
```
*(Thay `name-service` bằng tên service cần tạo, VD: `payment-service`)*

### 2. Cấu hình `nest-cli.json`
Mở tệp `nest-cli.json` ở root, tìm block `"projects"` và đảm bảo khối JSON của service mới trỏ đúng sourceRoot và tsConfigPath:
```json
"name-service": {
  "type": "application",
  "root": "apps/name-service",
  "entryFile": "main",
  "sourceRoot": "apps/name-service/src",
  "compilerOptions": {
    "tsConfigPath": "apps/name-service/tsconfig.app.json"
  }
}
```

### 3. Đăng ký Constant Tên Service & RMQ Queue
Mỗi service cần một ID hệ thống (VD: `PAYMENT_SERVICE`).
1. Cấu hình hằng số trong `libs/common/src/constants/services.ts`:
   ```typescript
   export const PAYMENT_SERVICE = 'PAYMENT_SERVICE';
   ```
2. Mở `libs/common/src/interfaces/env.interface.ts` và thêm khai báo Type cho biến môi trường Queue:
   ```typescript
   @IsOptional() @IsString() RABBIT_MQ_PAYMENT_SERVICE_QUEUE?: string;
   ```

### 4. Bổ sung cấu hình vào `.env`
Vào file `.env`, dóng xuống phần cấu hình `RabbitMQ` và thêm tường minh queue map cho nó bắt đuôi `_queue`:
```env
RABBIT_MQ_PAYMENT_SERVICE_QUEUE=payment_queue
```

### 5. Cấu hình `scripts/services.mjs` để chạy tiện lợi
Mở `scripts/services.mjs` và thêm mapping từ khóa viết tắt vào object `services` để sau này có thể trích xuất nhanh (Ví dụ: `pnpm start:svc payment`):
```javascript
const services = {
  payment: 'payment-service',
  // ... các service khác
};
```

### 6. Chuẩn hoá Bootstrap (`main.ts`)
Microservice không dùng HTTP port mặc định của Nest, nội dung `main.ts` **phải** được chép theo format chuẩn của dự án để boot qua bộ RMQ Adapter & có đính kèm OpenTelemetry Tracing:

```typescript
// Bắt buộc gọi Tracing ngay đầu file
import { initTracing } from '../../../libs/common/src/tracing/tracing';
initTracing('name-service');

import { NAME_SERVICE, RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { NameServiceModule } from './name-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NameServiceModule);
  // Resolve RmqService từ context để map RabbitMQ Settings từ libs/common
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(NAME_SERVICE, false));
  await app.startAllMicroservices();
}
bootstrap();
```

### 7. Thiết lập Service Module (`name-service.module.ts`)
Module root cần import `ConfigModule` và `RmqModule` từ `@app/common`:
```typescript
import { EnvironmentVariables, RmqModule, validateEnv } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// imports components...

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv(EnvironmentVariables),
    }),
    RmqModule,
  ],
  controllers: [],
  providers: [],
})
export class NameServiceModule {}
```

---
**✅ Done!** Lúc này Service mới có thể bắt đầu giao tiếp với Gateway và RabbitMQ thông qua các `@MessagePattern` và `@EventPattern`. Đừng quên chạy `pnpm start:svc name` để Verify log kết nối.
