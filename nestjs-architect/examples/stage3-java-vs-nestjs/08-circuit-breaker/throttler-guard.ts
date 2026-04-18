// ========== NestJS Throttler 限流（NestJS）==========
// examples/stage3-java-vs-nestjs/08-circuit-breaker/throttler-guard.ts

import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,   // 60秒窗口
        limit: 10,    // 窗口内最多10次
      },
      {
        name: 'long',
        ttl: 600000,  // 10分钟窗口
        limit: 100,   // 窗口内最多100次
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// 使用装饰器控制限流
@Controller('api')
export class ApiController {
  @Get('standard')
  standardEndpoint() {
    return '标准限流';
  }

  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Get('strict')
  strictEndpoint() {
    return '严格限流';
  }

  @SkipThrottle()
  @Get('internal')
  internalEndpoint() {
    return '不限流';
  }
}
