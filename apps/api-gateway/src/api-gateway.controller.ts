import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  USER_SERVICE,
  USER_COMMANDS,
  WelcomeUserPayload,
  PingUserPayload,
} from '@app/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Get('ping-user')
  pingUser() {
    return this.userClient.send<any, PingUserPayload>(
      { cmd: USER_COMMANDS.PING },
      { message: 'Hello from Gateway' },
    );
  }

  @Get('welcome')
  getWelcome() {
    return this.userClient.send<any, WelcomeUserPayload>(
      { cmd: USER_COMMANDS.WELCOME },
      { name: 'Dusainbolt' },
    );
  }
}
