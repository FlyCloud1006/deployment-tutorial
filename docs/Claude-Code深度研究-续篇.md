# Claude Code 深度研究续篇：子Agent系统与记忆工程

> 基于 Piebald-AI/claude-code-system-prompts (v2.1.86) 完整子Agent提示词解析
> 来源：https://github.com/Piebald-AI/claude-code-system-prompts

---

## 一、子Agent体系全解

Claude Code 的子Agent不是简单复制主提示词，而是**每个Agent有独立提示词，专门优化**。

### 1.1 子Agent类型一览

| Agent类型 | 模型 | 工具权限 | 何时使用 |
|----------|------|---------|---------|
| **Explore** | Haiku | Glob/Grep/Read/Bash(只读) | 快速代码探索 |
| **General Purpose** | Opus/Sonnet | 全部工具 | 多步骤复杂任务 |
| **Architect** | ? | 全部工具 | 系统设计 |
| **Review** | ? | 只读 | 代码审查 |
| **Debug** | ? | 全部工具 | 问题调试 |
| **Hook** | ? | ? | Hook条件评估 |
| **CLAUDE.md Creator** | ? | 全部工具 | 创建项目文档 |
| **Dream** | ? | 全部工具 | 记忆整合/修剪 |

### 1.2 Explore Agent（只读探索专家）

```markdown
=== CRITICAL: READ-ONLY MODE - NO FILE MODIFICATIONS ===

This is a READ-ONLY exploration task. You are STRICTLY PROHIBITED from:
- Creating new files (no Write, touch, or file creation of any kind)
- Modifying existing files (no Edit operations)
- Deleting files (no rm or deletion)
- Moving or copying files (no mv or cp)
- Creating temporary files anywhere, including /tmp
- Using redirect operators (>, >>, |) or heredocs to write to files
- Running ANY commands that change system state
```

**设计亮点**：
- 明确禁止所有写操作，彻底隔离风险
- 使用 Haiku 模型（最快最便宜）
- 强调并行工具调用以提高速度

**关键指令**：
```
- Make efficient use of the tools that you have at your disposal
- Wherever possible you should try to spawn multiple parallel tool calls
- Adapt your search approach based on the thoroughness level
- "quick" for basic searches
- "medium" for moderate exploration
- "very thorough" for comprehensive analysis
```

### 1.3 General Purpose Agent（通用任务执行）

```markdown
Complete the task fully—don't gold-plate, but don't leave it half-done.

Your strengths:
- Searching for code, configurations, and patterns across large codebases
- Analyzing multiple files to understand system architecture
- Investigating complex questions that require exploring many files
- Performing multi-step research tasks

Guidelines:
- For file searches: search broadly when you don't know where something lives
- For analysis: Start broad and narrow down
- Be thorough: Check multiple locations, consider different naming conventions
- NEVER create files unless they're absolutely necessary
- NEVER proactively create documentation files (*.md) or README files
```

**设计亮点**：
- 强调"不要gold-plate"——做完但不过度
- 通用搜索用Broad策略，具体路径用Read
- 严格禁止主动创建文档

### 1.4 SubAgent通用结构

每个子Agent提示词都包含这个元数据块：

```yaml
name: 'Agent Prompt: Explore'
description: System prompt for the Explore subagent
ccVersion: 2.1.84
agentMetadata:
  agentType: 'Explore'
  model: 'haiku'
  whenToUseDynamic: true
  disallowedTools:
    - Agent
    - ExitPlanMode
    - Edit
    - Write
    - NotebookEdit
```

**disallowedTools** 是关键——明确列出每个Agent不能用的工具。

---

## 二、记忆工程体系（全详解）

### 2.1 记忆系统的核心设计原则

**记忆文件是不可变的（Immutable）**：

```
Memory files are immutable: never edit them in place.
Combining means deleting the old files and (if needed)
writing one fresh single-fact file in their place.
```

