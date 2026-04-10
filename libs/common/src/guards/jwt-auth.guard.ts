import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import Redis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../dto/auth.dto';
import { REDIS_CLIENT, REDIS_KEYS } from '../redis/redis.constants';
import { AUTH_SERVICE } from '../constants/services';
import { AUTH_COMMANDS } from '../constants/auth.constants';

/**
 * Global JWT Guard cho API Gateway.
 * - Route có @Public() sẽ bỏ qua guard.
 * - Các route còn lại yêu cầu Bearer token hợp lệ trong header Authorization.
 * - Kiểm tra token có bị blacklist (đăng xuất) hay không.
 * - Caching: Tự động lấy Profile từ Redis. Nếu cache miss -> Call AuthService.
 * - Kiểm tra user isActive.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Kiểm tra route có @Public() không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }

    // 1. Lấy thông tin Blacklist & Cache Profile từ Redis cùng lúc
    const [isBlacklisted, cachedProfile] = await Promise.all([
      this.redis.get(REDIS_KEYS.AUTH.TOKEN_BLACKLIST(payload.jti as string)),
      this.redis.get(REDIS_KEYS.AUTH.USER_PROFILE(payload.sub)),
    ]);

    if (isBlacklisted) {
      throw new UnauthorizedException('Access token has been revoked');
    }

    let userData: any = null;

    if (cachedProfile) {
      try {
        userData = JSON.parse(cachedProfile);
      } catch {
        userData = null;
      }
    }
    // 2. Nếu Cache Miss -> Bắn RPC sang AuthService lấy Profile mới
    if (!userData) {
      try {
        userData = await firstValueFrom(
          this.authClient.send({ cmd: AUTH_COMMANDS.GET_PROFILE }, { userId: payload.sub }),
        );

        // Lưu vào cache để những request sau không phải gọi nữa (TTL: 30 phút)
        await this.redis.set(
          REDIS_KEYS.AUTH.USER_PROFILE(payload.sub),
          JSON.stringify(userData),
          'EX',
          1800,
        );
      } catch (error) {
        throw new UnauthorizedException('Could not fetch user profile');
      }
    }

    // 3. Kiểm tra trạng thái User
    if (!userData || userData.isActive === false) {
      throw new ForbiddenException('Your account has been blocked');
    }

    // 4. Gắn Full Data của User vào Request (tuân thủ chuẩn auth.interface.ts mới)
    const activeUser: JwtPayload = {
      sub: userData.id || payload.sub,
      id: userData.id || payload.sub,
      email: userData.email || payload.email,
      username: userData.username || payload.username,
      role: userData.role || payload.role,
      isActive: userData.isActive,
      isEmailVerified: userData.isEmailVerified,
      iat: payload.iat,
      exp: payload.exp,
      jti: payload.jti,
    };

    request['user'] = activeUser;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
