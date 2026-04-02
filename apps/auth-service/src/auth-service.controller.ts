import {
  AUTH_COMMANDS,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GetAuthProfilePayload,
  LoginPayload,
  LogoutPayload,
  RefreshTokenPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  RmqInterceptor,
  ValidateTokenPayload,
  VerifyEmailPayload,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  // ─── Core Auth ────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.REGISTER })
  register(@Payload() data: RegisterPayload) {
    return this.authServiceService.register(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.LOGIN })
  login(@Payload() data: LoginPayload) {
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.LOGOUT })
  logout(@Payload() data: LogoutPayload) {
    return this.authServiceService.logout(data);
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.VERIFY_EMAIL })
  verifyEmail(@Payload() data: VerifyEmailPayload) {
    return this.authServiceService.verifyEmail(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.RESEND_VERIFICATION })
  resendVerification(@Payload() data: ResendVerificationPayload) {
    return this.authServiceService.resendVerification(data);
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.REFRESH_TOKEN })
  refreshToken(@Payload() data: RefreshTokenPayload) {
    return this.authServiceService.refreshToken(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.VALIDATE_TOKEN })
  validateToken(@Payload() data: ValidateTokenPayload) {
    return this.authServiceService.validateToken(data);
  }

  // ─── Password ─────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.FORGOT_PASSWORD })
  forgotPassword(@Payload() data: ForgotPasswordPayload) {
    return this.authServiceService.forgotPassword(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.RESET_PASSWORD })
  resetPassword(@Payload() data: ResetPasswordPayload) {
    return this.authServiceService.resetPassword(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.CHANGE_PASSWORD })
  changePassword(@Payload() data: ChangePasswordPayload) {
    return this.authServiceService.changePassword(data);
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: AUTH_COMMANDS.GET_PROFILE })
  getProfile(@Payload() data: GetAuthProfilePayload) {
    return this.authServiceService.getProfile(data);
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.DELETE_ACCOUNT })
  deleteAccount(@Payload() data: { userId: string }) {
    return this.authServiceService.deleteAccount(data.userId);
  }
}
