# NodeJS Service 项目全解教程

> 本项目是专为小程序设计的 Node.js 后端服务，与 Java 后端共存，JWT 认证核心。
> GitHub: https://github.com/FlyCloud1006/nodejs-service

---

## 📖 目录

1. [项目整体架构](#一项目整体架构)
2. [目录结构详解](#二目录结构详解)
3. [核心技术栈解析](#三核心技术栈解析)
4. [入口文件与启动流程](#四入口文件与启动流程)
5. [模块系统（Module）](#五模块系统module)
6. [中间件（Middleware）](#六中间件middleware)
7. [拦截器（Interceptor）](#七拦截器interceptor)
8. [过滤器（Filter）](#八过滤器filter)
9. [守卫（Guard）](#九守卫guard)
10. [装饰器（Decorator）](#十装饰器decorator)
11. [核心业务模块详解](#十一核心业务模块详解)
12. [DTO 与响应格式](#十二dto-与响应格式)
13. [配置管理系统](#十三配置管理系统)
14. [数据库与安全机制](#十四数据库与安全机制)
15. [日志系统](#十五日志系统)
16. [监控与告警](#十六监控与告警)
17. [PM2 部署配置](#十七pm2-部署配置)
18. [开发调试指南](#十八开发调试指南)
19. [扩展开发指南](#十九扩展开发指南)

---

## 一、项目整体架构

### 1.1 为什么需要这个项目？

在小程序场景中，后端通常由 Java/Python 等语言编写。但对于某些轻量级业务接口，用 Java 显得"大材小用"，Node.js 更加轻便快捷。

```
┌─────────────────────────────────────────────────────────┐
│                      小程序 (Taro)                        │
└──────────────────────────┬──────────────────────────────┘
                           │ 带上 JWT Token
                           ▼
┌─────────────────────────────────────────────────────────┐
│   Nginx (反向代理 + 静态资源)                              │
│   43.167.209.167:80 / 443                                │
└───────┬────────────────────────────┬───────────────────┘
        │                            │
        ▼                            ▼
┌───────────────┐          ┌──────────────────┐
│  Java 后端     │          │  Node.js 后端     │
│  (用户系统/    │          │  (业务接口/       │
│   Token生成)   │          │   轻量逻辑)       │
│  端口: 8080    │          │  端口: 3000       │
└───────┬───────┘          └────────┬─────────┘
        │                           │
        └───────────┬───────────────┘
                    ▼
         ┌──────────────────┐
         │     MySQL        │
         │   (共用数据库)    │
         └──────────────────┘
```

### 1.2 核心设计思想

| 原则 | 说明 |
|-----|------|
| **职责分离** | Java 负责用户认证（Token生成），Node.js 只负责验证 Token |
| **即插即用** | 使用 NestJS 模块化架构，每个功能独立成模块 |
| **基础设施优先** | 先搭建日志、监控、告警、安全，再写业务代码 |
| **渐进式开发** | Demo 模块作为模板，新业务直接复制改造 |

### 1.3 与 Java 后端的分工

```
┌──────────────────────────────────────────────────────────────┐
│  Java 后端职责                                               │
├──────────────────────────────────────────────────────────────┤
│  - 用户注册 / 登录                                            │
│  - 密码加密存储                                               │
│  - 生成 JWT Token                                             │
│  - 用户信息管理                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Node.js 后端职责                                            │
├──────────────────────────────────────────────────────────────┤
│  - 验证 JWT Token（不解密，只验证）                            │
│  - 业务逻辑接口（商品、订单、评论等）                          │
│  - 数据读写（直接操作数据库）                                  │
│  - 日志、监控、告警                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 二、目录结构详解

```
nodejs-service/
├── src/
│   ├── main.ts                   # 入口文件
│   ├── app.module.ts             # 根模块
│   │
│   ├── common/                   # 公共基础设施
│   │   ├── auth/                 # JWT 认证
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts   # Token 验证/解码
│   │   │   └── jwt.middleware.ts # JWT 中间件
│   │   │
│   │   ├── config/
│   │   │   └── configuration.ts # 环境配置加载
│   │   │
│   │   ├── constants/
│   │   │   └── index.ts          # 白名单常量
│   │   │
│   │   ├── dto/
│   │   │   └── response.dto.ts    # 统一响应格式
│   │   │
│   │   ├── filters/
│   │   │   ├── all-exceptions.filter.ts
│   │   │   └── http-exception.filter.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   │
│   │   ├── logger/
│   │   │   ├── logger.module.ts
│   │   │   ├── logger.service.ts
│   │   │   ├── logger.middleware.ts
│   │   │   └── logger.interceptor.ts
│   │   │
│   │   ├── monitoring/
│   │   │   ├── monitoring.module.ts
│   │   │   ├── health.controller.ts
│   │   │   ├── metrics.service.ts
│   │   │   └── alert.service.ts
│   │   │
│   │   └── security/
│   │       ├── security.module.ts
│   │       ├── jwt.strategy.ts
│   │       ├── jwt-auth.guard.ts
│   │       ├── roles.guard.ts
│   │       ├── throttle.guard.ts
│   │       ├── roles.decorator.ts
│   │       └── crypto.util.ts
│   │
│   └── demo/                     # 示例业务模块
│       ├── demo.module.ts
│       ├── demo.controller.ts
│       └── demo.service.ts
│
├── dist/                         # 编译输出
├── package.json
├── tsconfig.json
├── nest-cli.json
├── pm2.config.js                 # PM2 配置
└── .eslintrc.js
```

---

## 三、核心技术栈解析

### 3.1 NestJS 框架

NestJS 是 Node.js 的企业级框架，基于 TypeScript，灵感来自 Angular 的模块化设计。

**请求处理流程：**

```
Request → Middleware → Guard → Interceptor(Pre) → Pipe → Controller
    ↓                                                    ↓
    └──────────────────────────────────────────────────────┘
                         Exception Filter（异常捕获）
                              ↓
                          Response
```

### 3.2 核心技术依赖

| 依赖 | 作用 |
|-----|------|
| `@nestjs/config` | 环境变量配置管理 |
| `@nestjs/typeorm` | ORM 数据库访问 |
| `@nestjs/jwt` | JWT Token 处理 |
| `@nestjs/passport` | 认证策略封装 |
| `helmet` | 安全 HTTP 头 |
| `@nestjs/throttler` | 请求限流 |
| `class-validator` | 参数验证 |
| `pm2` | 进程管理 |
| `dayjs` | 时间处理 |

---

## 四、入口文件与启动流程

### 4.1 main.ts 核心逻辑

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. 安全头
  app.use(helmet());

  // 2. 跨域
  app.enableCors({ origin: '*', credentials: true });

  // 3. 全局前缀：/api/node
  app.setGlobalPrefix('api/node', {
    exclude: ['health', 'health/ready', 'health/live'],
  });

  // 4. 参数验证
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 5. 异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 6. 响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(3000);
}
bootstrap();
```

### 4.2 路由前缀效果

```
代码中的路径          →  实际访问路径
────────────────────────────────────
@Get('me')           →  GET /api/node/demo/me
@Get('list')        →  GET /api/node/demo/list
GET /health          →  GET /health（排除项）
```

---

## 五、模块系统（Module）

### 5.1 模块注册

```typescript
// app.module.ts
@Module({
  imports: [ConfigModule, TypeOrmModule, LoggerModule, AuthModule, DemoModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('*');
  }
}
```

### 5.2 全局模块 vs 普通模块

- **全局模块（@Global）**：整个应用可用，如 LoggerModule、AuthModule
- **普通模块**：需要 import 才能使用，如 DemoModule

---

## 六、中间件（Middleware）

### 6.1 JWT 中间件（认证核心）

```typescript
// src/common/auth/jwt.middleware.ts
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const fullPath = req.originalUrl || req.path;

    // 白名单直接放行
    if (this.isWhitelisted(fullPath)) return next();

    // 获取 Authorization 头
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token' });
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid format' });
    }

    try {
      // 验证 Token
      const decoded = jwt.verify(token, this.jwtSecret);
      // 挂载用户信息到 request
      (req as any).user = { userId: decoded.userId || decoded.sub, ... };
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
}
```

### 6.2 白名单机制

```typescript
// src/common/constants/index.ts
export const AUTH_WHITELIST = [
  '/api/node/health',
  '/api/node/health/ready',
  '/api/node/health/live',
] as const;
```

---

## 七、拦截器（Interceptor）

### 7.1 TransformInterceptor（统一响应格式）

```typescript
// src/common/interceptors/transform.interceptor.ts
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**效果：**

```typescript
// 代码直接返回
return { id: 1, name: 'test' };

// 实际响应（被拦截器包装）
{
  "code": 0,
  "message": "success",
  "data": { "id": 1, "name": "test" },
  "requestId": "uuid",
  "timestamp": "ISO时间"
}
```

### 7.2 LoggerInterceptor（性能监控）

```typescript
// src/common/logger/logger.interceptor.ts
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          if (duration > 3000) {
            this.logger.warn(`Slow: ${req.method} ${req.url} took ${duration}ms`);
          }
        },
        error: (error) => {
          this.logger.error(`Failed: ${error.message}`);
        },
      }),
    );
  }
}
```

---

## 八、过滤器（Filter）

### 8.1 HttpExceptionFilter（全局异常处理）

```typescript
// src/common/filters/http-exception.filter.ts
@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500, code = 10005, message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || message;
      code = res.code || this.mapStatusToCode(status);
    }

    response.status(status).json({
      code, message, requestId, timestamp, path: request.url,
    });
  }
}
```

### 8.2 错误码映射

| HTTP | 业务码 | 含义 |
|-----|-------|------|
| 400 | 10001 | 参数错误 |
| 401 | 10002 | 未授权 |
| 403 | 10003 | 禁止访问 |
| 404 | 10004 | 资源不存在 |
| 500 | 10005 | 服务器错误 |
| 503 | 10006 | 服务不可用 |

---

## 九、守卫（Guard）

### 9.1 JwtAuthGuard（JWT 验证）

```typescript
// src/common/security/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 白名单检查
    if (this.isWhitelisted(fullPath)) return true;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException({ code: 11102, message: 'No token' });
    }

    const [type, token] = authHeader.split(' ');
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      request.user = { userId: decoded.userId || decoded.sub, ... };
      return true;
    } catch (error) {
      throw new UnauthorizedException({ code: 11101, message: 'Invalid token' });
    }
  }
}
```

### 9.2 RolesGuard（角色权限）

```typescript
// src/common/security/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const userRoles = context.switchToHttp().getRequest().user?.roles || [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) throw new ForbiddenException({ code: 10003, message: 'No permission' });
    return true;
  }
}
```

### 9.3 ThrottleGuard（限流）

默认限制：60秒内最多60次请求。

```typescript
// src/common/security/throttle.guard.ts
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: any): Promise<string> {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  }
}
```

---

## 十、装饰器（Decorator）

### 10.1 内置装饰器

```typescript
@Get()                    // GET 请求
@Post()                   // POST 请求
@Put()                    // PUT 请求
@Delete()                 // DELETE 请求

@Param('id')              // 路由参数
@Query('page')            // 查询参数
@Body()                   // 请求体
@Request() / @Req         // 请求对象
```

### 10.2 自定义 @Roles 装饰器

```typescript
// src/common/security/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// 使用
@Controller('admin')
export class AdminController {
  @Get('users')
  @Roles('admin')
  getUsers() {}
}
```

---

## 十一、核心业务模块详解

### 11.1 Demo 模块（业务模板）

```
DemoController  →  DemoService
(接收请求)         (处理业务)
```

### 11.2 Controller 示例

```typescript
// src/demo/demo.controller.ts
@Controller('demo')
export class DemoController {
  constructor(private demoService: DemoService) {}

  // 获取当前用户
  // GET /api/node/demo/me
  @Get('me')
  getMe(@Request() req: any) {
    return this.demoService.getUserInfo(req.user.userId);
  }

  // 分页列表
  // GET /api/node/demo/list?page=1&pageSize=10
  @Get('list')
  getList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    return this.demoService.getList({ page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 获取单条
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.demoService.getUserInfo(id);
  }

  // 创建
  @Post()
  create(@Body() body: any) {
    return this.demoService.create(body);
  }

  // 更新
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.demoService.update(id, body);
  }

  // 删除
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.demoService.delete(id);
  }
}
```

### 11.3 Service 示例

```typescript
// src/demo/demo.service.ts
@Injectable()
export class DemoService {
  getUserInfo(userId: string | number) {
    return { userId, message: '业务数据', timestamp: new Date().toISOString() };
  }

  getList(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = params;
    return { list: [{ id: 1, name: '示例' }], total: 100, page, pageSize };
  }

  create(data: any) { return { id: Date.now(), ...data }; }
  update(id: number, data: any) { return { id, ...data }; }
  delete(id: number) { return { id, deleted: true }; }
}
```

---

## 十二、DTO 与响应格式

### 12.1 统一响应格式

```typescript
// 成功响应
{
  code: 0,
  message: 'success',
  data: { ... },           // 实际数据
  requestId: 'uuid',
  timestamp: 'ISO时间'
}

// 分页响应
{
  code: 0,
  message: 'success',
  data: {
    list: [...],
    total: 100,
    page: 1,
    pageSize: 10
  }
}

// 错误响应
{
  code: 10001,
  message: 'Validation failed',
  error: 'Bad Request',
  requestId: 'uuid',
  timestamp: 'ISO时间',
  path: '/api/node/demo'
}
```

---

## 十三、配置管理系统

### 13.1 configuration.ts

```typescript
// src/common/config/configuration.ts
export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  JWT: {
    SECRET: process.env.JWT_SECRET || 'default-secret',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },

  DATABASE: {
    HOST: process.env.DATABASE_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DATABASE_PORT || '3306', 10),
    USER: process.env.DATABASE_USER || 'root',
    PASSWORD: process.env.DATABASE_PASSWORD || '',
    NAME: process.env.DATABASE_NAME || 'app',
  },

  LOG: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    DIR: process.env.LOG_DIR || '/var/log/nodejs-service',
  },

  ALERT: {
    ENABLED: process.env.ALERT_ENABLED === 'true',
    WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL || '',
  },
});
```

### 13.2 环境变量加载顺序

```
1. .env.development  （开发环境）
2. .env.production   （生产环境）
3. .env              （通用）
4. process.env       （系统环境变量，优先级最高）
```

---

## 十四、数据库与安全机制

### 14.1 TypeORM 配置

```typescript
// app.module.ts
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'app',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  }),
}),
```

### 14.2 CryptoUtil（加密工具）

```typescript
// src/common/security/crypto.util.ts
export class CryptoUtil {
  // PBKDF2 密码哈希
  static async hashPassword(password: string, salt?: string) { ... }

