// ========== RabbitMQ 模块 ==========

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:password@localhost:5672'],
          queue: 'main_queue',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'dlx.exchange',
              'x-message-ttl': 86400000,
            },
          },
          noAck: false,
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class RabbitmqModule {}
