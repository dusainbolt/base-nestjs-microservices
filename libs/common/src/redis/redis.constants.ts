export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Tập trung tất cả các Redis Key prefixes và TTL vào một nơi duy nhất.
 */
export const REDIS_KEYS = {
  AUTH: {
    // Refresh token: auth:rt:<tokenId>
    REFRESH_TOKEN: (tokenId: string) => `auth:rt:${tokenId}`,
    
    // Email verification OTP: auth:ev:<userId>
    EMAIL_VERIFY: (userId: string) => `auth:ev:${userId}`,
    
    // Password reset token: auth:pr:<tokenId>
    PASSWORD_RESET: (tokenId: string) => `auth:pr:${tokenId}`,
    
    // Token blacklist (logout): auth:bl:<jti>
    TOKEN_BLACKLIST: (jti: string) => `auth:bl:${jti}`,
    
    // Rate limit forgot password: auth:rl:pr:<userId>
    RATE_LIMIT_FORGOT_PASSWORD: (userId: string) => `auth:rl:pr:${userId}`,

    // Cached User Profile: auth:user:profile:<userId>
    USER_PROFILE: (userId: string) => `auth:user:profile:${userId}`,
  },

  ENRICH: {
    // Cached user basic info for enrichment: enrich:user:<userId>
    USER_BASIC: (userId: string) => `enrich:user:${userId}`,
  },
};

export const REDIS_TTL = {
  REFRESH_TOKEN: 7 * 24 * 60 * 60,   // 7 days
  EMAIL_VERIFY: 15 * 60,             // 15 minutes
  PASSWORD_RESET: 60 * 60,           // 1 hour
  FORGOT_PASSWORD_RATE_LIMIT: 60,    // 1 minute
  ENRICH_USER: 30 * 60,              // 30 minutes
};
