import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_KEYS, REDIS_TTL, UserRole } from '@app/common';

// ─── Stored Shapes ────────────────────────────────────────────────────────────

export interface RefreshTokenData {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  jti: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /** Expose raw client for special cases (like TTL check) if needed,
   * but prefer using the helper methods below. */
  getClient(): Redis {
    return this.redis;
  }

  // ─── Refresh Token ───────────────────────────────────────────────────────────

  async setRefreshToken(
    tokenId: string,
    data: RefreshTokenData,
  ): Promise<void> {
    const key = REDIS_KEYS.AUTH.REFRESH_TOKEN(tokenId);
    await this.redis.set(
      key,
      JSON.stringify(data),
      'EX',
      REDIS_TTL.REFRESH_TOKEN,
    );
  }

  async getRefreshToken(tokenId: string): Promise<RefreshTokenData | null> {
    const key = REDIS_KEYS.AUTH.REFRESH_TOKEN(tokenId);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as RefreshTokenData;
  }

  async deleteRefreshToken(tokenId: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.REFRESH_TOKEN(tokenId);
    await this.redis.del(key);
  }

  // ─── Email Verification OTP ──────────────────────────────────────────────────

  async setEmailVerifyOtp(userId: string, code: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.EMAIL_VERIFY(userId);
    await this.redis.set(key, code, 'EX', REDIS_TTL.EMAIL_VERIFY);
  }

  async getEmailVerifyOtp(userId: string): Promise<string | null> {
    const key = REDIS_KEYS.AUTH.EMAIL_VERIFY(userId);
    return this.redis.get(key);
  }

  async deleteEmailVerifyOtp(userId: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.EMAIL_VERIFY(userId);
    await this.redis.del(key);
  }

  async getEmailVerifyTtl(userId: string): Promise<number> {
    const key = REDIS_KEYS.AUTH.EMAIL_VERIFY(userId);
    return this.redis.ttl(key);
  }

  // ─── Password Reset Token ────────────────────────────────────────────────────

  async setPasswordResetToken(tokenId: string, userId: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.PASSWORD_RESET(tokenId);
    await this.redis.set(key, userId, 'EX', REDIS_TTL.PASSWORD_RESET);
  }

  async getPasswordResetToken(tokenId: string): Promise<string | null> {
    const key = REDIS_KEYS.AUTH.PASSWORD_RESET(tokenId);
    return this.redis.get(key);
  }

  async deletePasswordResetToken(tokenId: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.PASSWORD_RESET(tokenId);
    await this.redis.del(key);
  }

  // ─── Forgot Password Rate Limit ─────────────────────────────────────────────

  async setForgotPasswordRateLimit(userId: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.RATE_LIMIT_FORGOT_PASSWORD(userId);
    await this.redis.set(key, '1', 'EX', REDIS_TTL.FORGOT_PASSWORD_RATE_LIMIT);
  }

  async isForgotPasswordRateLimited(userId: string): Promise<boolean> {
    const key = REDIS_KEYS.AUTH.RATE_LIMIT_FORGOT_PASSWORD(userId);
    const result = await this.redis.get(key);
    return !!result;
  }

  // ─── User Profile Cache ──────────────────────────────────────────────────────

  async setUserProfileCache(userId: string, data: any): Promise<void> {
    const key = REDIS_KEYS.AUTH.USER_PROFILE(userId);
    await this.redis.set(key, JSON.stringify(data), 'EX', 1800);
  }

  async deleteUserProfileCache(userId: string): Promise<void> {
    const key = REDIS_KEYS.AUTH.USER_PROFILE(userId);
    await this.redis.del(key);
  }

  // ─── JWT Blacklist (logout access token) ─────────────────────────────────────

  async blacklistToken(jti: string, ttlSec: number): Promise<void> {
    const key = REDIS_KEYS.AUTH.TOKEN_BLACKLIST(jti);
    await this.redis.set(key, '1', 'EX', ttlSec);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = REDIS_KEYS.AUTH.TOKEN_BLACKLIST(jti);
    const result = await this.redis.get(key);
    return !!result;
  }

  // ─── Generic helpers ─────────────────────────────────────────────────────────

  async ping(): Promise<string> {
    return this.redis.ping();
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }
}