这个设计非常关键——不能就地编辑，要删除旧的，写新的。

### 2.2 Dream Mode：四阶段记忆整合

Claude Code 的 Dream Mode 是一个**专门的记忆整合Agent**，分4个阶段：

```
┌──────────────────────────────────────────────────────────────┐
│                     Dream: Memory Consolidation              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1: Orient                                             │
│  - ls 记忆目录，了解已有什么                                  │
│  - 读 INDEX.md 索引，了解当前结构                             │
│  - 浏览现有主题文件，避免重复创建                              │
│                                                              │
│  Phase 2: Gather（按优先级）                                  │
│  1. Daily logs → 最新鲜的信号来源                            │
│  2. Drifted memories → 与代码库矛盾的事实                     │
│  3. Transcript grep → 窄范围搜索JSONL记录                    │
│     grep -rn "<narrow term>" transcripts/ | tail -50       │
│                                                              │
│  Phase 3: Consolidate                                       │
│  - 合并新信号到现有主题文件                                    │
│  - 相对日期→绝对日期（"昨天"→"2026-04-08"）                  │
│  - 删除矛盾的事实                                             │
│                                                              │
│  Phase 4: Prune                                             │
│  - 索引保持 <25KB 且 <N 行                                   │
│  - 每条索引 ≤150 字符                                        │
│  - 移除过时指针                                              │
│  - 解决文件间矛盾                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Dream: Memory Pruning（记忆修剪）

专门负责删除无用记忆：

```
Memory files are immutable: never edit them in place.
Combining means deleting the old files and (if needed)
writing one fresh single-fact file in their place.
```

**三分类处理**：

| 类型 | 操作 | 说明 |
|-----|------|------|
| Stale/invalidated | 删除 | 事实不再成立，被代码推翻 |
| Duplicate/near-duplicate | 合并删除 | 多个文件覆盖同一事实 |
| Still good | 保留 | 不动 |

**合并时使用最旧的 created: 日期**：
```
When you write the combined replacement,
copy the `created:` date from the oldest source memory's
frontmatter so manifest sort order stays accurate.
```

### 2.4 记忆文件选择Agent

这个Agent负责决定**每次对话附哪些记忆**：

```
Return a list of filenames for the memories that will
clearly be useful (up to 5).
Only include memories that you are certain will be helpful.
Be especially conservative with user-profile and project-overview memories.
```

**关键洞察**：
- **不要做关键词表面匹配**——不要因为用户档案里有"performance"就把所有相关记忆附上
- **匹配问题本身是什么**——问的是数据库性能才附数据库相关记忆
- **不确信就不附**——宁可少附，不要乱附

### 2.5 记忆文件格式

```markdown
---
name: user_role_developer
description: 用户是全栈开发者，主要用React+Node.js
type: user
created: 2026-03-24
---

用户是全栈开发者，有5年前端经验，后端偏好Node.js。
喜欢简洁代码，不喜欢过度注释。
```

### 2.6 索引文件格式

```markdown
# MEMORY.md — 记忆索引

- [用户角色偏好](memory/user-role.md) — 全栈开发者
- [反馈：不要无用注释](memory/feedback-no-comments.md) — 用户要求简洁
- [RBAC项目](memory/project-rbac.md) — NestJS+React，已部署
- [服务器信息](memory/ref-server.md) — 43.167.209.167
```

**严格限制**：
- 每条索引 ≤150 字符
- 总大小 ≤25KB
- 总行数 ≤N 行（由 INDEX_MAX_LINES 控制）
- **是索引，不是内容转储**

---

## 三、CLAUDE.md 创建规范

### 3.1 应该包含

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code)
when working with code in this repository.

## 常用命令
如何构建、lint、运行测试
如何运行单个测试

## 高层架构
需要读多个文件才能理解的"大局"架构
```

### 3.2 不应该包含

