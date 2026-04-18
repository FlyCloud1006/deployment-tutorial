# 第九阶段：API 网关与 BFF 架构

> 本阶段目标：理解网关在系统架构中的角色：路由转发、协议转换、统一鉴权、限流防爬、响应聚合、缓存网关，掌握 NestJS 作为 API 网关的实现方式。

---

## 📐 阶段目标

| 目标 | 说明 |
|------|------|
| 理解 API 网关职责 | 路由、鉴权、限流、协议转换 |
| 掌握网关设计模式 | BFF、聚合网关、泛化调用 |
| 实现统一鉴权 | Token 校验、SSO 会话 |
| 实现限流防爬 | 多维度限流、IP 黑名单 |
| 实现响应聚合 | 多接口合并、数据裁剪 |
| 实现缓存网关 | Redis 缓存、CDN 边缘缓存 |

---

## 📂 示例代码目录

```
examples/stage9-api-gateway/
├── 01-gateway/
│   ├── gateway.module.ts         # 网关模块
│   ├── proxy.controller.ts       # 代理控制器
│   └── microservices.config.ts  # 微服务路由配置
├── 02-bff/
│   ├── bff.service.ts           # BFF 服务
│   ├── user-bff.controller.ts    # 用户 BFF
│   └── order-bff.controller.ts   # 订单 BFF
└── 03-rate-limit/
    ├── rate-limit.guard.ts      # 限流守卫
    └── ip-blacklist.guard.ts    # IP 黑名单
```

---

## 1️⃣ API 网关概述

### 1.1 网关核心职责

```
┌─────────────────────────────────────────────────────────────┐
│                    API 网关核心职责                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 路由转发                                                │
│     - 外部请求 → 网关 → 内部微服务                           │
│     - /api/users → user-service:3001                        │
│     - /api/orders → order-service:3002                     │
│                                                             │
│  2. 统一鉴权                                                │
│     - JWT Token 校验                                        │
│     - SSO 会话验证                                          │
│     - API Key 管理                                          │
│                                                             │
│  3. 限流防爬                                                │
│     - 接口限流（每 IP / 每用户 / 每接口）                    │
│     - IP 黑名单                                             │
│     - 爬虫识别                                              │
│                                                             │
│  4. 协议转换                                                │
│     - HTTP → gRPC                                           │
│     - HTTP → WebSocket                                      │
│                                                             │
│  5. 响应聚合                                                │
│     - 多接口合并为一次请求                                   │
│     - BFF（Backend for Frontend）                           │
│                                                             │
│  6. 缓存网关                                                │
│     - Redis 缓存热点数据                                    │
│     - CDN 边缘缓存                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 网关架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      API 网关架构                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Client                                                   │
│     │                                                       │
│     │ HTTP / HTTPS                                         │
│     ↓                                                       │
│   ┌──────────────────────────────────────────────────────┐ │
│   │                    API Gateway                        │ │
│   │  ┌────────────────────────────────────────────────┐  │ │
│   │  │  1. TLS Termination（SSL 终止）                 │  │ │
│   │  │  2. Rate Limiting（限流）                      │  │ │
│   │  │  3. Authentication（鉴权）                     │  │ │
│   │  │  4. Load Balancing（负载均衡）                │  │ │
│   │  │  5. Service Discovery（服务发现）             │  │ │
│   │  │  6. Circuit Breaker（熔断）                   │  │ │
│   │  │  7. Response Caching（缓存）                   │  │ │
│   │  │  8. Logging / Tracing（日志追踪）              │  │ │
│   │  └────────────────────────────────────────────────┘  │ │
│   └──────────────────┬───────────────────────────────────┘ │
│                      │                                       │
│        ┌────────────┼────────────┐                           │
│        ↓            ↓            ↓                           │
│   ┌─────────┐  ┌──────────┐  ┌──────────┐                   │
│   │ User    │  │ Order    │  │ Product  │                   │
│   │ Service │  │ Service  │  │ Service  │                   │
│   │ :3001   │  │ :3002    │  │ :3003    │                   │
│   └─────────┘  └──────────┘  └──────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ NestJS API 网关实现

### 2.1 网关模块

```typescript
// examples/stage9-api-gateway/01-gateway/gateway.module.ts

import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { AuthGuard } from './guards/auth.guard';
import { CacheService } from './services/cache.service';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [
    ProxyService,
    CacheService,
    RateLimitGuard,
    AuthGuard,
  ],
})
export class GatewayModule {}

