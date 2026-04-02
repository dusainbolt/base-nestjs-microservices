import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';
import { EnvironmentVariables } from '../interfaces/env.interface';

interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService<EnvironmentVariables, true>) => {
              const queueName = configService.get(
                `RABBIT_MQ_${name}_QUEUE` as keyof EnvironmentVariables,
              ) as string;

              return {
                transport: Transport.RMQ,
                options: {
                  urls: [configService.get('RABBIT_MQ_URI') as string],
                  queue: queueName,
                  // Phải khai báo queueOptions giống với server (RmqService.getOptions)
                  // để tránh lỗi PRECONDITION_FAILED khi cả 2 bên cùng declare queue.
                  queueOptions: {
                    durable: true,
                  },
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
