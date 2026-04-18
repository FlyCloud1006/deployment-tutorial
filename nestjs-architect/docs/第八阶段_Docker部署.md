# 第八阶段：Docker 容器化与 Nginx 生产部署

> 本阶段目标：掌握 Docker 容器化部署与 Nginx 反向代理：Dockerfile 编写、多阶段构建、docker-compose 编排、Nginx 负载均衡、SSL 证书配置、PM2 进程管理，具备独立将 NestJS 应用部署到生产环境的能力。

---

## 📐 阶段目标

| 目标 | 说明 |
|------|------|
| 掌握 Docker 基础 | 镜像、容器、仓库、多阶段构建 |
| 编写 Dockerfile | NestJS 应用的 Docker 化 |
| 使用 docker-compose | 多容器编排（NestJS + MySQL + Redis + Nginx） |
| 掌握 Nginx | 反向代理、负载均衡、SSL 配置 |
| PM2 进程管理 | 日志、进程守护、自动重启 |
| 生产环境部署 | CI/CD 流水线、0 宕机部署 |

---

## 0️⃣ 先修导读：Docker 解决什么问题？

> 本阶段解决一个核心问题：**代码在我电脑上能跑，在服务器上为什么跑不起来？**

---

### 🔍 1. "在我电脑上能跑"的真正原因

**开发环境 vs 生产环境的差异**：

| 环境 | 系统 | Node.js 版本 | 依赖版本 | 配置文件 |
|------|------|-------------|---------|---------|
| 开发环境 | macOS | v22 | npm v10 | .env.local |
| 服务器 | Ubuntu 20.04 | v18 | npm v8 | .env.production |

**问题**：Node.js v22 的代码，在 v18 上可能报错！依赖版本不一致也会出问题。

#### 🐳 Docker 的解法："集装箱"

**集装箱**：不管货物是什么（电脑、手机、衣服），都用同一种集装箱运输。卸货方不需要知道货物是什么，只需要接收集装箱。

**Docker 镜像**：
- 把"运行环境 + 操作系统 + 依赖 + 代码"全部打包成一个**镜像**
- 服务器从镜像创建容器（Container）
- 服务器上只要装了 Docker，就能**原封不动**跑起来

**镜像 vs 容器 的区别**：
- 镜像 = 光盘（只读的模板）
- 容器 = 从光盘播放出来的电影（运行中的实例）
- 一张光盘可以同时放多部电影（一个镜像可以创建多个容器）

---

### 🔍 2. Docker vs 虚拟机

| 对比项 | Docker 容器 | 虚拟机（VM）|
|-------|------------|-------------|
| 启动速度 | 秒级 | 分钟级 |
| 体积 | MB 级 | GB 级 |
| 隔离性 | 进程级隔离（共享内核）| 完全隔离（独立操作系统）|
| 资源占用 | 极低 | 较高 |
| 性能损耗 | < 5% | 10-30% |
| 适用场景 | 轻量级服务、CI/CD | 需要完全隔离的环境 |

**一句话**：Docker 容器是"轻量级虚拟机"，但不是真正的虚拟机。

---

### 🔍 3. Nginx 反向代理：为什么要用？

#### 🔄 正向代理 vs 反向代理

**正向代理（翻墙）**：
- 你 -> 代理服务器（帮你要资源）-> Google
- Google 不知道是你在访问，只知道是代理服务器在访问
- **客户端知道目标服务器**（你配置了代理）

**反向代理（入口）**：
- 你 -> Nginx 反向代理 -> 后端服务 A/B/C
- 你不知道后端有几台服务器，Nginx 帮你转发
- **客户端不知道目标服务器**（只有 Nginx 知道）

#### 生活中的类比

**正向代理 = 代购**：你自己不能买海外的东西，找代购帮你买。

**反向代理 = 快递柜**：你取快递不知道包裹在哪个仓库，快递柜帮你找到并打开对应格口。

#### 反向代理的三大作用

1. **统一入口**：所有请求先到 Nginx，安全可控
2. **负载均衡**：多台服务器，Nginx 按策略分配
3. **SSL 终结**：HTTPS 加密解密在 Nginx 做，后端不用管

---

## 📂 示例代码目录

