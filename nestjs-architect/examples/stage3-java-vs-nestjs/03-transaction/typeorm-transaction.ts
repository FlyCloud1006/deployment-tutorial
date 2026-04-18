// ========== TypeORM 事务（NestJS）==========
// examples/stage3-java-vs-nestjs/03-transaction/typeorm-transaction.ts

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, Order } from '../entities';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepo: any,
    private readonly orderRepo: any,
  ) {}

  async createOrder(userId: number, amount: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) throw new Error('用户不存在');

      if (user.balance < amount) {
        throw new Error('余额不足');
      }

      await queryRunner.manager.update(User, userId, {
        balance: user.balance - amount,
      });

      const order = queryRunner.manager.create(Order, {
        userId,
        amount,
        status: 'pending',
      });
      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