// app.module.ts
@Module({
  imports: [
    GatewayModule,
  ],
})
export class AppModule {}
```

### 2.2 代理控制器

```typescript
// examples/stage9-api-gateway/01-gateway/proxy.controller.ts

import {
  Controller,
  All,
  Param,
  Query,
  Body,
  Headers,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // ========== 路由配置 ==========
  private readonly routes = {
    '/api/users': { service: 'user-service', port: 3001, auth: true },
    '/api/orders': { service: 'order-service', port: 3002, auth: true },
    '/api/products': { service: 'product-service', port: 3003, auth: false },
    '/api/auth': { service: 'auth-service', port: 3004, auth: false },
  };

  // ========== 通用代理（转发所有 HTTP 方法）==========
  @All('api/:service/:path(*)')
  @UseGuards(RateLimitGuard, AuthGuard)
  async proxy(
    @Param('service') service: string,
    @Param('path') path: string,
    @Query() query: any,
    @Body() body: any,
    @Headers() headers: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const targetService = this.getServiceConfig(service);

    if (!targetService) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Service not found' });
    }

    // 转发请求
    await this.proxyService.forward(req, targetService, path, query, body, headers, res);
  }

  // ========== 不需要鉴权的路由 ==========
  @All('public/:service/:path(*)')
  @UseGuards(RateLimitGuard) // 只限流，不鉴权
  async publicProxy(
    @Param('service') service: string,
    @Param('path') path: string,
    @Query() query: any,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const targetService = this.getServiceConfig(service);
    if (!targetService) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Service not found' });
    }
    await this.proxyService.forward(req, targetService, path, query, body, {}, res);
  }

  private getServiceConfig(service: string) {
    const config = {
      'user': { host: 'user-service', port: 3001 },
      'order': { host: 'order-service', port: 3002 },
      'product': { host: 'product-service', port: 3003 },
    };
    return config[service as keyof typeof config];
  }
}
```

### 2.3 代理服务

```typescript
// examples/stage9-api-gateway/01-gateway/proxy.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  async forward(
    req: Request,
    target: { host: string; port: number },
    path: string,
    query: any,
    body: any,
    headers: any,
    res: Response,
  ): Promise<void> {
    const url = `http://${target.host}:${target.port}/${path}`;

    // 构造代理请求头
    const proxyHeaders: Record<string, string> = {
      'X-Forwarded-For': req.ip,
      'X-Forwarded-Proto': req.protocol,
      'X-Forwarded-Host': req.get('host'),
      'X-Real-IP': req.ip,
    };

    try {
      const method = req.method.toLowerCase();
      let response;

      const axiosConfig = {
        headers: proxyHeaders,
        params: query,
        timeout: 30000,
      };

      // 根据请求方法调用不同的 HTTP 方法
      switch (method) {
        case 'get':
          response = await firstValueFrom(this.httpService.get(url, axiosConfig));
          break;
        case 'post':
          response = await firstValueFrom(this.httpService.post(url, body, axiosConfig));
          break;
        case 'put':
          response = await firstValueFrom(this.httpService.put(url, body, axiosConfig));
          break;
        case 'patch':
          response = await firstValueFrom(this.httpService.patch(url, body, axiosConfig));
          break;
        case 'delete':
          response = await firstValueFrom(this.httpService.delete(url, axiosConfig));
          break;
        default:
          res.status(HttpStatus.METHOD_NOT_ALLOWED).json({ error: 'Method not allowed' });
          return;
      }

      // 转发响应
      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Proxy error: ${error.message}`);

      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(HttpStatus.BAD_GATEWAY).json({ error: 'Gateway error' });
      }
    }
  }
}
```

---

## 3️⃣ BFF（Backend for Frontend）

### 3.1 BFF 概念

```
┌─────────────────────────────────────────────────────────────┐
│                    BFF 架构模式                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  传统模式：                                                 │
│  Frontend → API Gateway → User Service                     │
│                      → Order Service                       │
│                      → Product Service                      │
│                                                             │
│  Frontend 需要发起多次请求，聚合数据                         │
│                                                             │
│  BFF 模式：                                                │
│  Frontend → Web BFF → User + Order + Product Services     │
│  Frontend → Mobile BFF → User + Order + Product Services  │
│                                                             │
│  每个端（Web/Mobile/小程序）有自己的 BFF                    │
│  BFF 负责聚合该端需要的数据，按端需求裁剪响应                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 BFF 服务实现

```typescript
// examples/stage9-api-gateway/02-bff/bff.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BffService {
  constructor(private httpService: HttpService) {}

  // ========== 用户中心 BFF ==========
  async getUserCenter(userId: number) {
    // 并行请求多个服务的用户数据
    const [user, orders, preferences] = await Promise.all([
      this.fetchUser(userId),
      this.fetchUserOrders(userId),
      this.fetchUserPreferences(userId),
    ]);

    // 按 Web 前端需求聚合
    return {
      // 基本信息
      profile: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        vipExpireAt: user.vipExpireAt,
      },
      // 订单摘要（只返回前5条）
      recentOrders: orders.slice(0, 5).map(o => ({
        id: o.id,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
      })),
      // 统计数据
      stats: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      },
      // 用户偏好设置
      preferences: preferences.settings,
    };
  }

  // ========== 商品详情 BFF ==========
  async getProductDetail(productId: number) {
    const [product, inventory, reviews, relatedProducts] = await Promise.all([
      this.fetchProduct(productId),
      this.fetchInventory(productId),
      this.fetchReviews(productId),
      this.fetchRelatedProducts(productId),
    ]);

    return {
      // 商品基本信息
      info: {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images.slice(0, 5), // 只返回前5张图
        description: product.description,
      },
      // 库存状态
      inventory: {
        available: inventory.available,
        stock: inventory.stock,
        warehouse: inventory.warehouse,
      },
      // 评价摘要（只返回前10条）
      reviews: {
        summary: reviews.summary,
        items: reviews.items.slice(0, 10).map(r => ({
          id: r.id,
          username: r.username,
          content: r.content,
          rating: r.rating,
          createdAt: r.createdAt,
        })),
      },
      // 相关商品
      relatedProducts: relatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        thumbnail: p.thumbnail,
      })),
    };
  }

  // ========== 小程序 BFF（精简数据）==========
  async getProductDetailMiniApp(productId: number) {
    // 小程序需要更精简的数据
    const [product, inventory] = await Promise.all([
      this.fetchProduct(productId),
      this.fetchInventory(productId),
    ]);

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnail: product.images[0],
      stock: inventory.available,
    };
  }

  // ========== 底层服务调用 ==========
  private async fetchUser(userId: number) {
    const { data } = await this.httpService.get(`http://user-service:3001/users/${userId}`).toPromise();
    return data;
  }

  private async fetchUserOrders(userId: number) {
    const { data } = await this.httpService.get(`http://order-service:3002/orders`, {
      params: { userId, limit: 5 },
    }).toPromise();
    return data.list || [];
  }

  private async fetchUserPreferences(userId: number) {
    const { data } = await this.httpService.get(`http://user-service:3001/users/${userId}/preferences`).toPromise();
    return data;
  }

  private async fetchProduct(productId: number) {
    const { data } = await this.httpService.get(`http://product-service:3003/products/${productId}`).toPromise();
    return data;
  }

  private async fetchInventory(productId: number) {
    const { data } = await this.httpService.get(`http://inventory-service:3004/inventory/${productId}`).toPromise();
    return data;
  }

  private async fetchReviews(productId: number) {
    const { data } = await this.httpService.get(`http://review-service:3005/reviews`, {
      params: { productId, limit: 10 },
    }).toPromise();
    return data;
  }

  private async fetchRelatedProducts(productId: number) {
    const { data } = await this.httpService.get(`http://product-service:3003/products/${productId}/related`).toPromise();
    return data.list || [];
  }
}
```

### 3.3 BFF 控制器

```typescript
// examples/stage9-api-gateway/02-bff/user-bff.controller.ts

