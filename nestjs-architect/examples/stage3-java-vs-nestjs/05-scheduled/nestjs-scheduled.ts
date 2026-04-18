// ========== NestJS Schedule（NestJS）==========
// examples/stage3-java-vs-nestjs/05-scheduled/nestjs-scheduled.ts

import { Module, Logger } from '@nestjs/common';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}

// ========== 定时任务 ==========
import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  // 每秒执行（6位 Cron = 秒级）
  @Cron('* * * * * *')
  handleCron() {
    this.logger.debug('每秒执行一次');
  }

  // 每5分钟执行
  @Cron('0 */5 * * * *')
  handleEvery5Minutes() {
    this.logger.debug('每5分钟执行');
  }

  // 工作日每天凌晨2点
  @Cron('0 0 2 * * 1-5')
  handleWeekdayMorning() {
    this.logger.log('工作日每天凌晨2点执行');
  }

  // 每5秒（Interval 方式）
  @Interval(5000)
  handleInterval() {
    this.logger.debug('每5秒执行');
  }

  // 启动后10秒执行一次
  @Timeout(10000)
  handleTimeout() {
    this.logger.debug('应用启动10秒后执行一次');
  }

  // 动态添加任务
  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.addDynamicTask();
  }

  addDynamicTask() {
    const job = new CronJob('0 0 * * * *', () => {
      this.logger.log('动态添加的每小时任务');
    });
    this.schedulerRegistry.addCronJob('dynamic-hourly', job);
    job.start();
  }
}
