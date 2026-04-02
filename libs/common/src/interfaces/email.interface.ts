// ─── Email Payloads (auth-service → email-service via RabbitMQ) ───────────────

export interface SendVerificationEmailPayload {
  to: string;
  username: string;
  code: string; // 6-digit OTP
}

export interface SendPasswordResetEmailPayload {
  to: string;
  username: string;
  resetToken: string; // UUID token
}

export interface SendWelcomeEmailPayload {
  to: string;
  username: string;
  firstName?: string;
}
