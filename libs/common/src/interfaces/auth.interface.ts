// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// ─── Payloads (Client → Auth-Service via RabbitMQ) ────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface GetAuthProfilePayload {
  userId: string;
}

export interface ValidateTokenPayload {
  accessToken: string;
}

// ─── JWT Payload (inside token) ───────────────────────────────────────────────

export interface JwtPayload {
  sub: string;        // userId (tương thích ngược)
  id: string;         // userId (chuẩn từ database)
  email: string;
  username: string;
  role: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  iat?: number;
  exp?: number;
  jti?: string;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;   // seconds
  tokenType: 'Bearer';
}

/** Response từ auth-service: thông tin auth user (role, verified status) */
export interface AuthUserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}
