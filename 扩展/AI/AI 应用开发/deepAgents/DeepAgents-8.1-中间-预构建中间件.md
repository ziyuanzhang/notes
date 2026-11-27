# DeepAgents-8.1-中间-预构建中间件

LangChain 已经把智能体开发中经常需要的可靠性、上下文管理、安全控制和辅助能力，封装成可以直接配置的中间件。

```bash
                 Agent 应用
                     │
                     ▼
             Agent 执行运行时
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
   可靠性控制     上下文管理     安全与成本
       │             │             │
       ├─Tool Error  ├─Summarize   ├─HITL
       ├─Tool Retry  ├─Context Edit├─PII
       ├─Model Retry └─Filesystem  ├─Model Limit
       └─Fallback                  └─Tool Limit
       │             │             │
       └─────────────┼─────────────┘
                     │
                     ▼
               任务执行与扩展
                     │
                     ├── To-do List
                     ├── Tool Selector
                     ├── Provider Tool Search
                     ├── Shell
                     ├── Subagent
                     ├── Rubric Grading
                     ├── File Search
                     └── Tool Emulator
                     │
                     ▼
                模型与工具协作
                     │
                     ▼
                  最终结果
```

## 二、分类

### 2.1 可靠性与故障恢复

1. Tool Error — 工具错误处理中间件
2. Tool Retry — 工具重试中间件
3. Model Retry — 模型重试中间件
4. Model Fallback — 模型降级 / 备用模型中间件

- 这四个中间件怎么区分？

| 中间件         | 处理什么问题     | 核心动作                 |
| -------------- | ---------------- | ------------------------ |
| Tool Error     | 工具抛出异常     | 把错误转换为可处理的消息 |
| Tool Retry     | 工具暂时执行失败 | 重新执行工具             |
| Model Retry    | 模型调用暂时失败 | 重新请求模型             |
| Model Fallback | 主模型不可用     | 切换备用模型             |

### 2.2 上下文管理

1. Summarization — 摘要压缩中间件
2. Context Editing — 上下文编辑中间件
3. Filesystem — 文件系统中间件

### 2.3 安全、人工审核与成本控制

1. Human-in-the-loop（HITL）— 人工介入中间件
2. PII Detection — 个人可识别信息检测
3. Model Call Limit — 模型调用次数限制
4. Tool Call Limit — 工具调用次数限制
5. Rate limits、业务权限与中间件限额的区别

### 2.4 任务规划、工具选择与 Agent 扩展能力

1. To-do List — 待办事项 / 任务规划中间件
2. LLM Tool Selector — 大模型工具选择器
3. Provider Tool Search — 提供商侧工具搜索
4. Shell Tool — Shell 命令执行中间件
5. Subagent — 子智能体中间件
6. Rubric Grading — 评分标准评估中间件
7. File Search — 文件搜索中间件
8. LLM Tool Emulator — 大模型工具模拟器

### 2.5 Provider-specific Middleware — 特定模型提供商的中间件

## 三、几个特别容易混淆的概念

- Summarization、Context Editing、Filesystem 有什么区别？

  | 对比               | Summarization        | Context Editing                    | Filesystem                       |
  | ------------------ | -------------------- | ---------------------------------- | -------------------------------- |
  | 核心操作           | 总结历史消息         | 清理旧工具结果                     | 读写文件                         |
  | 如何减少上下文占用 | 将部分历史压缩为摘要 | 移除不再需要的上下文内容           | 将内容放到文件中，需要时再读     |
  | 是否保留历史信息   | 保留摘要形式的信息   | 被清理的内容不再保留在当前上下文中 | 如果已写入文件，可在后续重新读取 |
  | 适用场景           | 长对话、多轮任务     | 工具调用结果过多                   | 长文档、代码库、任务中间产物     |

  最重要的区别是：清理上下文不等于保存信息，保存信息也不等于自动提供给模型。

- Deep Agents 和普通 create_agent() 的配置入口

## 四、归纳

| 你要解决的问题                | 优先了解的中间件                                    |
| ----------------------------- | --------------------------------------------------- |
| 工具、模型偶尔失败            | Tool Error、Tool Retry、Model Retry、Model Fallback |
| Agent 对话和工具结果越来越长  | Summarization、Context Editing、Filesystem          |
| 防止 Agent 过度调用、失控消耗 | Model Call Limit、Tool Call Limit                   |
| 敏感操作需要人为把关          | Human-in-the-loop、PII Detection                    |
| 复杂任务需要拆分和跟踪        | To-do List、Subagent                                |
| 工具太多，不知道该用哪些      | LLM Tool Selector、Provider Tool Search             |
| Agent 需要执行命令或检索代码  | Shell Tool、File Search                             |
| 需要自动评估或模拟工具        | Rubric Grading、LLM Tool Emulator                   |
