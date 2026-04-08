# Node.js 与 Java 后端共存架构方案

> 简化版：专注 JWT 认证 + 业务接口开发

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         小程序 (Taro)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx (端口 80 / 443)                         │
│                                                                  │
│    /api/java/*  ──────────────▶  Java 后端 (8080)              │
│    /api/node/*  ──────────────▶  Node.js 后端 (3000)           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Java      │ │   Node.js   │ │   MySQL     │
    │   后端      │ │   后端      │ │   数据库     │
    │  (8080)     │ │  (3000)     │ │  (3306)     │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### 核心职责划分

| 服务 | 职责 | 说明 |
|-----|------|-----|
| Java 后端 | 生成 JWT Token | 登录接口、用户注册、Token 生成 |
| Node.js 后端 | 验证 JWT + 业务逻辑 | 只验证 Token，专注业务接口开发 |
| MySQL | 数据存储 | 两服务共用同一数据库 |

---

## 二、请求流程详解

```
┌──────────────────────────────────────────────────────────────────┐
│                        请求流程                                    │
└──────────────────────────────────────────────────────────────────┘

  1. 用户登录（Java）
     ┌─────────┐     ┌─────────┐     ┌─────────┐
     │ 小程序  │ ──▶ │  Java   │ ──▶ │  MySQL  │
     └─────────┘     └─────────┘     └─────────┘
                           │
                           ▼
                      返回 JWT Token

  2. 业务请求（Node.js）
     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
     │ 小程序  │ ──▶ │  Nginx  │ ──▶ │ Node.js │ ──▶ │  MySQL  │
     └─────────┘     └─────────┘     └─────────┘     └─────────┘
                                   │
                                   ▼
                            JWT 中间件验证
                            ↓
                      从 Token 解析 userId
                      ↓
                      执行业务逻辑
```

### 每一步详解

#### 步骤 1：小程序发起请求
```javascript
// 小程序代码示例
Taro.request({
  url: 'https://domain.com/api/node/business/getUserInfo',
  header: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
})
```

#### 步骤 2：Nginx 路由分发
```nginx
# /api/node/* 路由到 Node.js
location /api/node/ {
    rewrite ^/api/node/(.*) /$1 break;
    proxy_pass http://127.0.0.1:3000;
}

# /api/java/* 路由到 Java
location /api/java/ {
    rewrite ^/api/java/(.*) /$1 break;
    proxy_pass http://127.0.0.1:8080;
}
```

#### 步骤 3：Node.js JWT 中间件验证
```typescript
// JwtMiddleware 核心逻辑
1. 检查路径是否在白名单中
   ├─ 白名单：/health, /health/ready, /health/live
   └─ 直接 next()，不验证 Token

2. 从 Header 提取 Token
   └─ Authorization: Bearer <token>

3. 使用配置的 JWT_SECRET 验证 Token
   ├─ 成功：从 Token 解析 userId，注入到 req.user
   └─ 失败：返回 401 错误

4. 后续业务代码通过 req.user 获取用户信息
```

#### 步骤 4：执行业务逻辑
```typescript
// 业务控制器中获取当前用户
@Get('me')
getMe(@Request() req: any) {
  const userId = req.user.userId;  // 从 JWT 中解析出的用户ID
  return this.userService.getUserInfo(userId);
}
```

---

## 三、Token 认证详解

### 3.1 Token 结构（由 Java 生成）

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 123456,
    "username": "zhangsan",
    "roles": ["user", "vip"],
    "iat": 1712500000,
    "exp": 1712586400
  }
}
```

### 3.2 关键要求

| 要求 | 说明 |
|-----|------|
| 算法 | 必须使用 HS256 |
| 密钥 | Node.js 与 Java 必须使用相同密钥 |
| userId | 必须存在于 payload 中 |

### 3.3 Java 侧配置（参考）

```yaml
# application.yml
jwt:
  secret: your-256-bit-secret-key  # 必须与 Node.js 配置相同
  expiration: 604800000             # 7天 = 7 * 24 * 60 * 60 * 1000
```

### 3.4 Node.js 侧配置

```bash
# .env
JWT_SECRET=your-256-bit-secret-key
```

### 3.5 为什么 Node.js 不生成 Token

1. **安全性**：密钥只保存在后端，前端无法伪造
2. **统一认证**：用户体系由 Java 管理，Node.js 只负责验证
3. **职责分离**：Java 处理登录/注册，Node.js 专注业务

---

## 四、项目结构

```
/root/nodejs-service/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── app.module.ts                # 根模块 + 中间件配置
│   │
│   ├── common/                      # 公共模块（必须）
│   │   ├── auth/                    # JWT 认证
│   │   │   ├── jwt.middleware.ts   # JWT 中间件（核心）
│   │   │   ├── auth.service.ts     # JWT 工具服务
│   │   │   └── auth.module.ts      #
│   │   ├── constants/               # 常量定义
│   │   │   └── index.ts           # 白名单配置
│   │   ├── logger/                  # 日志系统
│   │   │   ├── logger.service.ts   # 结构化日志
│   │   │   └── logger.middleware.ts # 请求日志
│   │   ├── filters/                 # 异常处理
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/            # 响应拦截
│   │   │   └── transform.interceptor.ts
│   │   ├── monitoring/              # 监控告警
│   │   │   ├── health.controller.ts # 健康检查
│   │   │   ├── alert.service.ts    # 告警服务
│   │   │   └── metrics.service.ts  # 指标收集
│   │   └── config/                  # 配置
│   │       └── configuration.ts    # 环境变量定义
│   │
│   ├── demo/                        # 业务模块示例
│   │   ├── demo.module.ts          #
│   │   ├── demo.controller.ts       # 接口定义
│   │   └── demo.service.ts          # 业务逻辑
│   │
│   └── your-business/              # 你的业务模块（按需创建）
│       ├── your.module.ts
│       ├── your.controller.ts
│       └── your.service.ts
│
├── environments/                     # 环境配置
│   ├── .env.development
│   ├── .env.test
│   └── .env.production
│
├── scripts/                          # 运维脚本
│   ├── deploy.sh                    # 部署脚本
│   ├── health-check.sh              # 健康检查
│   └── backup-db.sh                 # 数据库备份
│
├── pm2.config.js                   # PM2 配置
└── package.json
```

---

## 五、模块说明

### 5.1 JWT 中间件 (jwt.middleware.ts)

**职责**：拦截所有请求，验证 JWT Token

**流程**：
```
请求进入 → 检查白名单 → 提取 Token → 验证 Token → 解析 userId → 注入 req.user → 后续处理
```

**关键代码**：
```typescript
// 验证 Token
const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

// 注入用户信息到请求对象
req.user = {
  userId: decoded.userId || decoded.sub,  // 支持两种格式
  username: decoded.username,
  roles: decoded.roles || [],
};
```

### 5.2 日志模块 (logger)

**职责**：记录请求日志、错误日志

**日志格式**：
```json
{
  "timestamp": "2026-04-07T12:00:00.000Z",
  "level": "INFO",
  "message": "GET /api/node/demo/me 200",
  "context": "HTTP",
  "requestId": "uuid",
  "userId": "123",
  "method": "GET",
  "url": "/api/node/demo/me",
  "duration": 45
}
```

### 5.3 健康检查 (health.controller.ts)

| 接口 | 路径 | 说明 |
|-----|------|-----|
| 详细健康 | GET /health | 数据库、内存、服务状态 |
| 就绪检查 | GET /health/ready | 数据库连接是否正常 |
| 存活检查 | GET /health/live | 服务是否运行 |

### 5.4 统一响应格式

**成功响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "requestId": "uuid",
  "timestamp": "2026-04-07T12:00:00.000Z"
}
```

**错误响应**：
```json
{
  "code": 401,
  "message": "Token has expired",
  "error": "Unauthorized",
  "requestId": "uuid",
  "timestamp": "2026-04-07T12:00:00.000Z",
  "path": "/api/node/demo/me"
}
```

---

## 六、开发新业务接口流程

### 6.1 创建业务模块

```bash
# 1. 创建模块目录
mkdir -p src/your-business

# 2. 创建文件
# your-business.module.ts
# your-business.controller.ts
# your-business.service.ts
```

### 6.2 模块代码示例

**your-business.module.ts**：
```typescript
import { Module } from '@nestjs/common';
import { YourController } from './your-business.controller';
import { YourService } from './your-business.service';

@Module({
  controllers: [YourController],
  providers: [YourService],
})
export class YourModule {}
```

**your-business.controller.ts**：
```typescript
import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { YourService } from './your-business.service';

@Controller('your')
export class YourController {
  constructor(private yourService: YourService) {}

  // 获取当前用户相关数据
  @Get('data')
  getData(@Request() req: any) {
    const userId = req.user.userId;  // 从 JWT 获取
    return this.yourService.getDataForUser(userId);
  }

  // 通用业务接口
  @Post('action')
  doAction(@Body() body: any, @Request() req: any) {
    return this.yourService.doAction(body, req.user);
  }
}
```

**your-business.service.ts**：
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourService {
  getDataForUser(userId: string | number) {
    // TODO: 实现业务逻辑
    return {
      userId,
      data: 'your business data',
    };
  }

  doAction(body: any, user: any) {
    // TODO: 实现业务逻辑
    return { success: true };
  }
}
```

### 6.3 注册模块

在 `app.module.ts` 中添加：
```typescript
import { YourModule } from './your-business/your.module';

@Module({
  imports: [
    // ... 其他模块
    YourModule,
  ],
})
```

---

## 七、环境配置

### 7.1 环境变量说明

| 变量 | 说明 | 必须 |
|-----|------|-----|
| `JWT_SECRET` | JWT 密钥（与 Java 相同） | ✅ |
| `DATABASE_HOST` | 数据库地址 | ✅ |
| `DATABASE_PORT` | 数据库端口 | |
| `DATABASE_USER` | 数据库用户名 | ✅ |
| `DATABASE_PASSWORD` | 数据库密码 | ✅ |
| `DATABASE_NAME` | 数据库名 | ✅ |
| `LOG_LEVEL` | 日志级别 | |
| `LOG_DIR` | 日志目录 | |
| `ALERT_WEBHOOK_URL` | 告警 webhook | |

### 7.2 生产环境配置示例

```bash
# /root/nodejs-service/.env.production
NODE_ENV=production
PORT=3000

# JWT - 必须与 Java 后端完全一致
JWT_SECRET=your-production-256-bit-secret

# 数据库
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=prod_user
DATABASE_PASSWORD=prod_password
DATABASE_NAME=app_production

# 日志
LOG_LEVEL=info
LOG_DIR=/var/log/nodejs-service

# 告警（可选）
ALERT_ENABLED=true
ALERT_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=xxx
```

---

## 八、部署

### 8.1 首次部署

```bash
# 1. 服务器准备
ssh root@43.167.209.167

# 2. 创建目录
mkdir -p /var/log/nodejs-service /root/backups/mysql

# 3. 上传代码
cd /root/nodejs-service
git clone https://github.com/FlyCloud1006/nodejs-service.git .

# 4. 安装依赖
npm install

# 5. 配置环境变量
cp environments/.env.production .env
vim .env  # 修改 JWT_SECRET 和数据库配置

# 6. 构建
npm run build

# 7. 启动
pm2 start pm2.config.js
pm2 save
pm2 startup
```

### 8.2 Nginx 配置

```nginx
upstream node_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;

    # Node.js 后端
    location /api/node/ {
        rewrite ^/api/node/(.*) /$1 break;
        proxy_pass http://node_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Connection "";
    }
}
```

### 8.3 常用运维命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs nodejs-service

# 重启
pm2 restart nodejs-service

# 健康检查
curl http://127.0.0.1:3000/health
```

---

## 九、接口测试

### 9.1 获取 Token（从 Java 服务）

```bash
# 假设 Java 登录接口
curl -X POST http://localhost:8080/api/java/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 9.2 使用 Token 访问 Node.js 接口

```bash
# 带上 Token 访问业务接口
curl http://localhost:3000/api/node/demo/me \
  -H "Authorization: Bearer <your-jwt-token>"

# 访问示例列表
curl http://localhost:3000/api/node/demo/list \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 9.3 响应示例

**成功**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 1,
    "message": "这是业务接口返回的用户信息",
    "timestamp": "2026-04-07T12:00:00.000Z"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-04-07T12:00:00.000Z"
}
```

**Token 无效**：
```json
{
  "code": 401,
  "message": "Invalid token"
}
```

---

## 十、与 Java 后端配合

### 10.1 需要 Java 侧确认的信息

| 项目 | 必须确认 |
|-----|---------|
| JWT 密钥 | 具体是什么？ |
| 算法 | HS256？ |
| Token payload | userId 字段名？ |
| Token 过期时间 | 7天？ |

### 10.2 测试 Token 兼容性

在 Java 侧生成一个 Token，用 Node.js 验证：

```bash
# Java 侧生成 Token（假设）
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxMjAwMDAwMH0.xxxxx

# Node.js 侧验证
curl http://localhost:3000/api/node/demo/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 十一、常见问题

### Q1: Token 验证失败怎么办？
1. 确认 Node.js 和 Java 使用相同的 JWT_SECRET
2. 确认算法都是 HS256
3. 检查 Token 是否过期

### Q2: 如何在不重启服务的情况下更新代码？
```bash
pm2 restart nodejs-service
```

### Q3: 如何查看实时日志？
```bash
pm2 logs nodejs-service --f
```

### Q4: 数据库连接失败？
1. 检查 DATABASE_HOST/DATABASE_PASSWORD 配置
2. 确认 MySQL 服务是否运行
3. 检查数据库用户权限

---

## 附录：文件清单

```
src/
├── main.ts                           # 应用入口
├── app.module.ts                     # 根模块
├── common/
│   ├── auth/
│   │   ├── jwt.middleware.ts        # ⭐ JWT 中间件（核心）
│   │   ├── auth.service.ts          # JWT 工具服务
│   │   └── auth.module.ts
│   ├── constants/
│   │   └── index.ts                 # 白名单
│   ├── logger/
│   │   ├── logger.service.ts        # 日志服务
│   │   └── logger.middleware.ts    # 请求日志
│   ├── filters/
│   │   └── http-exception.filter.ts # 异常过滤
│   ├── interceptors/
│   │   └── transform.interceptor.ts # 响应拦截
│   ├── monitoring/
│   │   ├── health.controller.ts     # 健康检查
│   │   ├── alert.service.ts         # 告警
│   │   └── metrics.service.ts       # 指标
│   └── config/
│       └── configuration.ts         # 配置
└── demo/                             # 业务示例
    ├── demo.module.ts
    ├── demo.controller.ts
    └── demo.service.ts
```
