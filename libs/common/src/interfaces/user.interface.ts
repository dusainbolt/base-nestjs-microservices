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
