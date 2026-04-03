import {
  SwaggerArray,
  SwaggerBoolean,
  SwaggerDate,
  SwaggerEmail,
  SwaggerString,
} from '../decorators/swagger.decorator';

// ─── ENUMS ────────────────────────────────────────────────────────────────

/**
 * Các quan hệ user có thể include khi query resource.
 * Dùng làm giá trị cho query param ?include=createdBy,updatedBy
 */
export enum UserRelation {
  CREATED_BY = 'createdBy',
  UPDATED_BY = 'updatedBy',
}

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

export class GetProfilesByIdsDto {
  @SwaggerArray({ type: String, example: ['user-123', 'user-456'] })
  userIds: string[];
}

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

export class UserBasicInfoDto {
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
}

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

  @SwaggerDate()
  createdAt: Date;

  @SwaggerDate()
  updatedAt: Date;
}
