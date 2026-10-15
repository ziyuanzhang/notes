# DeepAgents-6.2-子代理-异步智能体

让 Supervisor（监督智能体）启动一个子智能体去后台执行任务，然后立即返回，自己继续与用户交互；等需要结果时，再检查任务状态、补充指令或取消任务。

- 同步子智能体（Sync subagents）：派发任务后，Supervisor 要等待子智能体完成，才能继续。
- 异步子智能体（Async subagents）：派发任务后，立即拿到 task_id，Supervisor 可以继续处理其他事情。

  异步: 是指 任务的执行、等待和管理方式发生了变化。

## 一、先建立整体层级关系

```bash
            create_deep_agent(...)
                    │
                    ▼
┌───────────────────────────────────────────┐
│            Deep Agent Harness             │
│                                           │
│  Supervisor Agent（监督智能体）             │
│       │                                   │
│       ├── LLM：决定是否委派任务              │
│       │                                   │
│       └── AsyncSubAgentMiddleware         │
│                 │                         │
│                 ├── start_async_task      │
│                 ├── check_async_task      │
│                 ├── update_async_task     │
│                 ├── cancel_async_task     │
│                 └── list_async_tasks      │
└─────────────────┬─────────────────────────┘
                  │
          Agent Protocol / SDK
                  │
         ┌────────┴────────┐
         ▼                 ▼
   Researcher           Coder
   研究子智能体           编码子智能体
         │                 │
         ▼                 ▼
   独立执行任务         独立执行任务
   独立 Thread          独立 Thread
         │                 │
         ▼                 ▼
   研究结果             代码结果
         └────────┬────────┘
                  ▼
          Supervisor 获取结果
                  │
                  ▼
           整合并回复用户
```

| 层级           | 负责什么                           | 本篇涉及的内容          |
| -------------- | ---------------------------------- | ----------------------- |
| Agent 创建层   | 创建并配置智能体                   | create_deep_agent()     |
| Agent 运行层   | 接收输入、调用模型和工具           | Supervisor 的运行循环   |
| Middleware 层  | 为 Supervisor 增加异步任务管理能力 | AsyncSubAgentMiddleware |
| 工具调用层     | 启动、查询、更新、取消任务         | 五个异步任务工具        |
| 子智能体执行层 | 真正执行研究、编码等工作           | Researcher、Coder       |
| 状态管理层     | 记录任务 ID、状态和时间等          | async_tasks 状态通道    |
| 部署通信层     | 连接 Supervisor 和子智能体服务     | ASGI 或 HTTP            |

Middleware 负责管理任务，不负责亲自完成研究或编写代码。真正执行任务的是被启动的子智能体。

## 二、 异步子智能体

| 对比维度              | 同步子智能体                 | 异步子智能体             |
| --------------------- | ---------------------------- | ------------------------ |
| 启动任务后的行为      | 等待任务完成                 | 立即返回任务 ID          |
| Supervisor 是否能继续 | 通常要等                     | 可以继续                 |
| 并行执行              | 支持，但调用方可能被阻塞     | 支持非阻塞式管理         |
| 中途修改指令          | 文档所述模式不支持           | 支持更新指令             |
| 取消正在运行的任务    | 文档所述模式不支持           | 支持取消                 |
| 状态持久化            | 文档称为无跨次调用的持久状态 | 通过独立 Thread 维护状态 |
| 典型场景              | 立即需要子任务结果           | 长时间运行、交互式管理   |

### 2.1 配置异步子智能体

```python
from deepagents import AsyncSubAgent, create_deep_agent

async_subagents = [
    AsyncSubAgent(
        name="researcher",
        description="Research agent for information gathering and synthesis",
        graph_id="researcher",
    ),
    AsyncSubAgent(
        name="coder",
        description="Coding agent for code generation and review",
        graph_id="coder",
    ),
]

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    subagents=async_subagents,
)
```

AsyncSubAgent 的四个关键字段

| 字段        | 含义                                          | 直观理解                       |
| ----------- | --------------------------------------------- | ------------------------------ |
| name        | 子智能体的唯一名称                            | 给任务执行者起一个名字         |
| description | 描述子智能体能做什么                          | 帮 Supervisor 判断什么时候委派 |
| graph_id    | Agent Protocol 服务端上的图或 Assistant ID    | 指定实际运行哪个智能体         |
| url         | 可选，远程服务地址 指定子智能体所在的远程服务 |                                |
| headers     | 可选， 用于向远程服务传递自定义认证等请求头   |                                |

1. name 不等于 graph_id
   - name 是 Supervisor 调用这个子智能体时使用的标识。
   - graph_id 是服务端用于找到实际智能体定义的标识。

2. 声明子智能体不等于启动子任务。

```bash
   AsyncSubAgent(...)
           ↓
   配置一个可被调用的子智能体
           ↓
   create_deep_agent(...)
           ↓
   Supervisor 获得异步任务管理能力
           ↓
   模型决定需要委派时
           ↓
   start_async_task(...)
           ↓
   真正启动一次后台任务
```

subagents = async_subagents 是在配置阶段登记可用的子智能体，并不会因为写了两个配置项，就立即启动两个任务。
