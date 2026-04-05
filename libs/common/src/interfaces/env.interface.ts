import { Type as NestType, applyDecorators } from '@nestjs/common';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export type EnvType = 'development' | 'production' | 'staging' | 'test';

export function IsBooleanEnv() {
  return applyDecorators(
    IsBoolean(),
    Transform(({ value }) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return false;
    }),
  );
}

export function IsNumberEnv() {
  return applyDecorators(
    IsNumber(),
    Type(() => Number),
  );
}

export class EnvironmentVariables {
  @IsOptional() @IsString() NODE_ENV?: EnvType;
  @IsOptional() @IsNumberEnv() PORT?: number;
  @IsOptional() @IsString() APP_URL?: string;

  // RabbitMQ
  @IsOptional() @IsString() RABBIT_MQ_URI?: string;
  @IsOptional() @IsString() RABBIT_MQ_USER_SERVICE_QUEUE?: string;
  @IsOptional() @IsString() RABBIT_MQ_LOG_SERVICE_QUEUE?: string;
  @IsOptional() @IsString() RABBIT_MQ_AUTH_SERVICE_QUEUE?: string;
  @IsOptional() @IsString() RABBIT_MQ_EMAIL_SERVICE_QUEUE?: string;
  @IsOptional() @IsString() RABBIT_MQ_PRODUCT_SERVICE_QUEUE?: string;
  @IsOptional() @IsString() RABBIT_MQ_MEDIA_SERVICE_QUEUE?: string;
  @IsOptional() @IsNumberEnv() RABBIT_MQ_PREFETCH_COUNT?: number;

  // PostgreSQL
  @IsOptional() @IsString() AUTH_DATABASE_URL?: string;
  @IsOptional() @IsString() USER_DATABASE_URL?: string;
  @IsOptional() @IsString() PRODUCT_DATABASE_URL?: string;
  @IsOptional() @IsString() MEDIA_DATABASE_URL?: string;

  // Redis
  @IsOptional() @IsString() REDIS_HOST?: string;
  @IsOptional() @IsNumberEnv() REDIS_PORT?: number;
  @IsOptional() @IsNumberEnv() REDIS_DB?: number;
  @IsOptional() @IsString() REDIS_PASSWORD?: string;

  // JWT
  @IsOptional() @IsString() JWT_SECRET?: string;
  @IsOptional() @IsString() JWT_EXPIRES_IN?: string;
  @IsOptional() @IsString() JWT_REFRESH_EXPIRES_IN?: string;

  // Email / SMTP
  @IsOptional() @IsString() MAIL_HOST?: string;
  @IsOptional() @IsNumberEnv() MAIL_PORT?: number;
  @IsOptional() @IsString() MAIL_USER?: string;
  @IsOptional() @IsString() MAIL_PASS?: string;
  @IsOptional() @IsString() MAIL_FROM?: string;
  @IsOptional() @IsString() MAIL_FROM_NAME?: string;

  // S3 / S3-compatible
  @IsOptional() @IsString() AWS_S3_BUCKET_NAME?: string;
  @IsOptional() @IsString() AWS_REGION?: string;
  @IsOptional() @IsString() AWS_ENDPOINT?: string; // Custom endpoint cho S3-compatible (MinIO, DO Spaces, ...)
  @IsOptional() @IsString() AWS_ACCESS_KEY_ID?: string;
  @IsOptional() @IsString() AWS_SECRET_KEY?: string;

  // Swagger and Branding
  @IsOptional() @IsString() APP_LOGO_URL?: string;
  @IsOptional() @IsBooleanEnv() ENABLE_SWAGGER?: boolean;
}

/**
 * Hàm validate & transform dữ liệu từ .env
 */
export function validateEnv<T extends object>(cls: NestType<T>) {
  return (config: Record<string, unknown>) => {
    const validatedConfig = plainToInstance(cls, config, {
      enableImplicitConversion: false, // Tắt ép kiểu ngầm định để tránh lỗi Boolean("false") === true
    });
    const errors = validateSync(validatedConfig, {
      skipMissingProperties: true, // Cho phép thiếu biến (vì mỗi service dùng biến khác nhau)
    });

    if (errors.length > 0) {
      console.error('❌ Environment validation failed:', errors.toString());
      throw new Error('Config validation error');
    }
    return validatedConfig;
  };
}