```
❌ 不要包含：
- 明显指令如"提供有用的错误信息"
- 写单元测试这种通用实践
- 永远不要在代码中包含敏感信息（API keys等）
- 每个组件或文件结构的详细列表（可以轻松发现）
- 通用开发实践
- 编造的信息如"常见开发任务"、"开发提示"
```

### 3.3 特殊处理

```
✓ 如果有 Cursor rules (.cursor/rules/ 或 .cursorrules)
  → 确保包含重要部分

✓ 如果有 Copilot rules (.github/copilot-instructions.md)
  → 确保包含重要部分

✓ 如果有 README.md
  → 确保包含重要部分
```

---

## 四、工具使用规范（全解析）

### 4.1 FileEdit（最核心）

```
Use exact string replacement for file modifications.
oldText must match the string in the file exactly.
Include sufficient context to ensure uniqueness.
Don't create duplicate content.
Only use when necessary — avoid overuse.
```

### 4.2 Grep（专业搜索）

```
ALWAYS use Grep for search tasks. NEVER invoke grep/rg as Bash.
- Supports regex: "log.*Error", "function\\s+\\w+"
- Glob parameter: "*.js", "**/*.tsx"
- Type parameter: "js", "py", "rust"
- Output modes: "content" | "files_with_matches" | "count"
- Use Agent tool for open-ended searches
- Pattern syntax: ripgrep (not grep)
- Literal braces need escaping: use `interface\\{\\}` to find `interface{}` in Go
- Multiline: use `multiline: true` for cross-line patterns
```

### 4.3 Glob（文件发现）

```
Fast file pattern matching.
Supports glob patterns: "**/*.js", "src/**/*.ts"
Returns matching file paths sorted by modification time.
Use Agent tool for open-ended searches requiring multiple rounds.
```

### 4.4 Bash（谨慎使用）

```
ONLY use Bash when shell features are truly needed:
- git operations (use dedicated tool or Bash for flexibility)
- npm/pnpm management
- Compilation and build commands
- Pipe combinations
- System commands
NOT for file operations (use dedicated tools).
```

### 4.5 WebSearch（强制溯源）

```
CRITICAL REQUIREMENT:
After answering the user's question, you MUST include a "Sources:" section
at the end of your response listing all relevant URLs as markdown links.

IMPORTANT - Use the correct year in search queries:
You MUST use the current year when searching for recent information.
Example: search for "React documentation" with the current year.
```

---

## 五、输出效率法则（全解析）

### 5.1 核心原则

```
Go straight to the point.
Try the simplest approach first without going in circles.
Do not overdo it.
Be extra concise.
```

### 5.2 具体指令

```
Lead with the answer or action, not the reasoning.
Skip filler words, preamble, and unnecessary transitions.
Do not restate what the user said — just do it.
When explaining, include only what is necessary.

Focus text output on:
- Decisions that need the user's input
- High-level status updates at natural milestones
- Errors or blockers that change the plan

If you can say it in one sentence, don't use three.
```

### 5.3 语气与风格

```
- Only use emojis if the user explicitly requests it
- Responses should be short and concise
- When referencing code: include file_path:line_number
- When referencing GitHub: use owner/repo#123 format (renders as clickable links)
- Do not use a colon before tool calls
- Avoid lists (fragmented output)
- Prefer smooth prose
```

---

## 六、OpenClaw 可落地的改进

### 6.1 子Agent提示词模板（可立即使用）

**Explore Agent（只读探索）**：
```markdown
# Explore Agent

You are a READ-ONLY exploration agent. You MUST NOT:
- Create, modify, or delete any files
- Run mutating commands (git add, npm install, etc.)
- Use redirect operators to write files

Your job is ONLY to find and analyze existing code.
- Use glob for file discovery
- Use grep for content search
- Use read for file contents
- Use bash only for read-only operations (ls, git status, git log)

Be fast and efficient. Make parallel tool calls when possible.
Thoroughness: [quick/medium/very thorough]
```

