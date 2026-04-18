# 第三阶段：Java 全家桶与 NestJS 技术对标

> 本阶段专为有 Java/Spring Boot 基础的开发者设计，以熟悉的视角快速理解 NestJS 的对应概念，消除技术迁移焦虑，实现 Spring Boot → NestJS 的平滑过渡。

---

## 📐 阶段目标

| 目标 | 说明 |
|------|------|
| 建立技术对标思维 | 看到 Spring Boot 概念 → 立刻想到 NestJS 对应方案 |
| 掌握对应关系速查 | 表格化对照，随用随查 |
| 理解核心差异 | 装饰器 vs 注解、依赖注入差异、运行机制差异 |
| 具备技术选型能力 | 根据场景选择合适的 NestJS 方案 |

---

## 0️⃣ 先修导读：为什么 Java 开发者要学 NestJS？

> 本阶段不是让你"忘掉 Java 学 NestJS"，而是**建立技术映射关系**——Java 里这个概念在 NestJS 里对应什么？两者各有什么优缺点？

---

### 🔍 1. Java vs NestJS 核心差异

| 维度 | Java/Spring | NestJS/Node.js |
|------|------------|----------------|
| 语言 | Java（强类型，编译时检查）| TypeScript（强类型，编译时+运行时）|
| 生态 | Spring 全家桶（大而全）| 社区生态（灵活可组合）|
| 性能 | 多线程（高并发吃线程资源）| 单线程+事件循环（高 I/O 很强）|
| 学习曲线 | 陡峭（框架太多）| 平缓（装饰器语法直观）|
| 适用场景 | 企业级后台（银行、ERP）| 互联网产品（快速迭代、轻量）|

### 🔍 2. 技术概念对照表（核心速查）

| Java Spring 概念 | NestJS 等价 | 一句话理解 |
|-----------------|------------|---------|
| `@Service` | `@Injectable()` | 业务逻辑组件（本质一样）|
| `@Component` | `@Injectable()` | 通用组件（本质一样）|
| `@Repository` | TypeORM Repository / 自定义 Repository | 数据访问层封装 |
| `@Autowired` | constructor 注入 | 自动注入依赖 |
| `@Bean` | Provider（providers 数组）| 手动注册组件 |
| `@RequestMapping` | `@Controller` + `@Get/Post...` | 定义 HTTP 路由 |
| Spring IOC | NestJS Module + IoC Container | 框架管理依赖创建 |
| MyBatis XML | TypeORM Entity + QueryBuilder | ORM 数据操作 |
| `@Transactional` | `@Transactional()` / queryRunner | 事务管理 |
| RedisTemplate | `@nestjs/cache-manager` + Redis | 缓存操作 |
| Dubbo / Feign | `@nestjs/microservices` + gRPC | 微服务通信 |
| Nacos / Consul | `@nestjs/microservices` + Consul | 服务注册发现 |
| Sentinel | 限流 Guard + 熔断 Interceptor | 限流熔断 |
| Seata | 手动补偿事务 / Saga 模式 | 分布式事务 |
| `@PreAuthorize` | `@SetMetadata` + RolesGuard | 权限校验 |
| `application.yml` | `.env` + `@nestjs/config` | 配置管理 |
| `@Scheduled` | `@nestjs/schedule` | 定时任务 |
| Spring AOP | Interceptor + Guard + Pipe | 切面编程 |
| Filter | Middleware | 请求过滤器 |
| `@ControllerAdvice` | Exception Filter | 全局异常处理 |

### 🔍 3. 你应该怎么学这个阶段？

**不要死记硬背**，而是：
1. 看到 Java 概念 → 想 NestJS 里有没有类似的实现
2. 理解两者**解决的问题相同，但思路不同**
3. 代码示例：先看 Java 版理解问题，再看 NestJS 版理解解法

**记住**：NestJS 的很多概念其实**借鉴自 Spring**（所以才叫"Nest"JS，暗示 NestJS = Node.js 版的 Spring）。如果你熟悉 Spring，学 NestJS 会很快。

---

## 📂 示例代码目录

