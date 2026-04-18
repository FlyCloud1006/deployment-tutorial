# ☕ Java 最佳实践知识图谱

> 本知识图谱涵盖 Java 开发中最核心的最佳实践，按领域分类，助你建立完整的工程素养。

---

## 📌 核心原则

```
┌─────────────────────────────────────────────────────────────────┐
│                    Java 开发核心原则                              │
├─────────────────────────────────────────────────────────────────┤
│  1. 写整洁代码（Clean Code）      → 可读性 > 可性能               │
│  2. SOLID 原则                    → 单一职责、开闭、里氏替换等      │
│  3. KISS / YAGNI                → 简单直接，不要过度设计          │
│  4. DRY（Don't Repeat Yourself） → 重复是万恶之源               │
│  5. 面向失败设计                 → 防御性编程，考虑边界情况        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ 代码整洁之道

### 1.1 命名规范

```
┌──────────────────────────────────────────────────────────────┐
│                    命名规范速查表                             │
├──────────────────────────────────────────────────────────────┤
│  ✅ 变量/方法：camelCase     → userService / getUserById   │
│  ✅ 类名：PascalCase         → UserService / OrderController│
│  ✅ 常量：UPPER_SNAKE_CASE   → MAX_RETRY_COUNT / API_URL   │
│  ✅ 包名：全小写              → com.example.myapp            │
│                                                              │
│  ✅ 见名知意：int age → int userAge ✅                        │
│  ❌ 拼音/无意义：int a / int temp1 / int data ❌            │
│                                                              │
│  ✅ 布尔命名：isActive / hasPermission / canEdit ✅           │
│  ❌ 反义：isFalse / flag = 0/1 ❌                          │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 方法设计原则

| 原则 | ✅ 正确示例 | ❌ 错误示例 |
|------|-----------|------------|
| 方法只做一件事 | `calculateOrderTotal()` | `calculateAndSaveAndSendEmail()` |
| 参数 ≤ 3 个 | `createUser(name, age, email)` | `createUser(a,b,c,d,e,f,g)` |
| 方法长度 ≤ 30 行 | 独立小方法 | 一个方法 500 行 |
| 返回类型明确 | `User findById(Long id)` | `Object findById(id)` |

### 1.3 注释规范

```java
// ✅ 解释 WHY，不解释 WHAT（代码本身要能说话）
// 为什么用递归而非循环：因为树深度未知，递归更简洁
public TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    // ...
}

// ❌ 废话注释：增加而不是++
i++;

// ✅ TODO/FIXME：标注未完成或需修复
// TODO(zhangsan): 等支付接口上线后移除模拟
// FIXME: 并发情况下可能丢数据，需要加锁
```

---

## 2️⃣ 集合与泛型最佳实践

### 2.1 集合选择指南

```
┌──────────────────────────────────────────────────────────────┐
│                    集合选择决策树                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  需要键值对存储？                                           │
│       ↓ 是                                                  │
│  HashMap vs TreeMap vs LinkedHashMap                        │
│       ↓                                                      │
│  ① 需要插入顺序？  → LinkedHashMap（记住插入顺序）            │
│  ② 需要排序？      → TreeMap（按 key 排序）                  │
│  ③ 只需要快速查找 → HashMap（O(1) 最快）                   │
│                                                              │
│  只存值不需要键？                                           │
│       ↓ 是                                                  │
│  List vs Set                                                 │
│       ↓                                                      │
│  ① 需要重复元素？   → ArrayList（可重复）                   │
│  ② 不需要重复？   → HashSet（自动去重）                    │
│  ③ 需要排序？      → TreeSet                                │
│                                                              │
│  需要头尾操作？                                             │
│       ↓ 是                                                  │
│  ArrayList（尾部） vs LinkedList（头尾 O(1)）               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 泛型使用

```java
// ✅ 正确：泛型通配符 PECS
// Producer Extends, Consumer Super
public void copyAll(List<? extends Number> from, List<? super Number> to) {
    from.forEach(n -> to.add(n)); // from 只能读（Producer）
}

// ❌ 错误：无法添加元素到 List<?>
List<? extends Number> list = new ArrayList<Integer>();
// list.add(1); // 编译错误！