  // 验证密码
  static async verifyPassword(password: string, hash: string, salt: string) { ... }

  // AES-256-GCM 加密
  static encrypt(text: string, secretKey: string): string { ... }

  // AES-256-GCM 解密
  static decrypt(encryptedData: string, secretKey: string): string { ... }

  // SHA256 哈希
  static sha256(data: string): string { ... }

  // 手机号掩码
  static maskPhone(phone: string): string { ... }
}
```

---

## 十五、日志系统

### 15.1 LoggerService

```typescript
// src/common/logger/logger.service.ts
@Injectable()
export class LoggerService {
  // 日志级别：error > warn > info > debug > verbose
  error(message: string, context?: LogContext) { ... }
  warn(message: string, context?: LogContext) { ... }
  info(message: string, context?: LogContext) { ... }
  debug(message: string, context?: LogContext) { ... }

  // 记录请求
  logRequest(req: any, res: any, duration: number, userId?: string) { ... }
}
```

### 15.2 日志输出

- **开发环境**：彩色控制台输出
- **生产环境**：JSON 格式写入文件

```
/var/log/nodejs-service/app-YYYY-MM-DD.log
```

### 15.3 日志格式

```json
{
  "timestamp": "2026-04-08T10:00:00.000Z",
  "level": "INFO",
  "message": "GET /api/node/demo/me 200",
  "context": "HTTP",
  "requestId": "uuid",
  "userId": "123",
  "ip": "127.0.0.1",
  "method": "GET",
  "url": "/api/node/demo/me",
  "duration": 45
}
```

---

## 十六、监控与告警

### 16.1 健康检查端点

```
GET /health              # 完整健康状态
GET /health/ready        # 就绪检查（数据库连接）
GET /health/live         # 存活检查（服务是否运行）
```

### 16.2 HealthController

```typescript
// src/common/monitoring/health.controller.ts
@Controller()
export class HealthController {
  @Get('health')
  async getHealth(): Promise<HealthStatus> {
    const checks = await this.performChecks();
    return {
      status: this.calculateOverallStatus(checks),
      uptime: this.getUptime(),
      checks: { database, memory, service },
      metrics: this.metricsService.getMetrics(),
    };
  }
}
```

### 16.3 AlertService（告警）

```typescript
// src/common/monitoring/alert.service.ts
@Injectable()
export class AlertService {
  // 发送慢请求告警
  async alertSlowRequest(path: string, method: string, duration: number) { ... }

