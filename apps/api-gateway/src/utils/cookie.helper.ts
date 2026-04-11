import { Response } from 'express';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Set accessToken và refreshToken vào HttpOnly cookies.
 * - access_token: path=/ (gửi kèm mọi request)
 * - refresh_token: path=/auth (chỉ gửi khi gọi /auth/* endpoints)
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  // Access token: short-lived
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    path: '/',
    maxAge: expiresIn * 1000, // convert seconds to ms
  });

  // Refresh token: long-lived (7 days)
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    path: '/auth', // chỉ gửi khi gọi /auth/* endpoints
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/**
 * Clear mọi auth cookies (dùng khi logout).
 */
export function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/auth' });
}