```
examples/stage3-java-vs-nestjs/
├── 01-framework/
│   ├── spring-boot-app.java      # Spring Boot 入口对比
│   └── nestjs-main.ts            # NestJS 入口对比
├── 02-orm/
│   ├── jpa-repository.java       # Spring Data JPA 示例
│   └── typeorm-repository.ts     # TypeORM 示例
├── 03-transaction/
│   ├── spring-transaction.java   # Spring 事务示例
│   └── typeorm-transaction.ts    # TypeORM 事务示例
├── 04-security/
│   ├── spring-security.java      # Spring Security 配置
│   └── nestjs-passport.ts         # NestJS + Passport JWT
├── 05-scheduled/
│   ├── spring-scheduled.java     # Spring 定时任务
│   └── nestjs-scheduled.ts       # NestJS Schedule
├── 06-logging/
│   ├── logback-config.xml        # Logback 配置
│   └── nestjs-winston.ts         # Winston 日志
├── 07-config/
│   ├── application-yml.java      # application.yml
│   └── config-module.ts           # @nestjs/config
└── 08-circuit-breaker/
    ├── resilience4j.java          # Resilience4j 配置
    └── throttler-guard.ts        # NestJS 限流守卫
```

---

## 1️⃣ 框架层面对标

### 1.1 整体架构对比

```
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot vs NestJS 架构对比              │
├────────────────────────────┬────────────────────────────────┤
│       Spring Boot          │           NestJS                │
├────────────────────────────┼────────────────────────────────┤
│     @SpringBootApplication │     NestFactory.create()        │
│     Application.java      │     main.ts                     │
├────────────────────────────┼────────────────────────────────┤
│     @Configuration         │     @Module()                  │
│     @Bean                  │     providers: []               │
├────────────────────────────┼────────────────────────────────┤
│     @Controller/@RestController │ @Controller()           │
│     @GetMapping/@PostMapping │     @Get()/@Post()         │
├────────────────────────────┼────────────────────────────────┤
│     @Service               │     @Injectable() class          │
│     @Repository           │     providers: []                │
├────────────────────────────┼────────────────────────────────┤
│     @Autowired             │     constructor injection       │
├────────────────────────────┼────────────────────────────────┤
│     application.yml/.properties │ @nestjs/config + .env   │
├────────────────────────────┼────────────────────────────────┤
│     Spring MVC Filter      │     Middleware                 │
│     HandlerInterceptor      │     Guard + Interceptor        │
├────────────────────────────┼────────────────────────────────┤
│     @ExceptionHandler      │     Exception Filter            │
│     @ControllerAdvice      │     @Catch()                    │
├────────────────────────────┼────────────────────────────────┤
│     AOP (@Aspect)          │     Interceptor + Decorator    │
└────────────────────────────┴────────────────────────────────┘
```

### 1.2 项目入口对比

```java
// Spring Boot 入口（Java）
// examples/stage3-java-vs-nestjs/01-framework/spring-boot-app.java

package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

// REST 控制器
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public User findById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public User create(@RequestBody @Valid CreateUserRequest request) {
        return userService.create(request);
    }
}
```

```typescript
// NestJS 入口（TypeScript）
// examples/stage3-java-vs-nestjs/01-framework/nestjs-main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();

// User 控制器
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

### 1.3 核心差异

| 维度 | Spring Boot | NestJS |
|------|------------|--------|
| 语言 | Java（强类型，编译时检查） | TypeScript（可选类型，编译时 + 运行时） |
| 依赖注入 | 构造器注入（Java 反射） | 构造器注入（TypeScript + 装饰器） |
| 路由 | 注解驱动（编译后保留） | 装饰器驱动（运行时有装饰器元数据） |
| 模块化 | Spring @Bean / @ComponentScan | @Module 声明式 |
| 运行方式 | 打包成 JAR 运行 | 直接 Node.js 运行 / 打包后运行 |
| 生态 | Spring 全家桶 | @nestjs/* 插件生态 |

---

## 2️⃣ ORM 层面对标

### 2.1 Spring Data JPA vs TypeORM

```java
// Spring Data JPA（Java）
// examples/stage3-java-vs-nestjs/02-orm/jpa-repository.java

package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 方法命名查询（Spring Data 自动解析）
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByAgeBetween(int minAge, int maxAge);

    // JPQL 查询
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.status = :status")
    Optional<User> findByUsernameAndStatus(
        @Param("username") String username,
        @Param("status") String status
    );

    // 原生 SQL
    @Query(value = "SELECT * FROM users WHERE age > :age LIMIT 10", nativeQuery = true)
    List<User> findTop10ByAge(@Param("age") int age);
}

