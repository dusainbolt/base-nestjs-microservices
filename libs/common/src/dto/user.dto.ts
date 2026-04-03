import {
  SwaggerBoolean,
  SwaggerEmail,
  SwaggerString,
} from '../decorators/swagger.decorator';
import { ApiProperty } from '@nestjs/swagger';

// ─── SYSTEM / DEMO PAYLOADS ───────────────────────────────────────────────

export class PingUserDto {
  @SwaggerString({ example: 'ping text' })
  message: string;
}

export class WelcomeUserDto {
  @SwaggerString({ example: 'John Doe' })
  name: string;
}

// ─── PAYLOADS ───────────────────────────────────────────────────────────────

export class CreateProfileDto {
  @SwaggerString({ example: 'user-123' })
  id: string;

  @SwaggerEmail({ example: 'user@example.com' })
  email: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ required: false, example: 'John' })
  firstName?: string;

  @SwaggerString({ required: false, example: 'Doe' })
  lastName?: string;
}

export class UpdateProfileDto {
  @SwaggerString({ required: false, example: 'John' })
  firstName?: string;

  @SwaggerString({ required: false, example: 'Doe' })
  lastName?: string;

  @SwaggerString({ required: false, example: 'https://example.com/avatar.png' })
  avatar?: string;

  @SwaggerString({ required: false, example: 'Software Engineer' })
  bio?: string;

  @SwaggerString({ required: false, example: '+123456789' })
  phone?: string;

  @SwaggerString({ required: false, example: '123 Main St' })
  address?: string;

  @SwaggerString({ required: false, example: 'Asia/Ho_Chi_Minh' })
  timezone?: string;

  @SwaggerString({ required: false, example: 'vi' })
  locale?: string;
}

// ─── RESPONSES ───────────────────────────────────────────────────────────────

export class BaseResponseDto {
  @SwaggerBoolean({ example: true })
  success: boolean;

  @SwaggerString({ example: 'user-service' })
  service: string;

  @SwaggerString({ required: false, example: '2026-04-03T00:00:00Z' })
  timestamp?: string;
}

export class UserProfileResponseDto {
  @SwaggerString({ example: 'user-123' })
  id: string;

  @SwaggerEmail({ example: 'user@example.com' })
  email: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ example: 'John' })
  firstName: string;

  @SwaggerString({ example: 'Doe' })
  lastName: string;

  @SwaggerString({ required: false, example: 'https://example.com/avatar.png' })
  avatar?: string;

  @SwaggerString({ required: false, example: 'Software Engineer' })
  bio?: string;

  @SwaggerString({ required: false, example: '+123456789' })
  phone?: string;

  @SwaggerString({ required: false, example: '123 Main St' })
  address?: string;

  @SwaggerString({ example: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @SwaggerString({ example: 'vi' })
  locale: string;

  @ApiProperty({ example: '2026-04-03T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-03T00:00:00Z' })
  updatedAt: Date;
}