// ✅ 正确：泛型方法
public static <T> T safeCast(Object obj, Class<T> clazz) {
    if (clazz.isInstance(obj)) {
        return clazz.cast(obj);
    }
    return null;
}

// ✅ 正确：集合初始化指定泛型
List<String> names = new ArrayList<>(); // diamond operator
Map<String, List<User>> multiMap = new HashMap<>();
```

---

## 3️⃣ 异常处理最佳实践

### 3.1 异常分类

```
┌──────────────────────────────────────────────────────────────┐
│                    异常分类体系                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Throwable                                                   │
│    ├── Error（系统级，程序不应捕获）                         │
│    │     ├── OutOfMemoryError                              │
│    │     └── StackOverflowError                           │
│    │                                                       │
│    └── Exception                                            │
│          ├── Checked Exception（受检异常，必须处理）          │
│          │     ├── IOException                              │
│          │     └── SQLException                             │
│          │                                                   │
│          └── RuntimeException（运行时异常，可选处理）        │
│                ├── NullPointerException                      │
│                ├── IllegalArgumentException                  │
│                ├── IndexOutOfBoundsException                │
│                └── 自定义业务异常（推荐继承 RuntimeException） │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 异常处理规范

```java
// ✅ 正确：自定义业务异常
public class BusinessException extends RuntimeException {
    private final String code;
    
    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}

// ✅ 正确：try-catch-finally 规范
FileInputStream fis = null;
try {
    fis = new FileInputStream("data.txt");
    // 业务逻辑
} catch (FileNotFoundException e) {
    logger.error("文件不存在", e);
    throw new BusinessException("FILE_NOT_FOUND", "配置文件缺失", e);
} finally {
    // ✅ 始终关闭资源，推荐使用 try-with-resources
    if (fis != null) {
        try { fis.close(); } catch (IOException e) { /* 记录即可 */ }
    }
}

// ✅ 现代写法：try-with-resources（自动关闭）
try (FileInputStream fis = new FileInputStream("data.txt");
     BufferedReader reader = new BufferedReader(new InputStreamReader(fis))) {
    // 不用手动关闭，编译器自动生成 finally + close()
} catch (IOException e) {
    logger.error("读取文件失败", e);
}
```

---

## 4️⃣ 并发与多线程最佳实践

### 4.1 并发选择指南

```
┌──────────────────────────────────────────────────────────────┐
│                    并发工具选择                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  场景 1：需要并发安全计数                                   │
│     → AtomicInteger / AtomicLong（单变量 CAS）               │
│     → LongAdder（高并发首选，比 AtomicLong 更快）            │
│                                                              │
│  场景 2：需要并发安全集合                                   │
│     → ConcurrentHashMap（推荐，比 Hashtable 快）            │
│     → CopyOnWriteArrayList（读多写少场景）                 │
│     → BlockingQueue（生产者-消费者）                        │
│                                                              │
│  场景 3：一个任务需要等待多个线程完成                        │
│     → CountDownLatch（倒计时锁）                           │
│     → CompletableFuture（更现代，推荐）                      │
│                                                              │
│  场景 4：需要互斥                                          │
│     → synchronized（语法级，简单场景）                      │
│     → ReentrantLock（可超时、可中断、fairness 配置）       │
│     → Semaphore（限流 N 个并发）                          │
│                                                              │
│  场景 5：线程间传递数据                                    │
│     → volatile + CAS                                       │
│     → BlockingQueue                                        │
│     → ThreadLocal（线程本地变量）                           │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 volatile 与 CAS

```java
// ✅ volatile：保证可见性（一个线程修改，其他线程立即看到）
public class Config {
    private volatile boolean initialized = false;
    
    public void init() {
        this.initialized = true; // 其他线程立即看到这个变化
    }
}

// ✅ AtomicInteger：解决并发计数
private final AtomicInteger counter = new AtomicInteger(0);

// 原子递增，性能比 synchronized 高
public void increment() {
    counter.incrementAndGet(); // 无锁！
}

// ✅ LongAdder：高并发计数首选（比 AtomicLong 更高性能）
private final LongAdder total = new LongAdder();

public void add(long value) {
    total.add(value); // 内部分段，减少 CAS 冲突
}