// Service 使用
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User create(User user) {
        return userRepository.save(user);  // JPA auto-generates ID
    }
}
```

```typescript
// TypeORM（TypeScript）
// examples/stage3-java-vs-nestjs/02-orm/typeorm-repository.ts

import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  age: number;

  @Column({ default: 'active' })
  status: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user); // TypeORM auto-generates ID
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findByAgeBetween(minAge: number, maxAge: number): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.age BETWEEN :minAge AND :maxAge', { minAge, maxAge })
      .getMany();
  }

  async findByUsernameAndStatus(username: string, status: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username, status } });
  }

  async findTop10ByAge(age: number): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.age > :age', { age })
      .limit(10)
      .getMany();
  }
}
```

### 2.2 MyBatis vs QueryBuilder

```java
// MyBatis XML 映射（Java）
// mapper/UserMapper.xml
<mapper namespace="com.example.mapper.UserMapper">
    <select id="findById" resultType="User">
        SELECT * FROM users WHERE id = #{id}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO users (username, email) VALUES (#{username}, #{email})
    </insert>
</mapper>
```

```typescript
// TypeORM QueryBuilder（TypeScript）
// 更接近 MyBatis 的 SQL 控制感
async findActiveUsersWithOrders(page: number, limit: number) {
  return this.userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.orders', 'order')
    .where('user.status = :status', { status: 'active' })
    .andWhere('user.age >= :minAge', { minAge: 18 })
    .orderBy('user.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount(); // 返回 [users, total]
}
```

---

## 3️⃣ 事务层面对标

### 3.1 @Transactional 对比

```java
// Spring 事务（Java）
// examples/stage3-java-vs-nestjs/03-transaction/spring-transaction.java

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @Transactional(rollbackFor = Exception.class)  // 声明式事务
    public Order createOrder(Long userId, BigDecimal amount) {
        // 1. 检查用户余额
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        if (user.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("余额不足");
        }

        // 2. 扣减余额
        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);

        // 3. 创建订单
        Order order = new Order();
        order.setUserId(userId);
        order.setAmount(amount);
        order.setStatus("pending");
        order = orderRepository.save(order);

        // 4. 调用支付服务（如果这里抛异常，整个事务回滚）
        paymentService.processPayment(order.getId(), amount);

        return order;
    }

    // 编程式事务（较少使用）
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void complexOperation() {
        transactionTemplate.executeWithoutResult(status -> {
            // 事务内逻辑
            try {
                // do something
            } catch (Exception e) {
                status.setRollbackOnly(); // 手动回滚
            }
        });
    }
}
```

```typescript
// TypeORM 事务（TypeScript）
// examples/stage3-java-vs-nestjs/03-transaction/typeorm-transaction.ts

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepo: UserRepository,
    private readonly orderRepo: OrderRepository,
  ) {}

  async createOrder(userId: number, amount: number): Promise<Order> {
    // 方式1：QueryRunner（推荐，用于需要更细粒度控制的场景）
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 检查用户余额
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) throw new UserNotFoundException(userId);

      if (user.balance < amount) {
        throw new InsufficientBalanceException('余额不足');
      }

      // 2. 扣减余额
      await queryRunner.manager.update(User, userId, {
        balance: user.balance - amount,
      });

      // 3. 创建订单
      const order = queryRunner.manager.create(Order, {
        userId,
        amount,
        status: 'pending',
      });
      const savedOrder = await queryRunner.manager.save(order);

      // 4. 提交事务
      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 方式2：使用 DataSource 的 withTransaction（NestJS 风格）
  async createOrderWithHelper(userId: number, amount: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) throw new UserNotFoundException(userId);

      if (user.balance < amount) {
        throw new InsufficientBalanceException('余额不足');
      }

      await manager.update(User, userId, { balance: user.balance - amount });

      const order = manager.create(Order, { userId, amount, status: 'pending' });
      return manager.save(order);
    });
  }
}
```

### 3.2 事务隔离级别对比

```java
// Spring 事务隔离级别
@Transactional(isolation = Isolation.READ_COMMITTED)
```

```typescript
// TypeORM 事务隔离级别
await queryRunner.startTransaction('READ COMMITTED');
```

---

## 4️⃣ 安全认证层面对标

### 4.1 Spring Security + JWT vs NestJS + Passport

```java
// Spring Security 配置（Java）
// examples/stage3-java-vs-nestjs/04-security/spring-security.java

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login", "/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}