**General Purpose Agent（通用任务）**：
```markdown
# General Purpose Agent

Complete the task fully—don't gold-plate, but don't leave it half-done.

Your job:
- Search for code/configurations/patterns
- Analyze files to understand architecture
- Investigate complex questions
- Perform multi-step tasks

Rules:
- Search broadly when you don't know where something lives
- Start broad, narrow down
- NEVER create files unless absolutely necessary
- NEVER proactively create documentation (*.md)
- NEVER add docstrings or comments to code you didn't write

Report: what was done + key findings (keep concise)
```

### 6.2 Dream Mode 实现方案

```
┌─────────────────────────────────────────────────────────┐
│  定时触发（如每周日凌晨3点）                              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 1: Orient                                        │
│  - ls memory/                                          │
│  - read MEMORY.md（索引）                               │
│  - 浏览现有 memory/*.md                                 │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 2: Gather                                       │
│  - 检查 memory/logs/ 日志文件                           │
│  - 找与代码库矛盾的记忇                                  │
│  - grep 对话记录找相关信息（窄范围）                     │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 3: Consolidate                                 │
│  - 合并新信息到现有主题文件                              │
│  - 相对日期→绝对日期                                    │
│  - 删除矛盾事实                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 4: Prune                                       │
│  - MEMORY.md 保持 <25KB, <100行                        │
│  - 每条索引 ≤150字符                                    │
│  - 删除过时/矛盾文件                                    │
└─────────────────────────────────────────────────────────┘
```

### 6.3 工具使用检查清单

**每个工具的prompt应该包含**：
1. 何时使用
2. 何时不使用
3. 常见错误警告
4. 最佳实践

**示例 - read工具增强**：
```
Use read when:
✓ You know the exact file path
✓ You need to see file content for editing
✓ You need to verify code changes

Avoid read when:
✗ You don't know the path → use glob first
✗ You only need to check existence → use exec + ls
✗ You need line counts only → use wc -l

Warning: Large files are truncated. For files >1000 lines,
use offset/limit parameters or head/tail.
```

### 6.4 记忆文件 IMMUTABLE 原则落地

```
规则：记忆文件不可就地编辑

✗ 错误：
  直接打开 memory/user.md，修改内容，保存

✓ 正确：
  1. 读取 memory/user.md 内容
  2. 判断：需要更新
  3. 删除 memory/user.md
  4. 写入新的 memory/user.md（含新内容+保留 created: 日期）
```

### 6.5 索引严格化

```markdown
# MEMORY.md — 长期记忆索引

## 规则
- 每条 ≤150 字符
- 总大小 ≤25KB
- 总行数 ≤100 行
- 仅作为索引，不写内容详情

## 格式
- [标题](相对路径) — 一句话描述

## 示例
- [用户角色](memory/user-role.md) — 全栈开发者
- [服务器](memory/ref-server.md) — 43.167.209.167
```

---

## 七、关键洞见总结

### 7.1 子Agent设计三原则

1. **最小权限**：每个Agent只给完成工作所需的工具
2. **专门优化**：Explore用Haiku（最快），General Purpose用Opus
3. **禁止越界**：disallowedTools明确列出所有不能用的

### 7.2 记忆工程三原则

1. **IMMUTABLE**：不编辑，直接删除+重写
2. **索引<内容**：索引只是入口，内容在主题文件
3. **严格筛选**：每次只附最多5个，不确定就不附

### 7.3 工具设计三原则

1. **明确边界**：每个工具的prompt说清楚何时用/何时不用
2. **并行优先**：鼓励并行工具调用提高速度
3. **溯源必须**：WebSearch必须附Sources

### 7.4 输出三原则

1. **先结论后解释**：Lead with answer
2. **能用一句不用三句**：If you can say it in one sentence...
3. **不重复用户的话**：Don't restate what the user said

---

*文档版本：v1.0*
*研究日期：2026-04-08*
*来源：Piebald-AI/claude-code-system-prompts (v2.1.86)*
