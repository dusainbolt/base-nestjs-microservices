export interface EnvironmentVariables {
  // Server
  PORT: string;
  APP_URL: string;

  // RabbitMQ
  RABBIT_MQ_URI: string;
  RABBIT_MQ_USER_SERVICE_QUEUE: string;
  RABBIT_MQ_LOG_SERVICE_QUEUE: string;
  RABBIT_MQ_AUTH_SERVICE_QUEUE: string;
  RABBIT_MQ_EMAIL_SERVICE_QUEUE: string;
  RABBIT_MQ_PRODUCT_SERVICE_QUEUE: string;

  // PostgreSQL — tách riêng Database cho từng Service
  AUTH_DATABASE_URL: string;
  USER_DATABASE_URL: string;
  PRODUCT_DATABASE_URL: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_DB: string;
  REDIS_PASSWORD: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Email / SMTP (dùng bởi email-service)
  MAIL_HOST: string;
  MAIL_PORT: string;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_FROM: string;
  MAIL_FROM_NAME: string;
}
