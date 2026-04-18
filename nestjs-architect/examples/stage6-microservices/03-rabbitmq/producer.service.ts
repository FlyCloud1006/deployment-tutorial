// ========== RabbitMQ 生产者 ==========

import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProducerService {
  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) {}

  emitOrderCreated(order: { id: number; userId: number; total: number }) {
    this.client.emit('order.created', order);
  }

  sendEmailNotification(data: { userId: number; template: string }) {
    return this.client.send({ cmd: 'email.send' }, data);
  }
}