public long sum() {
    return total.sum();
}
```

### 4.3 线程池使用

```java
// ✅ 正确：自定义线程池
public class ExecutorConfig {
    
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);           // 核心线程数
        executor.setMaxPoolSize(8);            // 最大线程数
        executor.setQueueCapacity(100);        // 队列容量
        executor.setKeepAliveSeconds(60);       // 空闲线程存活时间
        executor.setThreadNamePrefix("async-"); // 线程名前缀
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
        );
        executor.initialize();
        return executor;
    }
}

// ⚠️ 禁止：不要用 Executors 创建线程池（OOM 风险）
// ❌ 错误原因：LinkedBlockingQueue 默认 Integer.MAX_VALUE，请求过多会 OOM
ExecutorService pool = Executors.newFixedThreadPool(10);
// ↓ OOM 场景：10 个线程 + 队列堆积无限 → 内存爆炸

// ✅ 正确：用 ThreadPoolExecutor 显式指定队列大小
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4, 8, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100), // 有界队列，OOM 可控
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

---

## 5️⃣ Stream API 与函数式编程

### 5.1 Stream 使用规范

```java
// ✅ 正确：链式调用，职责分离
List<String> names = users.stream()
    .filter(u -> u.getAge() >= 18)        // 过滤成年人
    .map(User::getName)                    // 提取名字
    .distinct()                           // 去重
    .limit(100)                           // 限制数量
    .collect(Collectors.toList());         // 收集结果

// ❌ 错误：过早终止 + 副作用
List<String> result = new ArrayList<>();
users.stream().forEach(u -> {            // forEach 不应改变外部状态
    if (u.getAge() > 18) {
        result.add(u.getName());          // ❌ 违反函数式原则
    }
});

// ✅ 正确：peek 用于调试（不改状态）
List<String> names = users.stream()
    .peek(u -> System.out.println("Processing: " + u)) // 调试用
    .map(User::getName)
    .collect(Collectors.toList());

// ✅ 正确：parallelStream 用于大数据量
users.parallelStream()
    .filter(u -> expensiveOperation(u))  // CPU 密集型可并行
    .collect(Collectors.toList());

// ⚠️ 注意：parallelStream 不是万能药
// 数据量小、IO密集、线程不安全集合时，不要用并行流
```

### 5.2 方法引用 vs Lambda

```java
// 方法引用优先级：类名::静态方法 > 类名::实例方法 > 对象::实例方法
// ✅ 推荐：方法引用（性能更好，可内联）
List<String> upper = names.stream()
    .map(String::toUpperCase)    // 类名::静态方法
    .collect(Collectors.toList());

List<String> sorted = users.stream()
    .map(User::getName)           // 类名::实例方法
    .sorted(String::compareTo)     // 更短，可读性更好
    .collect(Collectors.toList());

// ⚠️ Lambda（方法引用不适用时）
List<User> adults = users.stream()
    .filter(u -> u.getAge() >= 18 && u.isActive()) // 复合条件用 Lambda
    .collect(Collectors.toList());
```

---

## 6️⃣ 设计模式实战

### 6.1 核心设计模式速查

```
┌──────────────────────────────────────────────────────────────┐
│                    设计模式速查表                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  创建型（5个）                                               │
│    ├─ Singleton      → 全局唯一实例，配置类/日志/连接池      │
│    ├─ Factory Method→ 工厂方法，subclass 决定创建类型         │
│    ├─ Abstract Factory→ 抽象工厂，生产一族相关对象           │
│    ├─ Builder       → 复杂对象构建，链式调用                │
│    └─ Prototype     → 原型克隆，复制复杂对象                 │
│                                                              │
│  结构型（7个）                                               │
│    ├─ Adapter      → 接口转换，兼容旧接口                   │
│    ├─ Bridge        → 抽象与实现分离，双维度扩展            │
│    ├─ Composite     → 树形结构，统一叶子/组合节点          │
│    ├─ Decorator    → 动态添加功能，IO 流设计经典         │
│    ├─ Facade       → 统一入口，封装复杂子系统             │
│    ├─ Flyweight    → 共享细粒度对象，减少内存             │
│    └─ Proxy        → 代理模式，延迟加载/权限控制           │
│                                                              │
│  行为型（11个）                                              │
│    ├─ Strategy     → 算法策略可切换（如支付方式）         │
│    ├─ Observer     → 事件监听，发布-订阅                  │
│    ├─ Command       → 命令封装，支持撤销/重做              │
│    ├─ State        → 状态机，状态决定行为                  │
│    ├─ Template Method→ 模板方法，骨架 + 钩子               │
│    ├─ Iterator     → 统一遍历接口，集合迭代器            │
│    ├─ Chain of Responsibility→ 责任链，过滤器/拦截器    │
│    └─ Visitor      → 操作的类 vs 元素类 双重分派          │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 常用模式实战

```java
// ✅ 单例模式：双重检查锁（线程安全 + 延迟加载）
public class Singleton {
    private static volatile Singleton INSTANCE;
    
