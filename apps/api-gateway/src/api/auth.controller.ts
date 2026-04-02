import {
  AUTH_COMMANDS,
  AUTH_SERVICE,
  ChangePasswordPayload,
  CurrentUser,
  ForgotPasswordPayload,
  JwtPayload,
  LoginPayload,
  LogoutPayload,
  Public,
  RefreshTokenPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  rpcToHttp,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterPayload) {
    console.log('register', body);
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.REGISTER }, body)
      .pipe(rpcToHttp());
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() body: VerifyEmailPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.VERIFY_EMAIL }, body)
      .pipe(rpcToHttp());
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  resendVerification(@Body() body: ResendVerificationPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.RESEND_VERIFICATION }, body)
      .pipe(rpcToHttp());
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.LOGIN }, body)
      .pipe(rpcToHttp());
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.REFRESH_TOKEN }, body)
      .pipe(rpcToHttp());
  }

  // ─── Logout  (gửi kèm accessToken để blacklist) ───────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Body() body: LogoutPayload,
    @Headers('authorization') authHeader?: string,
  ) {
    const accessToken = authHeader?.split(' ')[1];
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.LOGOUT }, { ...body, accessToken })
      .pipe(rpcToHttp());
  }

  // ─── Password ─────────────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: ForgotPasswordPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.FORGOT_PASSWORD }, body)
      .pipe(rpcToHttp());
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: ResetPasswordPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.RESET_PASSWORD }, body)
      .pipe(rpcToHttp());
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Body() body: Omit<ChangePasswordPayload, 'userId'>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.authClient
      .send(
        { cmd: AUTH_COMMANDS.CHANGE_PASSWORD },
        {
          ...body,
          userId: user.sub,
        },
      )
      .pipe(rpcToHttp());
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.GET_PROFILE }, { userId: user.sub })
      .pipe(rpcToHttp());
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.DELETE_ACCOUNT }, { userId: user.sub })
      .pipe(rpcToHttp());
  }
}
