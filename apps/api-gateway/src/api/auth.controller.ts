import {
  AUTH_COMMANDS,
  AUTH_SERVICE,
  ApiHandleResponse,
  CurrentUser,
  JwtPayload,
  Public,
  rpcToHttp,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '@app/common/dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @ApiHandleResponse({
    summary: 'Register a new account',
    type: Object,
    httpStatus: HttpStatus.CREATED,
  })
  register(@Body() body: RegisterDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.REGISTER }, body)
      .pipe(rpcToHttp());
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  @Public()
  @Post('verify-email')
  @ApiHandleResponse({
    summary: 'Verify email using token',
    type: Object,
  })
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.VERIFY_EMAIL }, body)
      .pipe(rpcToHttp());
  }

  @Public()
  @Post('resend-verification')
  @ApiHandleResponse({
    summary: 'Resend verification email',
    type: Object,
  })
  resendVerification(@Body() body: ResendVerificationDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.RESEND_VERIFICATION }, body)
      .pipe(rpcToHttp());
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @ApiHandleResponse({
    summary: 'Login with email and password',
    type: LoginResponseDto,
  })
  login(@Body() body: LoginDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.LOGIN }, body)
      .pipe(rpcToHttp());
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @ApiHandleResponse({
    summary: 'Refresh access token using refresh token',
    type: Object,
  })
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.REFRESH_TOKEN }, body)
      .pipe(rpcToHttp());
  }

  // ─── Logout  (gửi kèm accessToken để blacklist) ───────────────────────────

  @ApiBearerAuth('JWT')
  @Post('logout')
  @ApiHandleResponse({
    summary: 'Logout and invalidate refresh token',
    type: Object,
  })
  logout(@Body() body: LogoutDto, @Req() req: any) {
    const accessToken = req.headers['authorization']?.split(' ')[1];
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.LOGOUT }, { ...body, accessToken })
      .pipe(rpcToHttp());
  }

  // ─── Password ─────────────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @ApiHandleResponse({
    summary: 'Request password reset email',
    type: Object,
  })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.FORGOT_PASSWORD }, body)
      .pipe(rpcToHttp());
  }

  @Public()
  @Post('reset-password')
  @ApiHandleResponse({
    summary: 'Reset password using token',
    type: Object,
  })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.RESET_PASSWORD }, body)
      .pipe(rpcToHttp());
  }

  @ApiBearerAuth('JWT')
  @Post('change-password')
  @ApiHandleResponse({
    summary: 'Change password while logged in',
    type: Object,
  })
  changePassword(
    @Body() body: ChangePasswordDto,
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

  @ApiBearerAuth('JWT')
  @Get('me')
  @ApiHandleResponse({
    summary: 'Get current user profile',
    type: Object,
  })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.GET_PROFILE }, { userId: user.sub })
      .pipe(rpcToHttp());
  }

  @ApiBearerAuth('JWT')
  @Delete('me')
  @ApiHandleResponse({
    summary: 'Permanently delete user account',
    type: Object,
  })
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.DELETE_ACCOUNT }, { userId: user.sub })
      .pipe(rpcToHttp());
  }
}