```
examples/stage8-docker-nginx/
├── 01-docker/
│   ├── Dockerfile                   # NestJS 多阶段构建
│   ├── .dockerignore               # 忽略文件
│   └── nginx/Dockerfile            # Nginx + SPA
├── 02-docker-compose/
│   ├── docker-compose.yml          # 开发环境
│   ├── docker-compose.prod.yml     # 生产环境
│   └── .env                       # 环境变量
├── 03-nginx/
│   ├── default.conf               # 默认配置
│   ├── ssl.conf                   # SSL 配置
│   └── nginx.conf                 # 主配置
└── 04-pm2/
    ├── ecosystem.config.js         # PM2 配置
    └── ecosystem.config.yml        # YAML 格式
```

---

## 1️⃣ Docker 基础

### 1.1 Docker 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker 核心概念                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Image（镜像）：应用的只读模板                                │
│  Container（容器）：镜像的运行实例                            │
│  Registry（仓库）：存储和分发镜像（Docker Hub / 私有仓库）    │
│                                                             │
│  Dockerfile：构建镜像的指令文件                              │
│                                                             │
│  常用命令：                                                 │
│  docker build -t my-app:1.0.0 .      # 构建镜像             │
│  docker run -p 3000:3000 my-app:1.0  # 运行容器            │
│  docker push my-app:1.0.0            # 推送镜像             │
│  docker ps                          # 查看运行中的容器        │
│  docker logs -f <container_id>       # 查看日志              │
│  docker exec -it <container_id> sh  # 进入容器              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Dockerfile 详解

### 2.1 多阶段构建（推荐）

```dockerfile
# examples/stage8-docker-nginx/01-docker/Dockerfile

# ========== 第一阶段：构建 ==========
FROM node:22-alpine AS builder

WORKDIR /app

# 复制依赖文件（利用 Docker 缓存层）
COPY package*.json ./

# 安装依赖（包括 devDependencies）
RUN npm ci

# 复制源代码
COPY . .

# ========== 构建阶段 ==========
# TypeScript 编译
RUN npm run build

# ========== 第二阶段：运行 ==========
FROM node:22-alpine AS production

# 创建非 root 用户（安全）
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# 只复制 package.json 和构建产物
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制源代码（如果需要）
COPY --from=builder /app/src ./src

# 设置用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# 启动命令
CMD ["node", "dist/main.js"]
```

### 2.2 前端 Vue/React 多阶段构建

```dockerfile
# 前端 Nuxt.js / Next.js 多阶段构建
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产镜像（包含 Nginx）
FROM nginx:alpine AS production

# 复制 Nginx 配置
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/.output/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2.3 .dockerignore

```dockerignore
# examples/stage8-docker-nginx/01-docker/.dockerignore

# 依赖
node_modules
npm-debug.log
yarn-error.log

# 源代码（生产环境不需要）
src
*.ts
!tsconfig.json

# 测试
coverage
*.test.ts
*.spec.ts
jest.config.*

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# Docker
Dockerfile
docker-compose.yml
.dockerignore

# 文档
*.md
docs

# 其他
.env.local
.env.*.local
*.log
logs
```

---

## 3️⃣ Docker Compose 编排

### 3.1 开发环境 docker-compose.yml

```yaml
# examples/stage8-docker-nginx/02-docker-compose/docker-compose.yml

version: '3.9'

services:
  # ========== NestJS 应用 ==========
  api:
    build:
      context: ../..
      dockerfile: nestjs-architect/examples/stage8-docker-nginx/01-docker/Dockerfile
    container_name: nestjs-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_HOST=mysql
      - DATABASE_PORT=3306
      - DATABASE_USER=root
      - DATABASE_PASSWORD=${DB_PASSWORD}
      - DATABASE_NAME=nestjs
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      # 开发模式：挂载源代码，支持热重载
      - ../../..:/app
      - /app/node_modules
    command: npm run start:dev

  # ========== MySQL 数据库 ==========
  mysql:
    image: mysql:8.0
    container_name: nestjs-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: nestjs
      MYSQL_USER: nestjs
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nestjs-network

  # ========== Redis 缓存 ==========
  redis:
    image: redis:7-alpine
    container_name: nestjs-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - nestjs-network

  # ========== Nginx 反向代理 ==========
  nginx:
    image: nginx:alpine
    container_name: nestjs-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - nestjs-network

volumes:
  mysql_data:
  redis_data:

