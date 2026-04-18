// ========== Redis ZSet 排行榜 ==========

import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class RedisZSetService {
  constructor(private redis: RedisService) {}

  async addScore(gameId: string, userId: string, score: number) {
    await this.redis.zadd(`leaderboard:${gameId}`, score, userId);
  }

  async getUserRank(gameId: string, userId: string): Promise<number | null> {
    const rank = await this.redis.zrevrank(`leaderboard:${gameId}`, userId);
    return rank !== null ? rank + 1 : null;
  }

  async getUserScore(gameId: string, userId: string): Promise<number | null> {
    const score = await this.redis.zscore(`leaderboard:${gameId}`, userId);
    return score !== null ? parseFloat(score) : null;
  }

  async getTopN(gameId: string, n: number = 10): Promise<{ userId: string; score: number }[]> {
    const results = await this.redis.zrevrange(`leaderboard:${gameId}`, 0, n - 1, 'WITHSCORES');
    const items: { userId: string; score: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      items.push({ userId: results[i], score: parseFloat(results[i + 1]) });
    }
    return items;
  }

  async incrementProductSales(productId: string, quantity: number = 1) {
    await this.redis.zincrby('product:sales:daily', quantity, productId);
    await this.redis.expire('product:sales:daily', 86400 * 7);
  }

  async getTopProducts(limit: number = 20): Promise<string[]> {
    return this.redis.zrevrange('product:sales:daily', 0, limit - 1);
  }

  async scheduleOrder(orderId: string, executeAt: Date) {
    await this.redis.zadd('delayed:orders', executeAt.getTime(), orderId);
  }

  async pollExpiredOrders(): Promise<string[]> {
    return this.redis.zrangebyscore('delayed:orders', 0, Date.now());
  }

  async removeScheduledOrder(orderId: string) {
    await this.redis.zrem('delayed:orders', orderId);
  }
}
