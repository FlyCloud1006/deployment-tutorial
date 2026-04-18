// ========== 用户服务 ==========

import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [
    { id: 1, username: '张三', email: 'zhangsan@example.com', age: 25 },
    { id: 2, username: '李四', email: 'lisi@example.com', age: 30 },
  ];
  private nextId = 3;

  async findAll(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const list = this.users.slice(skip, skip + limit);
    return {
      list,
      pagination: { page, limit, total: this.users.length, totalPages: Math.ceil(this.users.length / limit) },
    };
  }

  async findById(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`用户 ID=${id} 不存在`);
    return user;
  }

  async create(dto: { username: string; email: string; password: string }) {
    const user = { id: this.nextId++, ...dto, age: 0 };
    this.users.push(user);
    return user;
  }

  async update(id: number, dto: { nickname?: string; age?: number }) {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return user;
  }

  async delete(id: number) {
    await this.findById(id);
    this.users = this.users.filter(u => u.id !== id);
    return { deleted: true };
  }
}