networks:
  nestjs-network:
    driver: bridge
```

### 3.2 生产环境 docker-compose.prod.yml

```yaml
# examples/stage8-docker-nginx/02-docker-compose/docker-compose.prod.yml

version: '3.9'

services:
  api:
    build:
      context: ../..
      dockerfile: nestjs-architect/examples/stage8-docker-nginx/01-docker/Dockerfile
      args:
        - NODE_ENV=production
    container_name: nestjs-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=mysql
      - DATABASE_PORT=3306
      - DATABASE_USER=nestjs
      - DATABASE_PASSWORD=${DB_PASSWORD}
      - DATABASE_NAME=nestjs
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    networks:
      - nestjs-network

  mysql:
    image: mysql:8.0
    container_name: nestjs-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: nestjs
      MYSQL_USER: nestjs
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nestjs-network

  redis:
    image: redis:7-alpine
    container_name: nestjs-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    networks:
      - nestjs-network

  nginx:
    image: nginx:alpine
    container_name: nestjs-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - nestjs-network

volumes:
  mysql_data:
  redis_data:

networks:
  nestjs-network:
    driver: bridge
```

### 3.3 环境变量文件

```bash
# examples/stage8-docker-nginx/02-docker-compose/.env

# 数据库
DB_PASSWORD=MySecurePassword123!

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Redis（可选）
REDIS_PASSWORD=