  // 发送错误告警
  async alertError(error: Error, context: any) { ... }

  // 发送服务宕机告警
  async alertServiceDown(service: string, reason?: string) { ... }
}
```

支持钉钉 Webhook 告警格式。

---

## 十七、PM2 部署配置

### 17.1 pm2.config.js

```javascript
// pm2.config.js
module.exports = {
  apps: [{
    name: 'nodejs-service',
    script: 'dist/main.js',
    instances: 2,              // 2 个实例（集群模式）
    exec_mode: 'cluster',       // 集群模式
    max_memory_restart: '512M', // 内存超 512MB 自动重启
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_file: '/var/log/nodejs-service/app.log',
    out_file: '/var/log/nodejs-service/out.log',
    error_file: '/var/log/nodejs-service/error.log',
    autorestart: true,
    max_restarts: 10,
    kill_timeout: 5000,
  }],
};
```

### 17.2 常用命令

```bash
# 启动
pm2 start pm2.config.js

# 查看进程
pm2 list

# 查看日志
pm2 logs nodejs-service

# 重启
pm2 restart nodejs-service

# 停止
pm2 stop nodejs-service

# 保存进程列表（开机自启）
pm2 save

# 配置开机自启
pm2 startup
```

---

## 十八、开发调试指南

### 18.1 本地开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod

# 单元测试
npm test

# 代码检查
npm run lint
```

