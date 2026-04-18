// ========== MySQL 连接池配置 ==========

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      // 连接池配置
      extra: {
        // 最大连接数
        // 小型应用: 10-20
        // 中型应用: 20-50
        // 大型应用: 50-100
        connectionLimit: 20,

        // 等待连接超时（毫秒）
        connectTimeout: 10000,

        // 空闲连接超时（秒）
        idleTimeout: 60000,

        // 队列限制（0 = 无限制）
        queueLimit: 0,
      },

      // 日志
      logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    }),
  ],
})
export class DatabaseModule {}
