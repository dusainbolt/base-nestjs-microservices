import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import {
  USER_SERVICE,
  USER_COMMANDS,
  WelcomeUserPayload,
  PingUserPayload,
  LoggerService,
} from '@app/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    private readonly logger: LoggerService,
    private readonly cls: ClsService,
  ) {}

  /** Đính traceId vào mọi RMQ payload để service nhận biết trace cùng request */
  private withTrace<T extends object>(payload: T): T & { _traceId: string } {
    return { ...payload, _traceId: this.cls.getId() };
  }

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Get('ping-user')
  pingUser() {
    return this.userClient.send<any, PingUserPayload>(
      { cmd: USER_COMMANDS.PING },
      this.withTrace({ message: 'Hello from Gateway' }),
    );
  }

  @Get('welcome')
  getWelcome() {
    return this.userClient.send<any, WelcomeUserPayload>(
      { cmd: USER_COMMANDS.WELCOME },
      this.withTrace({ name: 'Dusainbolt' }),
    );
  }

  @Get('simulate-logs')
  simulateAllLogs() {
    this.logger.business('Created new Web3 transaction', {
      action: 'create_transaction',
      entityId: 'tx-4567',
      status: 'SUCCESS',
    });

    this.logger.auth('warn', 'User entered wrong OTP', {
      event: 'OTP Fail',
      userId: 'usr-123',
      attemptsLeft: 2,
    });

    this.logger.system('warn', 'High RAM Usage detected', {
      cpuUsagePercentage: 45,
      ramUsageMb: 1024,
      connectionStatus: 'Stable',
    });

    return {
      success: true,
      message: 'Fired 4 different log scenarios directly using generic LoggerService!',
    };
  }

  @Get('trigger-error')
  triggerError() {
    const fakeUserData: any = null;
    return fakeUserData.propertyThatDoesNotExist;
  }

  @Get('trigger-user-error')
  triggerUserError() {
    return this.userClient.send<any, any>(
      { cmd: 'trigger_error' },
      this.withTrace({}),
    );
  }
}
