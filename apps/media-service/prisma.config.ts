// Prisma 7: file cấu hình CLI (migrate, generate, studio...)
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('MEDIA_DATABASE_URL'),
  },
});
