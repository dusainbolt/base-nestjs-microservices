// Prisma 7: file cấu hình CLI (migrate, generate, studio...)
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Tách riêng DB cho user-service
    url: env('USER_DATABASE_URL'),
  },
});