    private Singleton() {} // 防止反射攻击
    
    public static Singleton getInstance() {
        if (INSTANCE == null) {                    // 第一次检查：避免不必要的同步
            synchronized (Singleton.class) {       // 加锁
                if (INSTANCE == null) {            // 第二次检查：确保只创建一次
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}

// ✅ 策略模式：支付方式可切换
public interface PaymentStrategy {
    void pay(double amount);
}

@Service
public class PaymentService {
    private final Map<String, PaymentStrategy> strategies;
    
    @Autowired
    public PaymentService(Map<String, PaymentStrategy> strategyMap) {
        this.strategies = strategyMap;
    }
    
    public void pay(String type, double amount) {
        PaymentStrategy strategy = strategies.get(type);
        if (strategy == null) throw new BusinessException("PAYMENT_NOT_SUPPORTED");
        strategy.pay(amount);
    }
}

// @Component
// public class AlipayStrategy implements PaymentStrategy { ... }
// @Component
// public class WechatPayStrategy implements PaymentStrategy { ... }
```

---

## 7️⃣ 数据库与 JPA 最佳实践

### 7.1 JPA 注解选择

```java
// ✅ 实体定义规范
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_status_created", columnList = "status, created_at")
})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增主键
    private Long id;
    
    @Column(nullable = false, length = 50) // 非空 + 长度限制
    private String name;
    
    @Column(unique = true) // 唯一约束
    private String email;
    
    @Enumerated(EnumType.STRING) // 存字符串而非 ordinal
    private UserStatus status;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Version // 乐观锁版本号
    private Long version;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

// ❌ 错误：不用 @Basic
// ✅ 正确：明确指定列属性
```

### 7.2 查询最佳实践

```java
// ✅ JPQL 命名参数（防注入）
@Query("SELECT u FROM User u WHERE u.email = :email AND u.status = :status")
Optional<User> findByEmailAndStatus(
    @Param("email") String email, 
    @Param("status") UserStatus status);

// ✅ 原生 SQL（仅复杂查询使用）
@Query(value = """
    SELECT u.*, COUNT(o.id) as order_count 
    FROM users u 
    LEFT JOIN orders o ON u.id = o.user_id 
    WHERE u.status = :status 
    GROUP BY u.id 
    HAVING COUNT(o.id) >= :minOrders
    """, nativeQuery = true)
List<User> findActiveUsersWithMinOrders(
    @Param("status") String status, 
    @Param("minOrders") int minOrders);

// ✅ 分页查询
Page<User> findByStatus(UserStatus status, Pageable pageable);

// ✅ 批量操作
@Modifying
@Query("UPDATE User u SET u.status = :status WHERE u.id IN :ids")
int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("status") UserStatus status);
```

---

## 8️⃣ 日志规范

### 8.1 日志级别使用

```
┌──────────────────────────────────────────────────────────────┐
│                    日志级别使用规范                          │
├──────────────────────────────────────────────────────────────┤
│  ERROR：错误日志，影响功能，需要立即处理                     │
│     → "用户注册失败，邮箱验证码发送异常"                    │
│     → 记录异常堆栈：logger.error("注册失败", e)            │
│                                                              │
│  WARN：警告日志，潜在问题但不影响功能                       │
│     → "请求频率超过阈值，当前 QPS: 1500"                    │
│     → "数据库连接池剩余 2 个可用"                          │
│                                                              │
│  INFO：业务里程碑日志                                        │
│     → "用户登录成功，userId=123456"                         │
│     → "订单创建成功，orderId=789"                          │
│                                                              │
│  DEBUG：开发调试日志                                          │
│     → "进入方法 xxx，参数={}"                                │
│     → "SQL: SELECT * FROM users WHERE id=?"                │
│                                                              │
│  TRACE：最详细日志                                            │
│     → 变量每一步变化                                          │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 日志规范

```java
// ✅ 正确：日志占位符（延迟拼接，级别不符时不拼接）
logger.info("用户 {} 登录成功，IP: {}", userId, ip);
// 比 logger.info("用户 " + userId + " 登录成功") 性能好

// ❌ 错误：字符串拼接 + 不记录异常堆栈
logger.error("处理失败" + e); // ❌ 隐式 toString() + 无堆栈
logger.error("处理失败", e);   // ✅ 正确

// ✅ 正确：敏感信息脱敏
logger.info("用户登录，phone={}", phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2"));
// 输出：用户登录，phone=138****5678

// ✅ 正确：结构化日志（JSON 格式便于 ELK 分析）
logger.info("order placed - orderId={} userId={} amount={}", 
    orderId, userId, amount);
```

---

## 9️⃣ API 设计规范

### 9.1 RESTful 风格

```
┌──────────────────────────────────────────────────────────────┐
│                    RESTful API 规范                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ HTTP 方法语义                                           │
│    GET    → 查询资源（幂等，不改变状态）                      │
│    POST   → 创建资源（每次创建新资源）                        │
│    PUT    → 完整替换资源（幂等）                              │
│    PATCH  → 部分更新资源                                     │
│    DELETE → 删除资源（幂等）                                  │
│                                                              │
│  ✅ URL 命名                                                │
│    GET    /users            → 获取用户列表                    │
│    GET    /users/{id}       → 获取单个用户                   │
│    POST   /users            → 创建用户                       │
│    PUT    /users/{id}       → 更新用户（完整）               │
│    PATCH  /users/{id}      → 更新用户（部分）               │
│    DELETE /users/{id}      → 删除用户                       │
│                                                              │
│  ⚠️ 避免动词                                               │
│    ❌ GET /getUsers                                   │
│    ❌ POST /createUser                               │
│    ✅ GET /users                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 统一响应格式

```java
// ✅ 统一响应包装
public class ApiResponse<T> {
    private int code;       // 业务状态码，0=成功
    private String message; // 提示信息
    private T data;         // 数据
    
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(0, "success", data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(-1, message, null);
    }
    
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}

// ✅ 全局异常处理
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusiness(BusinessException e) {
        return ApiResponse.error(e.getCode(), e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ApiResponse.error(400, msg);
    }
}
```

---

## 🔟 性能优化 Checklist

```
┌──────────────────────────────────────────────────────────────┐
│                    性能优化清单                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 CPU 优化                                                 │
│     □ 减少锁竞争范围 / 降低锁粒度                             │
│     □ 用 CAS 替代 synchronized（低冲突场景）               │
│     □ 避免在循环内创建对象                                   │
│                                                              │
│  🔍 内存优化                                                 │
│     □ 减少对象创建（复用池化：String.intern()）              │
│     □ 及时释放资源（try-with-resources）                     │
│     □ 批量操作替代循环单条（JDBC batch / Redis pipeline）   │
│                                                              │
│  🔍 IO 优化                                                 │
│     □ 异步 IO（NIO / Netty）替代同步阻塞                    │
│     □ 减少网络往返（批量接口 / 缓存）                        │
│     □ 连接池复用（HTTP Client / DB Connection）              │
│                                                              │
│  🔍 数据库优化                                               │
│     □ 索引覆盖：SELECT 字段在索引中（无需回表）              │
│     □ 批量插入：INSERT INTO ... VALUES (...), (...), (...)   │
│     □ 分页优化：延迟关联 vs 游标分页                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 📚 推荐学习路径

```
1️⃣ 基础：Clean Code → 设计模式 → 重构
       ↓
2️⃣ 进阶：Effective Java → 并发编程 → JVM 调优
       ↓
3️⃣ 架构：DDD → 微服务 → 分布式系统
       ↓
4️⃣  DevOps：CI/CD → 监控 → 全链路追踪
```

---

**📖 推荐书籍**
- 《Clean Code》— Robert C. Martin
- 《Effective Java》— Joshua Bloch
- 《Java并发编程实战》— Brian Goetz
- 《深入理解JVM虚拟机》— 周志华
- 《领域驱动设计》— Eric Evans
