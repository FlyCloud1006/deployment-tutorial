// ========== 健康检查控制器 ==========

import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('detailed')
  @HealthCheck()
  async detailedCheck() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @Get('live')
  @HealthCheck()
  async liveness() {
    return this.health.check([]);
  }
}
