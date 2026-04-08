# 角色调度执行指南

## 如何使用

本指南供**项目总监**角色使用，通过 OpenClaw `sessions_spawn` 工具调度各专家。

## 调度命令参考

### 1. 调度产品经理

```typescript
sessions_spawn({
  task: "请以产品经理身份，完成以下任务：[具体需求描述]",
  label: "product-task-001",
  runtime: "subagent",
  cwd: "/root/workspace",
  mode: "run"
})
```

### 2. 调度架构师

```typescript
sessions_spawn({
  task: "请以架构师身份，设计以下功能的技术方案：[具体功能描述]",
  label: "architect-task-001",
  runtime: "subagent",
  cwd: "/root/workspace",
  mode: "run"
})
```

### 3. 调度 React 前端

```typescript
sessions_spawn({
  task: "请以 React 前端开发身份，实现以下页面：[具体需求]",
  label: "frontend-react-task-001",
  runtime: "subagent",
  cwd: "/root/workspace",
  mode: "run"
})
```

### 4. 调度 Taro 小程序

```typescript
sessions_spawn({
  task: "请以 Taro 小程序开发身份，实现以下功能：[具体需求]",
  label: "frontend-taro-task-001",
  runtime: "subagent",
  cwd: "/root/workspace",
  mode: "run"
})
```

### 5. 调度 NestJS 后端

```typescript
sessions_spawn({
  task: "请以 NestJS 后端开发身份，实现以下 API：[具体需求]",
  label: "backend-nestjs-task-001",
  runtime: "subagent",
  cwd: "/root/workspace",
  mode: "run"
})
```

### 6. 调度 QA

```typescript
sessions_spawn({
  task: "请以测试工程师身份，对以下功能编写测试用例：[具体功能]",
  label: "qa-task-001",
  runtime: "subagent",
  cwd: "/root/workspace",
  mode: "run"
})
```

## 完整任务分发示例

假设用户要求开发"用户管理模块"：

### 第一步：总监分析并分发

```
项目总监拆解任务：
1. 产品经理 → 输出 PRD + 页面原型
2. 架构师 → 输出技术方案 + 数据库设计
3. 后端 → 实现 API
4. 前端 → 实现页面
5. QA → 编写测试用例
```

### 第二步：并行调度（可并行时）

```typescript
// 并行调度产品和架构（两者独立）
await Promise.all([
  sessions_spawn({ task: "产品PRD任务", label: "p1", ... }),
  sessions_spawn({ task: "架构设计任务", label: "a1", ... })
]);

// 前后端可并行（基于架构设计）
await Promise.all([
  sessions_spawn({ task: "前端任务", label: "f1", ... }),
  sessions_spawn({ task: "后端任务", label: "b1", ... })
]);

// QA 在功能完成后执行
await sessions_spawn({ task: "测试任务", label: "q1", ... });
```

### 第三步：汇总结果

收集各子代理的输出，整理成完整方案向用户汇报。

## 角色 SOUL.md 位置

| 角色 | 路径 |
|------|------|
| 项目总监 | /root/workspace/roles/director/SOUL.md |
| 产品经理 | /root/workspace/roles/product/SOUL.md |
| 架构师 | /root/workspace/roles/architect/SOUL.md |
| React前端 | /root/workspace/roles/frontend-react/SOUL.md |
| Taro小程序 | /root/workspace/roles/frontend-taro/SOUL.md |
| NestJS后端 | /root/workspace/roles/backend-nestjs/SOUL.md |
| 测试工程师 | /root/workspace/roles/qa/SOUL.md |

## 注意事项

1. **每个子代理任务要明确**：给出具体需求，不要模糊
2. **设置合理的 timeout**：复杂任务 1800s，简单任务 300s
3. **复用产出物**：让后续角色使用前面角色的产出（如让前端使用架构师的API设计）
4. **保持上下文**：关键信息在汇总时不要遗漏
