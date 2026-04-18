// ========== 缓存击穿解决方案 ==========

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly redis: RedisService,
    private readonly lock: DistributedLockService,
  ) {}

  // 分布式锁方案
  async findByIdWithLock(id: number) {
    const cacheKey = `user:${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const lockKey = `lock:${cacheKey}`;
    const lockValue = await this.lock.acquire(lockKey, 10);

    if (!lockValue) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryCached = await this.redis.get(cacheKey);
      return retryCached ? JSON.parse(retryCached) : this.userRepo.findById(id);
    }

    try {
      const user = await this.userRepo.findById(id);
      if (user) await this.redis.set(cacheKey, JSON.stringify(user), 3600);
      return user;
    } finally {
      await this.lock.release(lockKey, lockValue);
    }
  }

  // 逻辑过期方案
  async findByIdWithLogicExpire(id: number) {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (!cached) {
      const user = await this.userRepo.findById(id);
      await this.setUserCache(id, user);
      return user;
    }

    const cacheData = JSON.parse(cached);
    if (Date.now() > cacheData.logicExpireAt) {
      this.refreshUserCacheAsync(id);
      return cacheData.user;
    }
    return cacheData.user;
  }

  async setUserCache(id: number, user: any) {
    await this.redis.set(`user:${id}`, JSON.stringify({
      user,
      logicExpireAt: Date.now() + 3600000,
    }), -1);
  }

  async refreshUserCacheAsync(id: number) {
    try {
      const user = await this.userRepo.findById(id);
      if (user) await this.setUserCache(id, user);
    } catch (e) {
      this.logger.error(`刷新缓存失败: ${e.message}`);
    }
  }
}

@Injectable()
export class DistributedLockService {
  constructor(private redis: RedisService) {}

  async acquire(key: string, ttlSeconds: number = 30): Promise<string | null> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result = await this.redis.set(lockKey, lockValue, 'PX', ttlSeconds * 1000, 'NX');
    return result ? lockValue : null;
  }

  async release(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const script = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;
    return (await this.redis.eval(script, [lockKey], [lockValue])) === 1;
  }
}
