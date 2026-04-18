// ========== 缓存穿透解决方案 ==========

import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redis: RedisService,
  ) {}

  // 方案1：缓存空值
  async findById(id: number) {
    const cacheKey = `user:${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      if (cached === 'null') return null;
      return JSON.parse(cached);
    }

    const user = await this.userRepo.findById(id);

    if (user) {
      await this.redis.set(cacheKey, JSON.stringify(user), 3600);
    } else {
      // 缓存空值，防止穿透
      await this.redis.set(`null:${cacheKey}`, '1', 300);
    }

    return user;
  }
}
