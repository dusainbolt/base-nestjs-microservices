import {
  SwaggerEmail,
  SwaggerString,
} from '../decorators/swagger.decorator';

export class RegisterDto {
  @SwaggerString({ required: true, example: 'John Doe' })
  name: string;

  @SwaggerEmail({ required: true })
  email: string;

  @SwaggerString({ required: true, minLength: 6, example: 'password123' })
  password: string;
}

export class LoginDto {
  @SwaggerEmail({ required: true })
  email: string;

  @SwaggerString({ required: true, example: 'password123' })
  password: string;
}

export class LoginResponseDto {
  @SwaggerString({ example: 'access-token-123' })
  accessToken: string;

  @SwaggerString({ example: 'refresh-token-123' })
  refreshToken: string;

  @SwaggerString({ example: 'user-123' })
  userId: string;
}

export class VerifyEmailDto {
  @SwaggerString({ required: true, example: 'verification-token-123' })
  token: string;
}

export class ResendVerificationDto {
  @SwaggerEmail({ required: true })
  email: string;
}

export class RefreshTokenDto {
  @SwaggerString({ required: true, example: 'refresh-token-123' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @SwaggerEmail({ required: true })
  email: string;
}

export class ResetPasswordDto {
  @SwaggerString({ required: true, example: 'reset-token-123' })
  token: string;

  @SwaggerString({ required: true, minLength: 6, example: 'newpassword123' })
  newPassword: string;
}

export class ChangePasswordDto {
  @SwaggerString({ required: true, example: 'oldpassword123' })
  oldPassword: string;

  @SwaggerString({ required: true, minLength: 6, example: 'newpassword123' })
  newPassword: string;
}

export class LogoutDto {
  @SwaggerString({ required: true, example: 'refresh-token-123' })
  refreshToken: string;
}
