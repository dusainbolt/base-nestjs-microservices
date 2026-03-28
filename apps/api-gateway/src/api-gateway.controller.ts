import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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

  @Get('simulate-logs')
  simulateAllLogs() {
    // 2. Business Log
    this.logger.business('Created new Web3 transaction', {
      action: 'create_transaction',
      entityId: 'tx-4567',
      status: 'SUCCESS',
    });

    // 3. Auth Log
    this.logger.auth('warn', 'User entered wrong OTP', {
      event: 'OTP Fail',
      userId: 'usr-123',
      attemptsLeft: 2,
    });

    // 4. System/Infra Log
    this.logger.system('warn', 'High RAM Usage detected', {
      cpuUsagePercentage: 45,
      ramUsageMb: 1024,
      connectionStatus: 'Stable',
    });

    return {
      success: true,
      message:
        'Fired 4 different log scenarios directly using generic LoggerService!',
    };
  }

  @Get('trigger-error')
  triggerError() {
    // Chúng ta tạo ra 1 runtime error thực sự
    // Stack trace sẽ tự động lưu lại dòng này và file này
    const fakeUserData: any = null;
    return fakeUserData.propertyThatDoesNotExist; // Will throw "Cannot read properties of null"
  }
}
