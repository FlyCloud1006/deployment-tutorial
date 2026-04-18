# NestJS 后端工程师学习路线

> 本路线专为零基础或从 Java/Spring Boot 转 NodeJS/NestJS 的开发者设计，覆盖从语言基础到生产级架构的全部知识体系。

---

## 📋 总体架构

```
第一阶段：Node.js 语言基础（地基）
    ↓
第二阶段：NestJS 核心概念与 HTTP 开发
    ↓
第三阶段：Java 全家桶 → NestJS 技术对标
    ↓
第四阶段：数据层（ORM、MySQL、Redis）
    ↓
第五阶段：认证授权（JWT、RBAC、OAuth2）
    ↓
第六阶段：微服务与通信（gRPC、RabbitMQ、Kafka）
    ↓
第七阶段：服务治理（配置中心、注册中心、Nacos）
    ↓
第八阶段：DevOps 必备（Docker、Nginx、代理）
    ↓
第九阶段：API 网关与 BFF（网关设计）
    ↓
第十阶段：生产级架构综合实战
```

---

## 📦 各阶段详细大纲

---

### 第一阶段：Node.js 语言基础

**目标**：掌握 Node.js 核心语法、异步编程、模块系统，为 NestJS 打下语言基础。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 1-1 | Node.js 简介与环境搭建 | V8 引擎、CommonJS vs ESM、npm/yarn/pnpm |
| 1-2 | 模块系统 | require/export、package.json、模块加载顺序 |
| 1-3 | 异步编程 | Callback、Promise、async/await、Event Loop |
| 1-4 | 内置模块 | fs、path、http、stream、buffer、crypto |
| 1-5 | Node.js 核心设计思想 | 非阻塞 I/O、单线程、事件驱动、Worker Threads |

**产出文档**：`docs/第一阶段_Node.js语言基础.md`

---

### 第二阶段：NestJS 核心概念与 HTTP 开发

