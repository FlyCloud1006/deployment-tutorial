// ========== 分布式锁实现 ==========

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);

  async acquire(key: string, ttlSeconds: number = 30): Promise<string | null> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result = await this.redis.set(lockKey, lockValue, 'PX', ttlSeconds * 1000, 'NX');
    return result ? lockValue : null;
  }

  async release(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return (await this.redis.eval(script, [lockKey], [lockValue])) === 1;
  }

  async renew(key: string, lockValue: string, ttlSeconds: number = 30): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    return (await this.redis.eval(script, [lockKey], [lockValue, ttlSeconds * 1000])) === 1;
  }

  async withLock<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 30): Promise<T> {
    const lockValue = await this.acquire(key, ttlSeconds);
    if (!lockValue) throw new Error(`获取锁失败: ${key}`);
    try {
      return await fn();
    } finally {
      await this.release(key, lockValue);
    }
  }
}
