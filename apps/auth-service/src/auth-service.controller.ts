import { AUTH_COMMANDS, RmqInterceptor } from '@app/common';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '@app/common/dto/auth.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class AuthServiceController {
  constructor(
    private readonly authServiceService: AuthServiceService,
    private readonly prisma: PrismaService,
  ) {}

  @MessagePattern({ cmd: AUTH_COMMANDS.PING })
  async ping() {
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'down';
    }
    return { db: dbStatus };
  }

  // ─── Core Auth ────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.REGISTER })
  register(@Payload() data: RegisterDto) {
    return this.authServiceService.register(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.LOGIN })
  login(@Payload() data: LoginDto) {
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.LOGOUT })
  logout(@Payload() data: LogoutDto & { accessToken?: string }) {
    return this.authServiceService.logout(data);
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.VERIFY_EMAIL })
  verifyEmail(@Payload() data: VerifyEmailDto) {
    return this.authServiceService.verifyEmail(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.RESEND_VERIFICATION })
  resendVerification(@Payload() data: ResendVerificationDto) {
    return this.authServiceService.resendVerification(data);
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.REFRESH_TOKEN })
  refreshToken(@Payload() data: RefreshTokenDto) {
    return this.authServiceService.refreshToken(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.VALIDATE_TOKEN })
  validateToken(@Payload() data: { accessToken: string }) {
    return this.authServiceService.validateToken(data);
  }

  // ─── Password ─────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.FORGOT_PASSWORD })
  forgotPassword(@Payload() data: ForgotPasswordDto) {
    return this.authServiceService.forgotPassword(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.RESET_PASSWORD })
  resetPassword(@Payload() data: ResetPasswordDto) {
    return this.authServiceService.resetPassword(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.CHANGE_PASSWORD })
  changePassword(@Payload() data: ChangePasswordDto & { userId: string }) {
    return this.authServiceService.changePassword(data);
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.GET_PROFILE })
  getProfile(@Payload() data: { userId: string }) {
    return this.authServiceService.getProfile(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.DELETE_ACCOUNT })
  deleteAccount(@Payload() data: { userId: string }) {
    return this.authServiceService.deleteAccount(data.userId);
  }
}