**目标**：掌握 NestJS 核心概念（Module、Controller、Provider），能够独立开发 RESTful API。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 2-1 | NestJS 简介与生态 | 理念、vs Express、@nestjs/* 生态一览 |
| 2-2 | 项目初始化 | CLI、目录结构约定、开发环境配置 |
| 2-3 | Module 模块系统 | 根模块、功能模块、共享模块、动态模块 |
| 2-4 | Controller 控制器 | 路由装饰器、@Param/@Query/@Body、响应处理 |
| 2-5 | Provider & DI | 依赖注入、控制反转、@Injectable、生命周期 |
| 2-6 | 中间件 | 全局中间件、路由级中间件、中间件堆栈 |
| 2-7 | 异常过滤器与拦截器 | HttpException、Filters、Interceptors、AOP 切面 |
| 2-8 | 管道与守卫 | ValidationPipe、Guard、角色权限守卫 |

**产出文档**：`docs/第二阶段_NestJS核心概念与HTTP开发.md`

---

### 第三阶段：Java 全家桶 → NestJS 技术对标

**目标**：以 Java 开发者熟悉的视角，系统对标 Spring Boot 生态与 NestJS 的对应关系，消除技术迁移焦虑。

| 序号 | 章节 | Java/Spring | NestJS 对应 |
|------|------|-------------|-------------|
| 3-1 | 框架对标 | Spring Boot | @nestjs/core |
| 3-2 | Web 层对标 | Spring MVC / Servlet | Controller + Middleware |
| 3-3 | ORM 对标 | Spring Data JPA / MyBatis | TypeORM / Prisma / Sequelize |
| 3-4 | 事务对标 | @Transactional | TypeORM DataSource / QueryRunner |
| 3-5 | 认证对标 | Spring Security / Shiro | @nestjs/passport + JWT + Guards |
| 3-6 | 定时任务对标 | @Scheduled + Quartz | @nestjs/schedule + Cron |
| 3-7 | 日志对标 | SLF4J + Logback | Winston / Pino |
| 3-8 | 配置对标 | application.yml/@ConfigurationProperties | @nestjs/config + .env |
| 3-9 | 注解对标 | @Component/@Service/@Repository | @Injectable()（统一） |
| 3-10 | 蓝图/扩展对标 | Spring Boot Starter | @nestjs/* 生态包 |
| 3-11 | 熔断器对标 | Sentinel / Resilience4j | @nestjs/throttler + circuit breaker |
| 3-12 | 模板引擎对标 | Thymeleaf / Freemarker | Server-side Rendering（非主场景） |

**产出文档**：`docs/第三阶段_Java全家桶与NestJS技术对标.md`

---

### 第四阶段：数据层（ORM、MySQL、Redis）

**目标**：掌握 TypeORM/Prisma 作为主力 ORM，熟练使用 Redis 缓存与数据结构。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 4-1 | TypeORM 快速上手 | Entity、Repository、Relation、QueryBuilder |
| 4-2 | Prisma ORM | Schema、Prisma Client、Migration、Prisma Studio |
| 4-3 | MySQL 高级查询 | 关联查询、子查询、事务、锁、分页 |
| 4-4 | Redis 基础 | 数据类型（String/Hash/List/Set/Sorted Set）、持久化 |
| 4-5 | Redis 实战 | 缓存策略、分布式锁、延时队列、位图、HyperLogLog |
| 4-6 | Redis + NestJS | @nestjs/cache-manager、Redis OM、缓存防穿透/穿透/雪崩 |
| 4-7 | 数据库连接池 | HikariCP → TypeORM DataSource 连接池调优 |
| 4-8 | 数据库索引与优化 | 索引设计、慢查询分析、EXPLAIN |

**产出文档**：`docs/第四阶段_数据层MySQL与Redis.md`

---

### 第五阶段：认证授权（JWT、RBAC、OAuth2）

**目标**：掌握完整的身份认证与权限控制体系，能够独立实现 JWT 认证 + RBAC 权限管理。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 5-1 | JWT 认证原理 | Token 结构、RS256/HS256、刷新机制 |
| 5-2 | NestJS + JWT | @nestjs/jwt、Passport-JWT、Guards 鉴权 |
| 5-3 | 登录与 Token 管理 | 登录接口、Token 刷新、黑名单、强制下线 |
| 5-4 | RBAC 权限模型 | 用户-角色-权限、菜单权限、按钮权限 |
| 5-5 | CASL 权限框架 | 基于角色的 ACL、UI 权限控制、API 级别权限 |
| 5-6 | OAuth2.0 与 SSO | 授权码模式、四种模式、第三方登录 |
| 5-7 | 单点登录（SSO） | CAS 协议、JWT 跨域、Session 共享 |
| 5-8 | 密码安全 | Bcrypt、密码强度、盐值、撞库防护 |

**产出文档**：`docs/第五阶段_认证授权与RBAC权限管理.md`

---

### 第六阶段：微服务与通信（gRPC、RabbitMQ、Kafka）

**目标**：掌握 NestJS 微服务开发模式，具备构建分布式系统的通信能力。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 6-1 | NestJS 微服务架构 | 入门模式、Hybrid Application、ClientProxy |
| 6-2 | gRPC 通信 | Protobuf、@nestjs/microservices + gRPC、模式优先 API |
| 6-3 | RabbitMQ 消息队列 | 交换机、队列、Binding、消息确认、手动 ACK |
| 6-4 | NestJS + RabbitMQ | @nestjs/microservices + RMQ、消息模式（Request/Reply、Event） |
| 6-5 | Kafka 消息流 | Topic、Partition、Consumer Group、Offset 机制 |
| 6-6 | NestJS + Kafka | @nestjs/microservices + KafkaJS、事件驱动架构 |
| 6-7 | WebSocket 通信 | @nestjs/websockets、Gateway、房间、命名空间 |
| 6-8 | 消息队列设计模式 | 死信队列、延迟队列、重试机制、幂等性保障 |

**产出文档**：`docs/第六阶段_微服务与消息通信.md`

---

### 第七阶段：服务治理（配置中心、注册中心）

**目标**：掌握分布式环境下配置管理与服务发现机制，理解服务治理核心思想。

> **注**：Nacos 是 Java 生态（阿里）的产品，Node.js/NestJS 生态有对应替代方案。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 7-1 | 配置中心对标 Nacos | Apollo / Consul / etcd → @nestjs/config + 自管理 |
| 7-2 | Consul 实战 | 服务注册/发现、健康检查、KV 存储 |
| 7-3 | NestJS + Consul | 动态配置、热更新、配置版本管理 |
| 7-4 | 服务注册中心 | Eureka → Consul/Nginx / Kubernetes Service |
| 7-5 | 熔断与限流 | 熔断器模式（Circuit Breaker）、限流算法（Token Bucket/Leaky Bucket） |
| 7-6 | 链路追踪 | OpenTelemetry + Jaeger / Zipkin、分布式日志 traceId |
| 7-7 | 健康检查 | @nestjs/terminus、Docker Healthcheck、K8s Probe |
| 7-8 | 配置分离策略 | 多环境（dev/staging/prod）、ConfigMap、环境变量注入 |

**产出文档**：`docs/第七阶段_服务治理与配置中心.md`

---

### 第八阶段：DevOps 必备（Docker、Nginx、代理）

**目标**：掌握 Docker 容器化部署与 Nginx 反向代理，具备独立将 NestJS 应用部署到生产环境的能力。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 8-1 | Docker 基础 | 镜像、容器、仓库、Dockerfile 编写 |
| 8-2 | NestJS + Docker | 多阶段构建、.dockerignore、健康检查 |
| 8-3 | Docker Compose | 多容器编排（NestJS + MySQL + Redis + Nginx） |
| 8-4 | Docker 网络 | Bridge、Host、Overlay、VPC、网络模式 |
| 8-5 | Nginx 反向代理 | location、upstream、负载均衡（轮询/IP Hash/Least_conn） |
| 8-6 | Nginx 高级特性 | SSL 证书、HTTP/2、Gzip 压缩、静态资源缓存 |
| 8-7 | NestJS + Nginx | 动静分离、API 代理、跨域配置、CORS |
| 8-8 | 生产环境部署 | PM2 进程管理、日志轮转、自动重启、0宕机部署 |
| 8-9 | 环境变量管理 | .env、Vault、敏感信息注入、Docker Secrets |

**产出文档**：`docs/第八阶段_Docker容器化与Nginx生产部署.md`

---

### 第九阶段：API 网关与 BFF（网关设计）

**目标**：理解网关在系统架构中的角色，能够设计与实现 API Gateway。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 9-1 | API 网关概念 | 网关职责、路由转发、协议转换、统一入口 |
| 9-2 | NestJS Gateway | @nestjs/platform-express、NestJS 作为网关 |
| 9-3 | 限流与防护 | rate-limiting、IP 白名单、黑名单、防爬 |
| 9-4 | 统一鉴权 | Token 校验、单点登录会话、接口去重 |
| 9-5 | 响应聚合 | BFF 模式、多接口聚合、GraphQL Federation |
| 9-6 | 缓存网关 | Redis 缓存、CDN 边缘缓存、304 协商缓存 |
| 9-7 | 监控与告警 | 请求日志、Metrics、Prometheus + Grafana |

**产出文档**：`docs/第九阶段_API网关与BFF架构设计.md`

---

### 第十阶段：生产级架构综合实战

**目标**：以一个真实项目为载体，串联全部知识体系，形成完整的技术闭环。

| 序号 | 章节 | 核心内容 |
|------|------|---------|
| 10-1 | 架构设计 | 分层架构、微服务拆分、高可用设计 |
| 10-2 | 项目工程化 | ESLint + Prettier + Husky + CommitLint + Lint-Staged |
| 10-3 | 测试体系 | 单元测试（Jest）、集成测试、E2E 测试、覆盖率 |
| 10-4 | CI/CD 流水线 | GitHub Actions / GitLab CI、Docker 构建、镜像推送 |
| 10-5 | 生产问题排查 | 日志分析、内存泄漏、CPU 爆高、死循环定位 |
| 10-6 | 性能优化 | 连接池调优、缓存命中率、N+1 查询、异步化 |
| 10-7 | 高并发设计 | 缓存 + 队列 + 多级分流、秒杀场景实战 |
| 10-8 | 安全加固 | HTTPS、HSTS、CSP、防 SQL 注入、XSS/CSRF 防护 |

**产出文档**：`docs/第十阶段_生产级架构综合实战.md`

---

## ⏱️ 学习周期建议

| 阶段 | 预计时间 | 难度 |
|------|---------|------|
| 第一阶段 Node.js 基础 | 3-5 天 | ⭐ |
| 第二阶段 NestJS 核心 | 5-7 天 | ⭐⭐ |
| 第三阶段 Java→NestJS 对标 | 2-3 天 | ⭐ |
| 第四阶段 MySQL + Redis | 5-7 天 | ⭐⭐ |
| 第五阶段 认证授权 | 4-6 天 | ⭐⭐⭐ |
| 第六阶段 微服务通信 | 5-7 天 | ⭐⭐⭐ |
| 第七阶段 服务治理 | 3-5 天 | ⭐⭐⭐ |
| 第八阶段 Docker + Nginx | 3-5 天 | ⭐⭐ |
| 第九阶段 API 网关 | 2-3 天 | ⭐⭐ |
| 第十阶段 综合实战 | 5-7 天 | ⭐⭐⭐ |

**总建议周期**：6-8 周（每天 3-4 小时）

---

## 📚 推荐资料

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 官方文档](https://typeorm.io/)
- [Redis 设计与实现](http://redisbook.com/)
- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 文档](https://nginx.org/en/docs/)

---

## 🚀 执行方式

1. 按阶段顺序执行，每个阶段产出一份完整 Markdown 文档
2. 文档存放路径：`/docs/第X阶段_阶段名称.md`
3. 每完成一个阶段，推送到 GitHub，再开始下一个
4. 每个阶段配有代码示例（位于 `examples/` 目录）

---

*本规划随学习进度动态调整，以实际产出为准。*
