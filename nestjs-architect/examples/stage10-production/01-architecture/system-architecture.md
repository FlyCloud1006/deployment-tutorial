# 生产级系统架构

## 整体架构

```
CDN/负载均衡
    ↓
API 网关层（鉴权、限流、路由）
    ↓
业务服务层（用户、订单、商品、支付）
    ↓
数据服务层（MySQL、Redis、OSS）
    ↓
可观测性层（Prometheus、Grafana、Jaeger）
```

## 微服务拆分

### 用户域
- user-service：用户 CRUD
- auth-service：登录注册
- rbac-service：权限管理

### 订单域
- order-service：订单管理
- payment-service：支付
- logistics-service：物流

### 商品域
- product-service：商品管理
- inventory-service：库存
- pricing-service：价格促销

## 高可用设计

1. 多实例部署（至少 2 个）
2. 负载均衡（Nginx / 云 LB）
3. 数据库主从复制
4. Redis 哨兵/集群
5. 异步消息队列削峰
6. 限流熔断保护
