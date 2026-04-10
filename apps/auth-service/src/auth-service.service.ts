import {
  DOMAIN_EVENTS,
  DomainEventPublisher,
  EMAIL_COMMANDS,
  EMAIL_SERVICE,
  EnvironmentVariables,
  USER_COMMANDS,
  USER_SERVICE,
  REDIS_KEYS,
  REDIS_TTL,
} from '@app/common';
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
  LoginResponseDto,
  AuthUserResponseDto,
  JwtPayload,
  UserRole,
} from '@app/common/dto/auth.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthServiceService {
  private readonly logger = new Logger(AuthServiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
    @Inject(EMAIL_SERVICE) private readonly emailClient: ClientProxy,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    private readonly domainEvents: DomainEventPublisher,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  REGISTER
  // ═══════════════════════════════════════════════════════════════════════════

  async register(payload: RegisterDto) {
    const { email, password, username, firstName = '', lastName = '' } = payload;

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === email ? 'Email already registered' : 'Username already taken',
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email, username, password: passwordHash, firstName, lastName },
    });

    // Tạo OTP → Redis TTL 15m
    const otp = this.generateOtp();
    await this.redis.setEmailVerifyOtp(user.id, otp);

    // Emit tới email-service (fire-and-forget qua RMQ, không block)
    this.emailClient.emit(
      { cmd: EMAIL_COMMANDS.SEND_VERIFICATION },
      { to: user.email, username: user.username, code: otp },
    );

    // Emit tới user-service để tạo profile rỗng (event-driven)
    this.userClient.emit(
      { cmd: USER_COMMANDS.CREATE_PROFILE },
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName,
        lastName,
      },
    );

    this.logger.log(`User registered: ${user.email} (id=${user.id})`);

    return {
      message: 'Registration successful! Please check your email for the verification code.',
      userId: user.id,
      email: user.email,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  VERIFY EMAIL
  // ═══════════════════════════════════════════════════════════════════════════

  async verifyEmail(payload: VerifyEmailDto) {
    const { email, code } = payload;

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isEmailVerified: true, username: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email is already verified');

    const storedOtp = await this.redis.getEmailVerifyOtp(user.id);

    if (!storedOtp)
      throw new BadRequestException('Verification code has expired. Please request a new one.');

    if (storedOtp !== code) throw new BadRequestException('Invalid verification code');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    await this.redis.deleteEmailVerifyOtp(user.id);

    // Gửi welcome email sau khi verify thành công
    this.emailClient.emit(
      { cmd: EMAIL_COMMANDS.SEND_WELCOME },
      { to: email, username: user.username },
    );

    this.logger.log(`Email verified: ${email}`);
    return { message: 'Email verified successfully. You can now log in.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  RESEND VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  async resendVerification(payload: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, isEmailVerified: true, email: true, username: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email is already verified');

    // Rate-limit: Chỉ cho phép gửi lại sau 1 phút
    const ttl = await this.redis.getEmailVerifyTtl(user.id);
    if (ttl > REDIS_TTL.EMAIL_VERIFY - 60)
      throw new BadRequestException('Please wait 1 minute before requesting another code.');

    const otp = this.generateOtp();
    await this.redis.setEmailVerifyOtp(user.id, otp);

    this.emailClient.emit(
      { cmd: EMAIL_COMMANDS.SEND_VERIFICATION },
      { to: user.email, username: user.username, code: otp },
    );

    return { message: 'Verification code sent. Please check your email.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  LOGIN
  // ═══════════════════════════════════════════════════════════════════════════

  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = payload;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid email or password');

    if (!user.isActive)
      throw new ForbiddenException('Account is disabled. Please contact support.');

    if (!user.isEmailVerified)
      throw new ForbiddenException(
        'Email not verified. Please check your inbox for the verification code.',
      );

    this.logger.log(`User logged in: ${email}`);
    return this.generateTokenPair(user);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  REFRESH TOKEN
  // ═══════════════════════════════════════════════════════════════════════════

  async refreshToken(payload: RefreshTokenDto): Promise<LoginResponseDto> {
    const tokenData = await this.redis.getRefreshToken(payload.refreshToken);

    if (!tokenData)
      throw new UnauthorizedException(
        'Refresh token is invalid or has expired. Please log in again.',
      );

    const user = await this.prisma.user.findUnique({
      where: { id: tokenData.userId },
    });

    if (!user || !user.isActive)
      throw new UnauthorizedException('User account is no longer active');

    await this.redis.deleteRefreshToken(payload.refreshToken);
    this.logger.log(`Token rotated for userId=${user.id}`);
    return this.generateTokenPair(user);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  LOGOUT
  // ═══════════════════════════════════════════════════════════════════════════

  async logout(payload: LogoutDto & { accessToken?: string }) {
    const { refreshToken, accessToken } = payload;

    await this.redis.deleteRefreshToken(refreshToken);

    if (accessToken) {
      try {
        const decoded = this.jwt.decode(accessToken) as JwtPayload & {
          jti?: string;
          exp?: number;
        };
        if (decoded?.jti && decoded?.exp) {
          const remaining = decoded.exp - Math.floor(Date.now() / 1000);
          await this.redis.blacklistToken(decoded.jti, remaining);
        }
      } catch {
        /* bỏ qua */
      }
    }

    this.logger.log('User logged out');
    return { message: 'Logged out successfully' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FORGOT PASSWORD
  // ═══════════════════════════════════════════════════════════════════════════

  async forgotPassword(payload: ForgotPasswordDto) {
    const SAFE_MSG = 'If this email is registered, you will receive a password reset link shortly.';

    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, email: true, username: true, isActive: true },
    });

    if (!user || !user.isActive) return { message: SAFE_MSG };

    const isRateLimited = await this.redis.isForgotPasswordRateLimited(user.id);
    if (isRateLimited) {
      throw new BadRequestException('Please wait a moment before requesting another link.');
    }

    const resetTokenId = randomUUID();
    await this.redis.setPasswordResetToken(resetTokenId, user.id);
    await this.redis.setForgotPasswordRateLimit(user.id);
    this.emailClient.emit(
      { cmd: EMAIL_COMMANDS.SEND_PASSWORD_RESET },
      { to: user.email, username: user.username, resetToken: resetTokenId },
    );

    this.logger.log(`Password reset requested: ${user.email}`);
    return { message: SAFE_MSG };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  RESET PASSWORD
  // ═══════════════════════════════════════════════════════════════════════════

  async resetPassword(payload: ResetPasswordDto) {
    const userId = await this.redis.getPasswordResetToken(payload.token);

    if (!userId)
      throw new BadRequestException(
        'Reset link is invalid or has expired. Please request a new one.',
      );

    const passwordHash = await bcrypt.hash(payload.newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    await this.redis.deletePasswordResetToken(payload.token);

    this.logger.log(`Password reset for userId=${userId}`);
    return { message: 'Password has been reset successfully. Please log in.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHANGE PASSWORD
  // ═══════════════════════════════════════════════════════════════════════════

  async changePassword(payload: ChangePasswordDto & { userId: string }) {
    const { userId, currentPassword, newPassword } = payload;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');
    if (!(await bcrypt.compare(currentPassword, user.password)))
      throw new UnauthorizedException('Current password is incorrect');
    if (currentPassword === newPassword)
      throw new BadRequestException('New password must be different from the current one');

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    this.logger.log(`Password changed for userId=${userId}`);
    return { message: 'Password changed successfully.' };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    await this.prisma.user
      .delete({
        where: { id: userId },
      })
      .catch(() => {});

    await this.redis.deleteUserProfileCache(userId);

    await this.domainEvents.publish(DOMAIN_EVENTS.USER_DELETED, {
      userId,
      timestamp: Date.now(),
    });

    this.logger.log(`Account deleted for userId=${userId}. Domain event [user.deleted] emitted.`);
    return { message: 'Account deleted successfully' };
  }

  async getProfile(payload: { userId: string }): Promise<AuthUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as unknown as UserRole,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async validateToken(payload: { accessToken: string }): Promise<JwtPayload> {
    try {
      const decoded = await this.jwt.verifyAsync<JwtPayload & { jti?: string }>(
        payload.accessToken,
      );
      if (decoded.jti && (await this.redis.isTokenBlacklisted(decoded.jti)))
        throw new UnauthorizedException('Token has been revoked');
      return decoded;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  private async generateTokenPair(user: {
    id: string;
    email: string;
    username: string;
    role: string;
  }): Promise<LoginResponseDto> {
    const jti = randomUUID();

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        jti,
      },
      { expiresIn: this.config.get('JWT_EXPIRES_IN') },
    );

    const refreshTokenId = randomUUID();
    await this.redis.setRefreshToken(refreshTokenId, {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
      jti,
    });

    return {
      accessToken,
      refreshToken: refreshTokenId,
      expiresIn: this.parseExpiresIn(this.config.get('JWT_EXPIRES_IN')),
      tokenType: 'Bearer',
      userId: user.id,
    };
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return parseInt(match[1], 10) * (multipliers[match[2]] ?? 1);
  }
}