// JWT Token Provider
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;

    public String generateToken(Authentication auth) {
        return Jwts.builder()
            .setSubject(auth.getName())
            .claim("roles", auth.getAuthorities())
            .setIssuedAt(new Date())
            .setExpiration(new Date(now + 3600000))
            .signWith(SignatureAlgorithm.HS256, jwtSecret)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
```

```typescript
// NestJS + Passport JWT（TypeScript）
// examples/stage3-java-vs-nestjs/04-security/nestjs-passport.ts

// ========== JWT 策略 ==========
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: { sub: number; username: string; roles: string[] }) {
    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}

// ========== JWT Auth Guard ==========
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// ========== Auth Module ==========
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtModule],
})
export class AuthModule {}

// ========== Auth Service ==========
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.validatePassword(username, password);
    if (!user) throw new UnauthorizedException('用户名或密码错误');

    const payload = { sub: user.id, username: user.username, roles: user.roles };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: 7 * 24 * 3600,
    };
  }
}
```

### 4.2 权限校验对比

```java
// Spring Security 权限注解
@PreAuthorize("hasRole('ADMIN') and hasAuthority('USER_WRITE')")
@PostMapping("/admin/users")
public User createUser(@RequestBody UserRequest request) { ... }

// 自定义权限检查
@PreAuthorize("@permissionService.canAccess(#userId, authentication)")
public void updateUser(Long userId, UserRequest request) { ... }
```

```typescript
// NestJS 权限校验
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  manageUsers() { ... }
}

// 自定义权限装饰器
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// 权限守卫
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = context.getHandler().getArgs();
    // 检查用户权限
    return true;
  }
}
```

---

## 5️⃣ 定时任务层面对标

### 5.1 @Scheduled vs @nestjs/schedule

```java
// Spring Boot 定时任务（Java）
// examples/stage3-java-vs-nestjs/05-scheduled/spring-scheduled.java

@SpringBootApplication
@EnableScheduling  // 开启定时任务
public class DemoApplication { ... }

@Service
public class ReportService {

    // 每秒执行
    @Scheduled(fixedRate = 1000)
    public void generateReport() {
        System.out.println("每秒执行一次");
    }

    // 固定延迟（上次结束到下次开始）
    @Scheduled(fixedDelay = 5000)
    public void cleanup() {
        System.out.println("上次执行完成后，等待5秒再执行");
    }

    // initialDelay：启动后延迟N毫秒再开始
    @Scheduled(initialDelay = 10000, fixedDelay = 30000)
    public void init() {
        System.out.println("应用启动10秒后，每30秒执行一次");
    }

    // Cron 表达式
    @Scheduled(cron = "0 0 2 * * MON-FRI")  // 工作日每天凌晨2点
    public void mondayToFridayJob() { ... }

    @Scheduled(cron = "0 */10 * * * *")    // 每10分钟
    public void everyTenMinutes() { ... }

    // 异步执行
    @Async
    @Scheduled(fixedDelay = 1000)
    public void asyncTask() {
        System.out.println("异步执行，不阻塞主线程");
    }
}

// Quartz 配置（更复杂调度场景）
@Configuration
public class QuartzConfig {
    @Bean
    public JobDetail printJobDetail() {
        return JobBuilder.newJob().ofType(PrintJob.class)
            .storeDurably()
            .withIdentity("printJob")
            .build();
    }

    @Bean
    public Trigger printTrigger() {
        return TriggerBuilder.newTrigger()
            .forJob(printJobDetail())
            .withIdentity("printTrigger")
            .withSchedule(CronScheduleBuilder.cronSchedule("0/5 * * * * ?"))
            .build();
    }
}
```

```typescript
// NestJS Schedule（TypeScript）
// examples/stage3-java-vs-nestjs/05-scheduled/nestjs-scheduled.ts

import { Module, ScheduleModule } from '@nestjs/schedule';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),  // forRoot() 启用定时任务
  ],
})
export class AppModule {}

