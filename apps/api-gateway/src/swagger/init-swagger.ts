import { EnvironmentVariables } from '@app/common';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { customCss } from './custom-css';

export const initSwagger = (app: INestApplication<any>): void => {
  const configService = app.get(ConfigService<EnvironmentVariables, true>);

  // Lấy các config từ Env hoặc dùng default
  const logoUrl =
    configService.get('APP_LOGO_URL' as any) || 'https://nestjs.com/img/logo-small.svg';

  const title = 'Microservices API Documentation';
  const swaggerEndpoint = 'api-docs';

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription('Hệ thống tài liệu API cho các Microservices (Auth, User, Product)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập Access Token vào đây',
        in: 'header',
      },
      'JWT',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh Token',
        description: 'Nhập Refresh Token vào đây',
        in: 'header',
      },
      'Refresh Token',
    )
    .build();

  const document = SwaggerModule.createDocument(app as any, config);

  SwaggerModule.setup(swaggerEndpoint, app as any, document, {
    customSiteTitle: title,
    customCss: customCss(logoUrl),
    customfavIcon: logoUrl,
    swaggerUiEnabled: configService.get('ENABLE_SWAGGER'),
    swaggerOptions: {
      displayOperationId: true,
      displayRequestDuration: true,
      persistAuthorization: true,
    },
  });

  console.log(`🚀 Swagger UI is available at: /${swaggerEndpoint}`);
};
