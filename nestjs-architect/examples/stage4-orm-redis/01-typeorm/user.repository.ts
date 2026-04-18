// ========== User Repository ==========

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: Partial<User>): Promise<User> {
    return this.repo.save(this.repo.create(dto));
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findAll(params: {
    page?: number; limit?: number; status?: string; keyword?: string
  }): Promise<{ list: User[]; total: number }> {
    const { page = 1, limit = 10, status, keyword } = params;
    const where: any = {};
    if (status) where.status = status;
    if (keyword) where.username = Like(`%${keyword}%`);

    const [list, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list, total };
  }

  async update(id: number, dto: Partial<User>): Promise<User> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  async countByStatus(): Promise<{ status: string; count: number }[]> {
    return this.repo
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();
  }
}