# 时区
TZ=Asia/Shanghai
```

---

## 4️⃣ Nginx 配置详解

### 4.1 主配置文件

```nginx
# examples/stage8-docker-nginx/03-nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml application/xml+rss image/svg+xml;

    # 隐藏版本号
    server_tokens off;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    include /etc/nginx/conf.d/*.conf;
}
```

### 4.2 反向代理配置

```nginx
# examples/stage8-docker-nginx/03-nginx/conf.d/default.conf

# ========== NestJS API 反向代理 ==========
upstream nestjs_backend {
    least_conn;                      # 最少连接优先
    server api:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;                   # Keep-Alive 连接数
}

server {
    listen 80;
    server_name api.myapp.com;

    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.myapp.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # 日志
    access_log /var/log/nginx/api.access.log main;
    error_log /var/log/nginx/api.error.log;

    # API 路由
    location /api/ {
        # 代理到 NestJS
        proxy_pass http://nestjs_backend/api/;
        proxy_http_version 1.1;

        # 请求头传递
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 连接复用
        proxy_set_header Connection "";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;

        # 速率限制
        limit_req zone=api_limit burst=100 nodelay;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://nestjs_backend/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # 健康检查（直接响应，不经过代理）
    location /health {
        proxy_pass http://nestjs_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # 静态文件（如果有）
    location /static/ {
        alias /usr/share/nginx/html/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.3 负载均衡配置

```nginx
# 多后端负载均衡
upstream nestjs_cluster {
    # 方式1：轮询（默认）
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
    server 10.0.1.12:3000;

    # 方式2：加权轮询
    # server 10.0.1.10:3000 weight=5;
    # server 10.0.1.11:3000 weight=3;
    # server 10.0.1.12:3000 weight=2;

    # 方式3：IP Hash（同一 IP 始终访问同一后端）
    # ip_hash;

    # 方式4：最少连接
    # least_conn;
}

# 健康检查配置
server {
    listen 9000;
    server_name _;

    location / {
        proxy_pass http://nestjs_backend;
        proxy_connect_timeout 1s;
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }
}
```

### 4.4 速率限制配置

```nginx
# 在 nginx.conf 的 http 块中添加
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=1r/s;
limit_req_zone $server_name zone=server_limit:10m;

# 在 server 块中使用
server {
    # 全局限流
    limit_req zone=server_limit burst=50 nodelay;

    location /api/ {
        # API 限流：每秒 10 个请求，突发 100
        limit_req zone=api_limit burst=100 nodelay;
    }

    location /auth/login {
        # 登录限流：每秒 1 个请求，突发 5
        limit_req zone=login_limit burst=5;
    }
}
```

---

## 5️⃣ PM2 进程管理

### 5.1 PM2 配置文件

```javascript
// examples/stage8-docker-nginx/04-pm2/ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'nestjs-api',
      script: 'dist/main.js',
      cwd: './',
      instances: 2,                  // 启动 2 个实例（cluster 模式）
      exec_mode: 'cluster',          // cluster vs fork
      watch: false,                  // 生产环境不开启 watch
      max_memory_restart: '512M',   // 超过 512MB 重启
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
      },
      // 日志
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 进程行为
      autorestart: true,
      watch_restart: 5000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      // 信号
      kill_timeout: 5000,
      // APM 集成（如 Sentry）
      APM_SECRET: process.env.APM_SECRET,
    },
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: '43.167.209.167',
      ref: 'origin/master',
      repo: 'git@github.com:FlyCloud1006/rbac-project.git',
      path: '/var/www/nestjs-api',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
```

### 5.2 PM2 常用命令

```bash
# 启动
pm2 start ecosystem.config.js

# 停止
pm2 stop nestjs-api

# 重启
pm2 restart nestjs-api

# 重新加载（0 宕机）
pm2 reload nestjs-api

# 查看状态
pm2 list
pm2 monit          # 实时监控面板
pm2 status

# 日志
pm2 logs nestjs-api        # 查看日志
pm2 logs --lines 100      # 查看最近 100 行
pm2 flush                 # 清空日志

# 进程管理
pm2 delete all            # 删除所有进程
pm2 scale nestjs-api 4   # 扩容到 4 个实例

# 保存/恢复进程列表
pm2 save                  # 保存当前进程列表
pm2 resurrect             # 重启后恢复进程列表
pm2 startup               # 生成开机自启脚本
```

---

## 6️⃣ 生产环境部署完整流程

### 6.1 部署脚本

```bash
#!/bin/bash
# examples/stage8-docker-nginx/deploy.sh

set -e

# 变量
APP_NAME="nestjs-api"
APP_DIR="/var/www/nestjs-api"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/var/backups/${APP_NAME}"

echo "=== 开始部署 ${APP_NAME} ==="

# 1. 进入部署目录
cd ${APP_DIR}

# 2. 拉取最新代码
echo "拉取最新代码..."
git pull origin master

# 3. 构建 Docker 镜像
echo "构建 Docker 镜像..."
docker-compose -f ${DOCKER_COMPOSE_FILE} build api

# 4. 备份数据库（可选）
if [ -d "${BACKUP_DIR}" ]; then
    echo "备份数据库..."
    docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T mysql mysqldump -u root -p${DB_PASSWORD} nestjs > ${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql
fi

# 5. 停止旧容器
echo "停止旧容器..."
docker-compose -f ${DOCKER_COMPOSE_FILE} stop api

# 6. 启动新容器
echo "启动新容器..."
docker-compose -f ${DOCKER_COMPOSE_FILE} up -d api

# 7. 健康检查
echo "等待健康检查..."
for i in {1..30}; do
    if curl -sf http://localhost:3000/health > /dev/null; then
        echo "健康检查通过!"
        exit 0
    fi
    sleep 2
done

echo "健康检查失败，回滚..."
docker-compose -f ${DOCKER_COMPOSE_FILE} start api
exit 1
```

### 6.2 Nginx + Docker Compose 完整部署

```bash
# 一键启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f api

# 扩展实例
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

---

## 📝 练习题

1. **Dockerfile**：为 NestJS 应用编写一个多阶段构建 Dockerfile，包含：构建阶段优化（利用 Docker 缓存层）、生产阶段精简（不包含 node_modules）、非 root 用户运行、健康检查。

2. **docker-compose**：编写一个完整的 docker-compose.yml，包含：NestJS API（2 个实例）、MySQL（带健康检查和初始化脚本）、Redis（带持久化）、Nginx（反向代理 + SSL）。

3. **Nginx 配置**：配置 Nginx 实现：HTTPS（SSL 证书）、HTTP/2、反向代理到 NestJS、WebSocket 支持、Gzip 压缩、速率限制。

4. **PM2 + Nginx**：设计一个支持 0 宕机部署的方案，包含：PM2 cluster 模式、Nginx upstream 健康检查、Docker 滚动更新。

---

## 🔗 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [NestJS Deployment 官方文档](https://docs.nestjs.com/deployment)

---

**下一阶段预告**：[第九阶段：API 网关与 BFF 架构](./第九阶段_API网关.md)

> 理解网关在系统架构中的角色：路由转发、协议转换、统一鉴权、限流防爬、响应聚合、缓存网关。
ENDOFFILE