import { SwaggerEmail, SwaggerString } from '../decorators/swagger.decorator';

export class SendVerificationEmailDto {
  @SwaggerEmail()
  to: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ example: '123456' })
  code: string;
}

export class SendPasswordResetEmailDto {
  @SwaggerEmail()
  to: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ example: 'reset-token-123' })
  resetToken: string;
}

export class SendWelcomeEmailDto {
  @SwaggerEmail()
  to: string;

  @SwaggerString({ example: 'johndoe' })
  username: string;

  @SwaggerString({ required: false, example: 'John' })
  firstName?: string;
}