// ========== Cron 任务 ==========
@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  // 每秒执行
  @Cron('* * * * * *')  // 5个 * = 每秒（6位 Cron = 秒级）
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

  // 启动后延迟10秒，然后每30秒执行
  @Cron('10,30,50 * * * * *')
  handleEvery30SecondsAfterDelay() {
    this.logger.debug('每30秒的10、30、50秒时执行');
  }

  // ========== 动态添加定时任务 ==========
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

  // ========== 取消/暂停任务 ==========
  stopTask() {
    const job = this.schedulerRegistry.getCronJob('dynamic-hourly');
    job.stop(); // 暂停
    job.start(); // 恢复
  }

  // ========== 获取所有任务 ==========
  getTasks() {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    cronJobs.forEach((job, name) => {
      this.logger.log(`任务: ${name}, 下次执行: ${job.nextDate?.toISO()}`);
    });
  }
}

// ========== @Interval（基于间隔，类似 fixedRate）==========
@Interval(5000)  // 每5000毫秒
handleInterval() {
  this.logger.debug('每5秒执行（忽略上次执行时间）');
}

// ========== @Timeout（启动后只执行一次，类似 initialDelay）==========
@Timeout(10000)  // 应用启动10秒后执行一次
handleTimeout() {
  this.logger.debug('应用启动10秒后，只执行一次');
}
```

---

## 6️⃣ 日志层面对标

### 6.1 SLF4J + Logback vs Winston/Pino

```java
// SLF4J + Logback（Java）
// examples/stage3-java-vs-nestjs/06-logging/logback-config.xml

// logback-spring.xml
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-logs}/spring}"/>

    <!-- Console Appender -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- File Appender（带滚动）-->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxHistory>30</maxHistory>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- JSON 格式（用于 ELK） -->
    <appender name="JSON" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}.json</file>
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="ch.qos.logback.contrib.json.classic.JsonLayout">
                <timestampFormat>yyyy-MM-dd'T'HH:mm:ss.SSSZ</timestampFormat>
                <appendLineSeparator>true</appendLineSeparator>
            </layout>
        </encoder>
    </appender>

    <!-- 生产环境异步写入 -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="FILE"/>
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE"/>
    </root>

    <logger name="com.example" level="DEBUG"/>
    <logger name="org.springframework.web" level="WARN"/>
    <logger name="org.hibernate" level="WARN"/>
</configuration>

// Java 代码
@RestController
public class UserController {
    private final Logger logger = LoggerFactory.getLogger(UserController.class);

    @GetMapping("/users/{id}")
    public User findById(@PathVariable Long id) {
        logger.debug("查找用户: id={}", id);
        logger.info("用户访问: id={}, 时间={}", id, LocalDateTime.now());
        try {
            return userService.findById(id);
        } catch (Exception e) {
            logger.error("查找用户失败: id={}", id, e);
            throw e;
        }
    }
}
```

```typescript
// Winston + NestJS（TypeScript）
// examples/stage3-java-vs-nestjs/06-logging/nestjs-winston.ts

import { Module, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

// ========== Winston 日志格式 ==========
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (Object.keys(meta).length) log += ` ${JSON.stringify(meta)}`;
    if (stack) log += `\n${stack}`;
    return log;
  }),
);

// ========== JSON 格式（用于 ELK） ==========
const jsonLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

// ========== 创建 Winston Logger ==========
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? jsonLogFormat : logFormat,
  transports: [
    // Console（开发环境）
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat,
      ),
    }),

    // 文件滚动（生产环境）
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',       // 单文件最大 100MB
      maxFiles: '30d',       // 保留30天
      format: jsonLogFormat,
    }),

    // 错误日志单独记录
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: jsonLogFormat,
    }),
  ],
});

// ========== NestJS Logger 实现 ==========
@Injectable()
export class AppLogger implements NestLoggerService {
  log(message: string, context?: string) {
    logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    logger.verbose(message, { context });
  }
}

// ========== 全局注册 ==========
// main.ts
app.useLogger(app.get(AppLogger));

// ========== 在服务中使用 ==========
@Injectable()
export class UserService {
  private readonly logger = new AppLogger();

  async findById(id: number) {
    this.logger.debug(`查找用户: id=${id}`, 'UserService');
    try {
      const user = await this.userRepo.findOne({ where: { id } });
      this.logger.log(`用户访问: id=${id}`, 'UserService');
      return user;
    } catch (e) {
      this.logger.error(`查找用户失败: id=${id}`, e.stack, 'UserService');
      throw e;
    }
  }
}
```

---

## 7️⃣ 配置管理层面对标

### 7.1 application.yml vs @nestjs/config

```yaml
# Spring Boot 配置
# application.yml
spring:
  application:
    name: my-app
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD}

