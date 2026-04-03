import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CurrentUser,
  JwtPayload,
  Public,
  USER_COMMANDS,
  USER_SERVICE,
  WelcomeUserDto,
  PingUserDto,
} from '@app/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Public()
  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Public()
  @Get('public')
  publicEndpoint() {
    return {
      message: 'This is a PUBLIC endpoint, no token required.',
      status: 'success',
    };
  }

  // ─── Protected ────────────────────────────────────────────────────────────

  @Get('private')
  privateEndpoint() {
    return {
      message: 'This is a PRIVATE endpoint, a valid JWT is required.',
      status: 'authenticated',
    };
  }

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Your Profile (from JWT)',
      user: {
        id: user.sub,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  // ─── User Service ─────────────────────────────────────────────────────────

  @Get('ping-user')
  pingUser() {
    return this.userClient.send<any, PingUserDto>(
      { cmd: USER_COMMANDS.PING },
      { message: 'Hello from Gateway' },
    );
  }

  @Get('welcome')
  getWelcome() {
    return this.userClient.send<any, WelcomeUserDto>(
      { cmd: USER_COMMANDS.WELCOME },
      { name: 'Dusainbolt' },
    );
  }

  @Get('trigger-error')
  triggerError() {
    return this.userClient.send(
      { cmd: USER_COMMANDS.TRIGGER_ERROR },
      { time: new Date().toISOString() },
    );
  }
}
