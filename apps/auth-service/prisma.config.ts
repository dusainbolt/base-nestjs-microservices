// Prisma 7: file cấu hình CLI (migrate, generate, studio...)
// URL kết nối DB được đặt tại đây, KHÔNG còn trong schema.prisma
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Tách riêng DB cho auth-service
    url: env('AUTH_DATABASE_URL'),
  },
});