server:
  port: 8080
  servlet:
    context-path: /api

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

logging:
  level:
    com.example: DEBUG
    org.springframework.web: WARN
```

```typescript
// NestJS 配置
// examples/stage3-java-vs-nestjs/07-config/config-module.ts

// .env 文件
// DATABASE_HOST=localhost
// DATABASE_PORT=3306
// DATABASE_USER=root
// DATABASE_PASSWORD=secret
// DATABASE_NAME=mydb
// REDIS_HOST=localhost
// REDIS_PORT=6379
// JWT_SECRET=mysecretkey
// JWT_EXPIRATION=7d
// NODE_ENV=development

// config/app.config.ts
export default () => ({
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
});

// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           // 全局注册，无需每个模块单独导入
      envFilePath: ['.env.development', '.env.production', '.env'],
      load: [appConfig],        // 加载配置对象
      cache: true,              // 缓存配置（避免每次读取）
      expandVariables: true,    // 支持变量展开，如 DATABASE_URL=${DB_HOST}:${DB_PORT}
    }),
  ],
})
export class AppModule {}

// 在服务中使用
@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const dbHost = this.configService.get<string>('database.host');
    const jwtSecret = this.configService.get('jwt.secret');
    const port = this.configService.get<number>('app.port');
  }

  // 类型安全的方式
  get dbConfig() {
    return {
      host: this.configService.get<string>('database.host', { infer: true }),
      port: this.configService.get<number>('database.port', { infer: true }),
    };
  }
}
```

### 7.2 @ConfigurationProperties 对比

```java
// Spring Boot 配置绑定
// application.yml: jwt.secret / jwt.expiration

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private long expiration;

    // getter/setter
}

// 使用
@Autowired
private JwtProperties jwtProperties;
```

```typescript
// NestJS 配置类
// config/jwt.config.ts
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiration: process.env.JWT_EXPIRATION || '7d',
}));

// app.module.ts
ConfigModule.forRoot({
  load: [appConfig, jwtConfig],
}),

// 使用
@Injectable()
export class AuthService {
  constructor(
    @Inject('jwt')
    private readonly jwtConfig: { secret: string; expiration: string },
  ) {}
}
```

---

## 8️⃣ 服务治理层面对标

### 8.1 Resilience4j 熔断器 vs NestJS @nestjs/throttler

```java
// Resilience4j 熔断器（Java）
// examples/stage3-java-vs-nestjs/08-circuit-breaker/resilience4j.java

// CircuitBreaker 配置
@Service
public class PaymentService {

    private final CircuitBreakerRegistry registry;
    private final CircuitBreaker paymentCircuitBreaker;

    public PaymentService() {
        this.registry = CircuitBreakerRegistry.of(
            CircuitBreakerConfig.custom()
                .failureRateThreshold(50)              // 失败率 > 50% 时打开断路器
                .waitDurationInOpenState(Duration.ofSeconds(30))  // 30秒后半开
                .permittedNumberOfCallsInHalfOpenState(3)        // 半开时允许3个请求
                .slidingWindowSize(10)                // 滑动窗口10次调用
                .minimumNumberOfCalls(5)              // 至少5次调用才计算失败率
                .build()
        );
        this.paymentCircuitBreaker = registry.circuitBreaker("payment");
    }

    public String callPaymentGateway() {
        return paymentCircuitBreaker.executeSupplier(() -> {
            // 调用外部支付网关
            return restTemplate.getForObject("http://payment-api/pay", String.class);
        });
    }

    // 熔断器事件监听
    public void registerEventListener() {
        paymentCircuitBreaker.getEventPublisher()
            .onStateTransition(event ->
                System.out.println("断路器状态变化: " + event.getStateTransition()))
            .onError(event ->
                System.out.println("调用失败: " + event.getThrowable().getMessage()))
            .onSuccess(event ->
                System.out.println("调用成功，耗时: " + event.getElapsedDuration().toMillis() + "ms"));
    }
}

// Retry 重试配置
@Service
public class ExternalApiService {

    private final CircuitBreakerRegistry registry;

