import {
  ApiHandleResponse,
  AUTH_COMMANDS,
  AUTH_SERVICE,
  CurrentUser,
  JwtPayload,
  Public,
  rpcToHttp,
} from '@app/common';
import {
  AuthUserResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  GatewayAuthResponseDto,
  GoogleLoginDto,
  LoginDto,
  LoginResponseDto,
  MessageResponseDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterResponseDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '@app/common/dto/auth.dto';
import { Body, Controller, Delete, Get, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 req/min
  @Post('register')
  @ApiHandleResponse({
    summary: 'Register a new account',
    type: RegisterResponseDto,
    httpStatus: HttpStatus.CREATED,
  })
  register(@Body() body: RegisterDto) {
    return this.authClient.send({ cmd: AUTH_COMMANDS.REGISTER }, body).pipe(rpcToHttp());
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 req/min
  @Post('verify-email')
  @ApiHandleResponse({
    summary: 'Verify email using token',
    type: MessageResponseDto,
  })
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authClient.send({ cmd: AUTH_COMMANDS.VERIFY_EMAIL }, body).pipe(rpcToHttp());
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 req/min
  @Post('resend-verification')
  @ApiHandleResponse({
    summary: 'Resend verification email',
    type: MessageResponseDto,
  })
  resendVerification(@Body() body: ResendVerificationDto) {
    return this.authClient.send({ cmd: AUTH_COMMANDS.RESEND_VERIFICATION }, body).pipe(rpcToHttp());
  }

  // ─── Login (Sets HttpOnly Cookies) ────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 req/min
  @Post('login')
  @ApiHandleResponse({
    summary: 'Login with email/username and password. Tokens are set as HttpOnly cookies.',
    type: GatewayAuthResponseDto,
  })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result: LoginResponseDto = await firstValueFrom(
      this.authClient.send({ cmd: AUTH_COMMANDS.LOGIN }, body).pipe(rpcToHttp()),
    );

    return {
      userId: result.user.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    };
  }

  // ─── Google Login (Sets HttpOnly Cookies) ─────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 req/min
  @Post('google')
  @ApiHandleResponse({
    summary: 'Login with Google ID token. Auto-registers if new user.',
    type: GatewayAuthResponseDto,
  })
  async googleLogin(@Body() body: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const result: LoginResponseDto = await firstValueFrom(
      this.authClient.send({ cmd: AUTH_COMMANDS.GOOGLE_LOGIN }, body).pipe(rpcToHttp()),
    );

    return {
      userId: result.user.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    };
  }

  // ─── Refresh Token (Reads refresh_token from cookie) ──────────────────────

  @Public()
  @Post('refresh')
  @ApiHandleResponse({
    summary: 'Refresh access token using refresh token cookie',
    type: GatewayAuthResponseDto,
  })
  @Public()
  @Post('refresh')
  @ApiHandleResponse({
    summary: 'Refresh access token',
    type: GatewayAuthResponseDto,
  })
  async refreshToken(@Body() body: RefreshTokenDto) {
    const result: LoginResponseDto = await firstValueFrom(
      this.authClient
        .send({ cmd: AUTH_COMMANDS.REFRESH_TOKEN }, { refreshToken: body.refreshToken })
        .pipe(rpcToHttp()),
    );

    return {
      userId: result.user.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    };
  }

  // ─── Logout (Clears cookies + blacklists tokens) ──────────────────────────

  @ApiBearerAuth('JWT')
  @Post('logout')
  @ApiHandleResponse({
    summary: 'Logout — invalidates tokens',
    type: MessageResponseDto,
  })
  async logout(@Req() req: Request, @Body() body: LogoutDto) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = body.refreshToken;

    // Best-effort: invalidate tokens on backend
    try {
      await firstValueFrom(
        this.authClient
          .send({ cmd: AUTH_COMMANDS.LOGOUT }, { refreshToken, accessToken })
          .pipe(rpcToHttp()),
      );
    } catch {
      // Invalidate logic even if backend has issues
    }

    return { message: 'Logged out successfully.' };
  }

  // ─── Password ─────────────────────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 req/min
  @Post('forgot-password')
  @ApiHandleResponse({
    summary: 'Request password reset email',
    type: MessageResponseDto,
  })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authClient.send({ cmd: AUTH_COMMANDS.FORGOT_PASSWORD }, body).pipe(rpcToHttp());
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 req/min
  @Post('reset-password')
  @ApiHandleResponse({
    summary: 'Reset password using token',
    type: MessageResponseDto,
  })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authClient.send({ cmd: AUTH_COMMANDS.RESET_PASSWORD }, body).pipe(rpcToHttp());
  }

  @ApiBearerAuth('JWT')
  @Post('change-password')
  @ApiHandleResponse({
    summary: 'Change password while logged in',
    type: MessageResponseDto,
  })
  changePassword(@Body() body: ChangePasswordDto, @CurrentUser() user: JwtPayload) {
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
    type: AuthUserResponseDto,
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
    type: MessageResponseDto,
  })
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.authClient
      .send({ cmd: AUTH_COMMANDS.DELETE_ACCOUNT }, { userId: user.sub })
      .pipe(rpcToHttp());
  }
}
