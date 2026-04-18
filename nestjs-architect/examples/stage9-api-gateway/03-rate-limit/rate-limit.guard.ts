// ========== 限流守卫 ==========

import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limits = {
    default: { requests: 100, window: 60 },
    api: { requests: 60, window: 60 },
    auth: { requests: 5, window: 60 },
  };

  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const ip = request.ip || 'unknown';
    const path = request.path;
    const limitType = path.startsWith('/api/auth') ? 'auth' : path.startsWith('/api/') ? 'api' : 'default';
    const config = this.limits[limitType];
    const key = `ratelimit:${limitType}:${ip}`;
    const now = Math.floor(Date.now() / 1000);

    const redisClient = this.redis.getClient();
    await redisClient.zremrangebyscore(key, 0, now - config.window);
    await redisClient.zadd(key, now, `${now}:${Math.random()}`);
    const currentCount = await redisClient.zcard(key);

    response.setHeader('X-RateLimit-Limit', config.requests);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, config.requests - currentCount));

    if (currentCount > config.requests) {
      throw new HttpException({ statusCode: HttpStatus.TOO_MANY_REQUESTS, message: '请求过于频繁' }, HttpStatus.TOO_MANY_REQUESTS);
    }

    await redisClient.expire(key, config.window);
    return true;
  }
}
