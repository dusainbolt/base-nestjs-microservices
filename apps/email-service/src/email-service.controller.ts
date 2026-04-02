import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  EMAIL_COMMANDS,
  RmqInterceptor,
  SendPasswordResetEmailPayload,
  SendVerificationEmailPayload,
  SendWelcomeEmailPayload,
} from '@app/common';
import { EmailServiceService } from './email-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class EmailServiceController {
  constructor(private readonly emailService: EmailServiceService) {}

  @MessagePattern({ cmd: EMAIL_COMMANDS.SEND_VERIFICATION })
  sendVerification(@Payload() data: SendVerificationEmailPayload) {
    return this.emailService.sendVerification(data);
  }

  @MessagePattern({ cmd: EMAIL_COMMANDS.SEND_PASSWORD_RESET })
  sendPasswordReset(@Payload() data: SendPasswordResetEmailPayload) {
    return this.emailService.sendPasswordReset(data);
  }

  @MessagePattern({ cmd: EMAIL_COMMANDS.SEND_WELCOME })
  sendWelcome(@Payload() data: SendWelcomeEmailPayload) {
    return this.emailService.sendWelcome(data);
  }
}