### 18.2 Docker 开发（可选）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 十九、扩展开发指南

### 19.1 创建新业务模块

**步骤1：创建模块文件**

```bash
mkdir -p src/modules/product
touch src/modules/product/product.controller.ts
touch src/modules/product/product.service.ts
touch src/modules/product/product.module.ts
```

**步骤2：编写代码**

```typescript
// product.controller.ts
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('list')
  getList(@Query('page') page: string) {
    return this.productService.getList(parseInt(page));
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.productService.create(body);
  }
}
```

```typescript
// product.service.ts
@Injectable()
export class ProductService {
  getList(page: number) { ... }
  getOne(id: number) { ... }
  create(data: any) { ... }
}
```

```typescript
// product.module.ts
@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
```

**步骤3：注册到 AppModule**

```typescript
// app.module.ts
@Module({
  imports: [ProductModule, ...],
})
export class AppModule {}
```

### 19.2 添加数据库 Entity

```typescript
// src/modules/product/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('decimal')
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### 19.3 添加定时任务

```typescript
// src/modules/task/task.service.ts
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    console.log('定时任务执行');
  }

  @Interval(60000)  // 每 60 秒
  handleInterval() { }

  @Timeout(5000)    // 5 秒后执行一次
  handleTimeout() { }
}
```

---

## 附录：API 访问路径一览

| 方法 | 路径 | 说明 | 需认证 |
|-----|------|------|--------|
| GET | `/health` | 健康检查 | 否 |
| GET | `/health/ready` | 就绪检查 | 否 |
| GET | `/health/live` | 存活检查 | 否 |
| GET | `/api/node/demo/me` | 当前用户信息 | 是 |
| GET | `/api/node/demo/list` | 分页列表 | 是 |
| GET | `/api/node/demo/:id` | 获取单条 | 是 |
| POST | `/api/node/demo` | 创建 | 是 |
| PUT | `/api/node/demo/:id` | 更新 | 是 |
| DELETE | `/api/node/demo/:id` | 删除 | 是 |

---

*文档版本：v1.0*
*创建日期：2026-04-08*
*配套项目：https://github.com/FlyCloud1006/nodejs-service*