    public ExternalApiService() {
        RetryConfig retryConfig = RetryConfig.custom()
            .maxAttempts(3)                      // 最多重试3次
            .waitDuration(Duration.ofMillis(500)) // 重试间隔500ms
            .retryExceptions(IOException.class, TimeoutException.class)
            .ignoreExceptions(BusinessException.class)
            .build();

        this.registry = CircuitBreakerRegistry.of(defaultConfig);
    }
}

// RateLimiter 限流
@Service
public class ApiService {

    private final RateLimiter rateLimiter;

    public ApiService() {
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitForPeriod(100)                  // 每秒允许100个请求
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .timeoutDuration(Duration.ofMillis(100)) // 超过限流等待100ms超时
            .build();

        this.rateLimiter = RateLimiter.of("api", config);
    }

    public String call() {
        return rateLimiter.executeSupplier(() -> {
            // 业务逻辑
            return "success";
        });
    }
}
```

```typescript
// NestJS 限流守卫（@nestjs/throttler）
// examples/stage3-java-vs-nestjs/08-circuit-breaker/throttler-guard.ts

import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',           // 限制器名称
        ttl: 60000,              // 时间窗口（毫秒）
        limit: 10,              // 时间窗口内最多10次请求
      },
      {
        name: 'long',
        ttl: 600000,            // 10分钟窗口
        limit: 100,             // 10分钟内最多100次
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

// 使用：在控制器/路由上添加装饰器
@Controller('api')
export class ApiController {
  // 默认使用全局配置的 short 限制器
  @Get('standard')
  standardEndpoint() {
    return '标准限流';
  }

  // 指定使用 long 限制器
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Get('strict')
  strictEndpoint() {
    return '严格限流：每分钟最多5次';
  }

  // 跳过限流（如内部服务调用）
  @SkipThrottle()
  @Get('internal')
  internalEndpoint() {
    return '不限流';
  }
}
```

---

## 9️⃣ 完整对照速查表

| 功能场景 | Java / Spring Boot | NestJS / Node.js |
|---------|-------------------|------------------|
| **框架入口** | `@SpringBootApplication` + `SpringApplication.run()` | `NestFactory.create(AppModule)` |
| **模块定义** | `@Configuration` + `@Bean` | `@Module({ providers: [], exports: [] })` |
| **HTTP 控制器** | `@Controller` / `@RestController` + `@GetMapping` | `@Controller()` + `@Get()` |
| **路由参数** | `@PathVariable` / `@RequestParam` / `@RequestBody` | `@Param()` / `@Query()` / `@Body()` |
| **依赖注入** | `@Autowired` | 构造器注入（constructor） |
| **服务层** | `@Service` | `@Injectable() class` |
| **数据访问** | `JpaRepository` / `MyBatis` | `Repository<T>` (TypeORM) / `Prisma Client` |
| **事务管理** | `@Transactional(rollbackFor = Exception.class)` | `DataSource.transaction()` / `QueryRunner` |
| **安全认证** | `Spring Security + JWT` | `@nestjs/passport` + `@nestjs/jwt` |
| **权限校验** | `@PreAuthorize("hasRole('ADMIN')")` | `@Roles('admin')` + `RolesGuard` |
| **定时任务** | `@Scheduled` + Quartz | `@Cron()` / `@Interval()` / `@nestjs/schedule` |
| **日志框架** | SLF4J + Logback（XML 配置） | Winston / Pino（代码配置） |
| **配置管理** | `application.yml` + `@ConfigurationProperties` | `@nestjs/config` + `.env` |
| **参数校验** | `JSR-303 Bean Validation` | `class-validator` + `ValidationPipe` |
| **异常处理** | `@ExceptionHandler` + `@ControllerAdvice` | `@Catch()` + `ExceptionFilter` |
| **熔断/限流** | Resilience4j / Sentinel | `@nestjs/throttler` / `RateLimitInterceptor` |
| **缓存** | `@Cacheable` + Redis | `@nestjs/cache-manager` + Redis |
| **WebSocket** | `Spring WebSocket` | `@nestjs/websockets` + Socket.IO |
| **API 文档** | SpringDoc OpenAPI (springdoc-openapi) | `@nestjs/swagger` |
| ** ORM 迁移** | Flyway / Liquibase | TypeORM Migration / Prisma Migrate |
| **对象映射** | MapStruct / BeanUtils | `class-transformer` |
| **HTTP 客户端** | RestTemplate / WebClient | Axios / Fetch / `HttpService` (@nestjs/axios) |
| **微服务** | Spring Cloud | `@nestjs/microservices` |
| **消息队列** | RabbitTemplate / KafkaTemplate | `@nestjs/microservices` + amqplib / kafkajs |
| **服务注册** | Eureka / Consul | `@nestjs/microservices` + Consul |
| **单元测试** | JUnit 5 + Mockito | Jest + ts-jest |

---

## 🔟 技术差异总结

### 10.1 装饰器 vs 注解

| Java 注解 | TypeScript 装饰器 | 说明 |
|----------|-----------------|------|
| `@Component` | `@Injectable()` | 依赖注入 |
| `@Controller` | `@Controller()` | HTTP 控制器 |
| `@Service` | `@Injectable()` | 业务服务（NestJS 不区分，统一用 @Injectable）|
| `@Repository` | `@Injectable()` | 数据访问（NestJS 统一用 @Injectable）|
| `@Configuration` | `@Module()` | 配置模块 |
| `@GetMapping` | `@Get()` | GET 路由 |
| `@PostMapping` | `@Post()` | POST 路由 |
| `@RequestBody` | `@Body()` | 请求体 |
| `@PathVariable` | `@Param()` | 路径参数 |
| `@RequestParam` | `@Query()` | 查询参数 |
| `@Autowired` | constructor injection | 构造器注入 |
| `@Transactional` | `DataSource.transaction()` | 事务管理 |
| `@EnableCaching` | `CacheModule.forRoot()` | 缓存模块 |

### 10.2 关键差异

```
┌────────────────────────────────────────────────────────────────┐
│                    Spring Boot vs NestJS 关键差异               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. 语言层面                                                    │
│     Java: 编译时检查，强类型，JAR 打包，JVM 运行                  │
│     TS/JS: 运行时检查，弱类型可选，Node.js 直接运行               │
│                                                                │
│  2. 装饰器实现机制                                               │
│     Java: 注解 → 编译后保留，通过反射读取                          │
│     NestJS: 装饰器 → ES2016 Proxy / Reflect.metadata 读取        │
│                                                                │
│  3. 模块扫描                                                    │
│     Spring: @ComponentScan 自动扫描 + 注解                      │
│     NestJS: 必须显式导入（imports），显式注册（providers）        │
│     → NestJS 更显式，可控性更高                                   │
│                                                                │
│  4. 事务处理                                                    │
│     Spring: @Transactional 声明式，自动代理                     │
│     NestJS: 手动管理 QueryRunner/DataSource.transaction()        │
│     → TypeORM 需要显式管理事务边界                                │
│                                                                │
│  5. 类型系统                                                    │
│     Java: 编译时泛型，类型擦除                                    │
│     TypeScript: 编译时 + 运行时类型（通过装饰器 metadata）         │
│     → NestJS 通过 class-validator/class-transformer 实现运行时验证│
│                                                                │
│  6. 生态系统                                                    │
│     Spring: 完整全家桶，一站式                                  │
│     NestJS: 依赖 @nestjs/* 插件生态，底层还是 Node.js 生态        │
│     → 灵活性更高，但需要自己整合                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📝 练习题

### 练习 1：技术选型判断
用户请求量突然增长，需要从单体切换到微服务架构，在 Spring Boot 中你会用 Spring Cloud + Nacos，在 NestJS 中你会选择什么方案？

### 练习 2：代码转换
将以下 Spring Boot 代码转换为 NestJS：
```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired private OrderService orderService;
    
    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.findById(id);
    }
    
    @PostMapping
    @Transactional
    public Order createOrder(@RequestBody @Valid CreateOrderRequest request) {
        return orderService.create(request);
    }
}
```

---

## 🔗 相关资源

- [NestJS vs Spring Boot 对比](https://docs.nestjs.com/first-steps)
- [Spring Boot to NestJS Migration Guide](https://github.com/nestjs/nest/issues/2562)
- [TypeORM 官方文档](https://typeorm.io/)
- [@nestjs/passport 官方文档](https://docs.nestjs.com/recipes/passport)
- [@nestjs/schedule 官方文档](https://docs.nestjs.com/techniques/task-scheduling)

---

**下一阶段预告**：[第四阶段：数据层（MySQL + Redis）](./第四阶段_数据层.md)

> 掌握 TypeORM/Prisma 作为主力 ORM，熟练使用 Redis 缓存与数据结构，理解缓存策略（穿透/击穿/雪崩）。
