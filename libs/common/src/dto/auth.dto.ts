import {
  SwaggerEmail,
  SwaggerString,
} from '../decorators/swagger.decorator';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// ─── JWT PAYLOAD ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;        // userId (compatibility)
  id: string;         // userId (standard)
  email: string;
  username: string;
  role: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  iat?: number;
  exp?: number;
  jti?: string;
}

export class UserDeletedEvent {
  @SwaggerString({ description: 'ID of the deleted user' })
  userId: string;

  @ApiProperty({ description: 'Timestamp of deletion' })
  timestamp: number;
}

// ─── PAYLOADS ────────────────────────────────────────────────────────────────

export class RegisterDto {
  @SwaggerEmail()
  email: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ minLength: 6, example: 'password123' })
  password: string;

  @SwaggerString({ required: false, example: 'John' })
  firstName?: string;

  @SwaggerString({ required: false, example: 'Doe' })
  lastName?: string;
}

export class LoginDto {
  @SwaggerEmail()
  email: string;

  @SwaggerString({ example: 'password123' })
  password: string;
}

export class VerifyEmailDto {
  @SwaggerEmail()
  email: string;

  @SwaggerString({ example: '123456' })
  code: string;
}

export class ResendVerificationDto {
  @SwaggerEmail()
  email: string;
}

export class RefreshTokenDto {
  @SwaggerString({ example: 'refresh-token-123' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @SwaggerEmail()
  email: string;
}

export class ResetPasswordDto {
  @SwaggerString({ example: 'reset-token-123' })
  token: string;

  @SwaggerString({ minLength: 6, example: 'newpassword123' })
  newPassword: string;
}

export class ChangePasswordDto {
  @SwaggerString({ example: 'oldpassword123' })
  currentPassword: string;

  @SwaggerString({ minLength: 6, example: 'newpassword123' })
  newPassword: string;
}

export class LogoutDto {
  @SwaggerString({ example: 'refresh-token-123' })
  refreshToken: string;
}

// ─── RESPONSES ───────────────────────────────────────────────────────────────

export class LoginResponseDto {
  @SwaggerString({ example: 'access-token-123' })
  accessToken: string;

  @SwaggerString({ example: 'refresh-token-123' })
  refreshToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @SwaggerString({ example: 'Bearer' })
  tokenType: string;

  @SwaggerString({ example: 'user-id-123' })
  userId: string;
}

export class AuthUserResponseDto {
  @SwaggerString({ example: 'user-123' })
  id: string;

  @SwaggerEmail({ example: 'johndoe@example.com' })
  email: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ example: 'John' })
  firstName: string;

  @SwaggerString({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}