import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { BffService } from './bff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bff/user')
export class UserBffController {
  constructor(private readonly bffService: BffService) {}

  @Get('center')
  @UseGuards(JwtAuthGuard)
  async getUserCenter(@Req() req: any) {
    return this.bffService.getUserCenter(req.user.id);
  }
}

@Controller('bff/product')
export class ProductBffController {
  constructor(private readonly bffService: BffService) {}

  @Get(':id')
  async getProductDetail(@Param('id') id: string, @Query('platform') platform: string = 'web') {
    if (platform === 'miniapp') {
      return this.bffService.getProductDetailMiniApp(+id);
    }
    return this.bffService.getProductDetail(+id);
  }
}
```

---

## 4️⃣ 限流防爬

### 4.1 限流守卫

```typescript
// examples/stage9-api-gateway/03-rate-limit/rate-limit.guard.ts

import {
  Injectable, CanActivate, ExecutionContext,
  HttpException, HttpStatus, Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  // 限流配置
  private readonly limits = {
    default: { requests: 100, window: 60 },     // 默认：每分钟 100 次
    api: { requests: 60, window: 60 },           // API：每分钟 60 次
    auth: { requests: 5, window: 60 },           // 登录：每分钟 5 次
    search: { requests: 30, window: 60 },        // 搜索：每分钟 30 次
  };

  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const ip = this.getClientIp(request);
    const path = request.path;
    const limitType = this.getLimitType(path);
    const config = this.limits[limitType];

    const key = `ratelimit:${limitType}:${ip}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.window;

    try {
      // 使用 Redis 有序集合实现滑动窗口
      const pipeline = this.redis.getClient().pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart); // 移除过期记录
      pipeline.zadd(key, now, `${now}:${Math.random()}`); // 添加当前请求
      pipeline.zcard(key); // 统计当前窗口请求数
      const results = await pipeline.exec();

      const currentCount = results[2][1] as number;

      // 设置响应头
      response.setHeader('X-RateLimit-Limit', config.requests);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, config.requests - currentCount));
      response.setHeader('X-RateLimit-Reset', now + config.window);

      if (currentCount > config.requests) {
        this.logger.warn(`Rate limit exceeded: ${ip} - ${path}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: '请求过于频繁，请稍后再试',
            retryAfter: config.window,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // 设置过期时间
      await this.redis.getClient().expire(key, config.window);

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Rate limit check failed: ${error.message}`);
      return true; // 失败时放行，避免影响可用性
    }
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  private getLimitType(path: string): string {
    if (path.startsWith('/api/auth')) return 'auth';
    if (path.startsWith('/api/search')) return 'search';
    if (path.startsWith('/api/')) return 'api';
    return 'default';
  }
}
```

### 4.2 IP 黑名单

```typescript
// examples/stage9-api-gateway/03-rate-limit/ip-blacklist.guard.ts

import {
  Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '@nestjs/cache-manager';

@Injectable()
export class IpBlacklistGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  private readonly blacklistKey = 'ip:blacklist';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);

    // 检查是否在黑名单
    const isBlacklisted = await this.redis.getClient().sismember(this.blacklistKey, ip);

    if (isBlacklisted) {
      throw new HttpException(
        { statusCode: HttpStatus.FORBIDDEN, message: '访问被拒绝' },
        HttpStatus.FORBIDDEN,
      );
    }

    // 检查是否在临时封禁（恶意行为检测）
    const banKey = `ip:ban:${ip}`;
    const isBanned = await this.redis.get(banKey);
    if (isBanned) {
      throw new HttpException(
        { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'IP 已被临时封禁' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown'
    );
  }
}

// 管理接口：添加/移除黑名单
@Controller('admin/ip')
export class IpAdminController {
  constructor(private redis: RedisService) {}

  @Post('blacklist')
  async addToBlacklist(@Body() body: { ip: string }) {
    await this.redis.getClient().sadd('ip:blacklist', body.ip);
    return { success: true };
  }

  @Delete('blacklist/:ip')
  async removeFromBlacklist(@Param('ip') ip: string) {
    await this.redis.getClient().srem('ip:blacklist', ip);
    return { success: true };
  }

  @Get('blacklist')
  async getBlacklist() {
    const members = await this.redis.getClient().smembers('ip:blacklist');
    return { ips: members };
  }
}
```

---

## 📝 练习题

1. **网关实现**：实现一个 NestJS API 网关，支持：根据路由前缀转发到不同微服务、统一 JWT 鉴权、限流（滑动窗口算法）。

2. **BFF 设计**：设计一个订单页 BFF，并行请求用户、订单、商品、库存、物流服务，按需聚合数据，返回给前端定制化的响应。

3. **限流系统**：实现一个多维度限流系统：每 IP 限流、每用户限流、每接口限流，支持突发流量配置。

4. **缓存网关**：实现一个缓存网关，支持：热点数据自动缓存、缓存预热、缓存失效策略（LRU）。

---

## 🔗 相关资源

- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [API Gateway Pattern](https://docs.microsoft.com/en-us/azure/architecture/microservices/gateway)
- [BFF Pattern](https://docs.microsoft.com/en-us/azure/architecture/microservices/back-end-services)
- [Rate Limiting Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/rate-limiting)

---

**下一阶段预告**：[第十阶段：生产级架构综合实战](./第十阶段_综合实战.md)

> 以真实项目为载体，串联全部知识体系：架构设计、工程化、测试体系、CI/CD 流水线、生产问题排查、性能优化、高并发设计、安全加固。
ENDOFFILE