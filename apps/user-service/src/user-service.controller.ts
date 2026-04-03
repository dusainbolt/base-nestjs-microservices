import {
  DOMAIN_EVENTS,
  RmqInterceptor,
  USER_COMMANDS,
} from '@app/common';
import {
  CreateProfileDto,
  UpdateProfileDto,
  PingUserDto,
  WelcomeUserDto,
  GetProfilesByIdsDto,
} from '@app/common/dto/user.dto';
import { UserDeletedEvent } from '@app/common/dto/auth.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class UserServiceController {
  constructor(private readonly userService: UserServiceService) {}

  // ─── System / Demo ────────────────────────────────────────────────────────

  @MessagePattern({ cmd: USER_COMMANDS.PING })
  ping(@Payload() data: PingUserDto) {
    return { success: true, service: 'user-service', messageReceived: data };
  }

  @MessagePattern({ cmd: USER_COMMANDS.WELCOME })
  welcome(@Payload() data: WelcomeUserDto) {
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

  @EventPattern({ cmd: USER_COMMANDS.CREATE_PROFILE })
  createProfile(@Payload() data: CreateProfileDto): Promise<void> {
    return this.userService.createProfile(data);
  }

  // ─── Profile — Request/Response (từ api-gateway) ──────────────────────────

  @MessagePattern({ cmd: USER_COMMANDS.GET_PROFILE })
  getProfile(@Payload() data: { userId: string }) {
    return this.userService.getProfile(data);
  }

  @MessagePattern({ cmd: USER_COMMANDS.GET_PROFILES_BY_IDS })
  getProfilesByIds(@Payload() data: GetProfilesByIdsDto) {
    return this.userService.getProfilesByIds(data);
  }

  @MessagePattern({ cmd: USER_COMMANDS.UPDATE_PROFILE })
  updateProfile(@Payload() data: UpdateProfileDto & { userId: string }) {
    return this.userService.updateProfile(data);
  }

  // ─── Domain Event Handlers (Exchange Pub/Sub) ─────────────────────────────

  @EventPattern(DOMAIN_EVENTS.USER_DELETED)
  handleUserDeleted(@Payload() event: UserDeletedEvent) {
    return this.userService.deleteProfile(event.userId);
  }
}
