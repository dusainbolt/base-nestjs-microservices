import {
  EMAIL_COMMANDS,
  RmqInterceptor,
  SendPasswordResetEmailDto,
  SendVerificationEmailDto,
  SendWelcomeEmailDto,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailServiceService } from './email-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class EmailServiceController {
  constructor(private readonly emailService: EmailServiceService) {}

  @MessagePattern({ cmd: EMAIL_COMMANDS.SEND_VERIFICATION })
  sendVerification(@Payload() data: SendVerificationEmailDto) {
    return this.emailService.sendVerification(data);
  }

  @MessagePattern({ cmd: EMAIL_COMMANDS.SEND_PASSWORD_RESET })
  sendPasswordReset(@Payload() data: SendPasswordResetEmailDto) {
    return this.emailService.sendPasswordReset(data);
  }

  @MessagePattern({ cmd: EMAIL_COMMANDS.SEND_WELCOME })
  sendWelcome(@Payload() data: SendWelcomeEmailDto) {
    return this.emailService.sendWelcome(data);
  }
}
