import {
  CreateProfilePayload,
  GetProfilePayload,
  PingUserPayload,
  PingUserResponse,
  RmqInterceptor,
  UpdateProfilePayload,
  USER_COMMANDS,
  WelcomeUserPayload,
  WelcomeUserResponse,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class UserServiceController {
  constructor(private readonly userService: UserServiceService) {}

  // ─── System / Demo ────────────────────────────────────────────────────────

  @MessagePattern({ cmd: USER_COMMANDS.PING })
  ping(@Payload() data: PingUserPayload): PingUserResponse {
    return { success: true, service: 'user-service', messageReceived: data };
  }

  @MessagePattern({ cmd: USER_COMMANDS.WELCOME })
  welcome(@Payload() data: WelcomeUserPayload): WelcomeUserResponse {
    return {
      success: true,
      service: 'user-service',
      message: `Chào mừng ${data.name || 'bạn'} đến với hệ thống!`,
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern({ cmd: USER_COMMANDS.TRIGGER_ERROR })
  triggerError() {
    throw new Error('DEMO_ERROR: Service failure simulation for retry flow');
  }

  // ─── Profile — Events (fire-and-forget từ auth-service) ───────────────────

  /**
   * @EventPattern: auth-service emit() tới đây sau khi register.
   * Không cần trả về response, idempotent.
   */
  @EventPattern({ cmd: USER_COMMANDS.CREATE_PROFILE })
  createProfile(@Payload() data: CreateProfilePayload): Promise<void> {
    return this.userService.createProfile(data);
  }

  // ─── Profile — Request/Response (từ api-gateway) ──────────────────────────

  @MessagePattern({ cmd: USER_COMMANDS.GET_PROFILE })
  getProfile(@Payload() data: GetProfilePayload) {
    return this.userService.getProfile(data);
  }

  @MessagePattern({ cmd: USER_COMMANDS.UPDATE_PROFILE })
  updateProfile(@Payload() data: UpdateProfilePayload) {
    return this.userService.updateProfile(data);
  }

  @EventPattern({ cmd: USER_COMMANDS.DELETE_PROFILE })
  deleteProfile(@Payload() data: { userId: string }) {
    return this.userService.deleteProfile(data.userId);
  }
}
