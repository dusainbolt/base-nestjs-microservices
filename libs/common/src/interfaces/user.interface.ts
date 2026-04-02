// ─── System / Demo ────────────────────────────────────────────────────────────

export interface PingUserPayload {
  message: string;
}

export interface WelcomeUserPayload {
  name: string;
}

export interface BaseResponse {
  success: boolean;
  service: string;
  timestamp?: string;
}

export interface WelcomeUserResponse extends BaseResponse {
  message: string;
}

export interface PingUserResponse extends BaseResponse {
  messageReceived: PingUserPayload;
}

// ─── Profile Payloads (api-gateway / auth-service → user-service via RMQ) ────

/** Event từ auth-service: tạo profile sau khi register thành công */
export interface CreateProfilePayload {
  id: string;        // = auth User.id
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface GetProfilePayload {
  userId: string;
}

export interface UpdateProfilePayload {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  locale?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}
