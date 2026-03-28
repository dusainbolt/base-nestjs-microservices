import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import { RmqModule } from '../rmq/rmq.module';
import { LOG_SERVICE } from '../constants/services';
import { LoggerService } from './logger.service';

interface LoggerModuleOptions {
  name: string;
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot({ name }: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        ClsModule.forRoot({
          global: true,
          // Middleware mode for HTTP requests inside an Express app
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: (req: any) => req.headers['x-trace-id'] || uuidv4(),
          },
        }),
        // Register the RabbitMQ client for LOG_SERVICE
        RmqModule.register({ name: LOG_SERVICE }),
      ],
      providers: [
        {
          provide: 'SERVICE_NAME',
          useValue: name,
        },
        LoggerService,
      ],
      exports: [LoggerService, ClsModule],
    };
  }
}
