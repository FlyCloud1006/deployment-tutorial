// ========== Redis String 操作 ==========

import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs/cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class RedisStringService {
  constructor(private redis: RedisService) {}

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.redis.set(key, value, ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async incr(key: string): Promise<number> { return this.redis.incr(key); }
  async decr(key: string): Promise<number> { return this.redis.decr(key); }
  async incrBy(key: string, amount: number): Promise<number> { return this.redis.incrby(key, amount); }

  async checkRateLimit(userId: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    const key = `rate:${userId}`;
    const current = await this.incr(key);
    if (current === 1) await this.redis.expire(key, windowSeconds);
    return current <= maxRequests;
  }

  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<string | null> {
    const lockValue = crypto.randomUUID();
    const acquired = await this.redis.setnx(lockKey, lockValue);
    if (acquired) { await this.redis.expire(lockKey, ttlSeconds); return lockValue; }
    return null;
  }

  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const script = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;
    return (await this.redis.eval(script, [lockKey], [lockValue])) === 1;
  }

  async cacheJson<T>(key: string, data: T, ttlSeconds: number = 3600) {
    await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  async getCachedJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
}
