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

3. graph_id 为什么重要？
   对于使用 LangGraph 的同一部署模式，需要在 langgraph.json 中注册相关图。

   ```bash
   {
     "graphs": {
       "supervisor": "./src/supervisor.py:graph",
       "researcher": "./src/researcher.py:graph",
       "coder": "./src/coder.py:graph"
     }
   }
   # 可以把它理解为服务端的智能体注册表：
   langgraph.json
         │
         ├── supervisor  ──> Supervisor 图的代码入口
         ├── researcher  ──> Researcher 图的代码入口
         └── coder       ──> Coder 图的代码入口
   ```

   ❗ graph_id 不是 Python 模块名，也不是随便写的任务类型字符串。它需要与 Agent Protocol 服务端实际注册的图或 Assistant 标识相匹配

## 三、五个异步任务工具：这是整篇文档的核心

当配置了异步子智能体后，AsyncSubAgentMiddleware 会向 Supervisor 提供五个工具。

| 工具              | 翻译         | 作用                           |
| ----------------- | ------------ | ------------------------------ |
| start_async_task  | 启动异步任务 | 创建后台任务，立即返回 Task ID |
| check_async_task  | 检查异步任务 | 获取任务当前状态和完成结果     |
| update_async_task | 更新异步任务 | 向正在运行的任务补充新指令     |
| cancel_async_task | 取消异步任务 | 停止任务并标记为已取消         |
| list_async_tasks  | 列出异步任务 | 查看所有被跟踪任务的状态       |

这五个工具是 Supervisor 的控制接口，不是五种不同的子智能体。

Researcher 和 Coder 负责完成任务；这五个工具负责调度、跟踪和管理任务。

- 一次异步任务的完整生命周期

```bash
用户提出任务
     │
     ▼
Supervisor 判断需要委派
     │
     ▼
start_async_task(...)
     │
     ├── 服务端创建新的 Thread
     ├── 启动一次 Run
     └── 返回 task_id
             │
             ▼
      Supervisor 返回控制权
             │
             ├── 继续与用户交互
             ├── 处理其他任务
             └── 等待后续检查时机
                       │
                       ▼
               check_async_task(task_id)
                       │
                 ┌─────┴─────┐
                 ▼           ▼
              仍在运行      已完成
                 │           │
                 ▼           ▼
            继续其他工作   获取结果
                             │
                             ▼
                        汇总并回复
```

### 四、理解 Thread、Run 和 Task ID 的关系

启动异步任务时，服务端会创建一个新的 Thread，在这个 Thread 上启动一次 Run，并把 Thread ID 作为 Task ID 返回。

| 概念    | 含义                                                   | 类比               |
| ------- | ------------------------------------------------------ | ------------------ |
| Thread  | 保存一段持续的对话及其状态                             | 一个独立的工作档案 |
| Run     | 在某个 Thread 上执行的一次运行                         | 一次具体的工作过程 |
| Task ID | Supervisor 用来追踪异步任务的 ID；文档中对应 Thread ID | 工作单编号         |

```bash
Supervisor
    │
    │ start_async_task(...)
    ▼
异步任务管理器
    │
    ├── 创建 Thread
    │      └── thread_id = task_id
    │
    └── 启动 Run
           └── run_id
                  │
                  ▼
            子智能体执行任务
                  │
                  ▼
            任务完成或失败
```

- 为什么要把 Thread 和 Run 分开？

  因为 Thread 是任务持续存在的上下文，而 Run 是一次具体的执行。文档描述的更新机制就利用了这种区别：更新任务时，系统会在同一个 Thread 上启动新的 Run。

- 更新任务到底做了什么？
  系统会：
  1. 对原来的 Run 执行中断处理。
  2. 在同一个 Thread 上启动新的 Run。
  3. 使用完整的对话历史加上新指令重新执行。
  4. 保留原来的 Task ID。

  因此，它不是简单地向一个正在执行的 Python 函数追加参数，而是利用原有 Thread 的上下文，通过新的 Run 重新推进任务。

## 五、为什么还需要单独的 async_tasks 状态通道？

任务元数据被保存在 Supervisor 图中的专用状态通道 async_tasks 里，与消息历史分开存储。

- 为什么不直接把任务 ID 放进对话消息中？
  因为 Deep Agents 可能会在上下文窗口不足时压缩对话历史。

  如果任务 ID 只存在于普通消息中，历史被压缩后，模型可能无法再从对话中找到完整的任务标识。
  而专门的状态通道可以保留这些任务的跟踪信息，让 Supervisor 通过 list_async_tasks 重新获取任务清单。

| 字段            | 含义                   |
| --------------- | ---------------------- |
| Task ID         | 任务标识               |
| Agent name      | 执行任务的子智能体名称 |
| Thread ID       | 子智能体所在的 Thread  |
| Run ID          | 当前关联的 Run         |
| Status          | 当前任务状态           |
| created_at      | 创建时间               |
| last_checked_at | 上次检查时间           |
| last_updated_at | 上次更新指令的时间     |

```bash
Supervisor State
│
├── messages
│     └── 对话消息、工具调用、工具结果
│
└── async_tasks
      ├── task_001
      │     ├── agent_name
      │     ├── thread_id
      │     ├── run_id
      │     ├── status
      │     └── timestamps
      │
      ├── task_002
      └── task_003
```

### 5.1 这里要和之前学的 Memory、Backend、State 区分开

- messages：记录对话过程。
- async_tasks：记录异步任务的管理信息。
- 子智能体的 Thread State：保存该子智能体自己的运行上下文。
- 长期 Memory：用于跨对话保存可复用的信息。

它们可以共同参与一个 Agent 系统，但不是同一份数据，也不是同一种用途。

文档说 async_tasks 是独立的状态通道，并没有说它天然就是数据库、Redis 或长期记忆。具体检查点持久化与恢复行为，还要结合部署使用的 Checkpointer 和服务端实现来判断。

## 六、部署架构：ASGI、HTTP 与混合部署

1. 单服务部署：ASGI transport

   Supervisor 和 Researcher、Coder 都部署在同一个服务中。配置 AsyncSubAgent 时不填写 url，SDK 使用 ASGI transport，通过进程内调用连接服务端图。

   优点是没有 HTTP 网络往返开销，也不需要为这条连接额外配置远程认证。子智能体依然有独立 Thread 和状态。

2. 分离部署：HTTP transport

   Supervisor 和子智能体部署在不同服务中，配置 url 后通过 HTTP 通信。

   适合需要独立扩容、不同计算资源配置，或者由不同团队维护的子智能体。代价是需要考虑网络延迟、认证、超时和服务可用性。

3. 混合部署：ASGI + HTTP

   Researcher 可以留在 Supervisor 所在的服务里，而 Coder 部署到远程服务。

   适合大部分能力就近运行、少数高资源任务独立部署的系统。

- 关于远程认证
  文档提到，LangGraph 部署使用 LangGraph SDK 时，可通过环境变量 LANGSMITH_API_KEY 或 LANGGRAPH_API_KEY 进行认证。自托管的 Agent Protocol 服务可能使用不同的认证机制。

## 七、最佳实践与常见问题

1. Worker 数量必须足够;`langgraph dev --n-jobs-per-worker 10`

   1 个 Supervisor + 3 个子智能体任务 = 4 个同时运行的 Run

2. 不要启动后立刻循环检查
   这样虽然启动工具叫 async，但 Supervisor 自己马上陷入了等待循环，实际效果就退化成了同步等待。

   文档建议在系统提示词中明确规定：启动异步子智能体后，必须先把控制权交还给用户，不要立即调用检查工具。

3. 任务状态必须实时查询
4. 追踪任务要结合 Thread ID

## 八、与之前学过的 Deep Agents 知识串起来

```bash
Deep Agents
│
├── Agent Runtime
│     └── Supervisor 运行和决策
│
├── Middleware
│     └── AsyncSubAgentMiddleware
│             └── 五个任务管理工具
│
├── Subagents
│     ├── 同步子智能体
│     └── 异步子智能体
│
├── State / Persistence
│     ├── Supervisor 的 async_tasks
│     └── 子智能体各自的 Thread State
│
├── Backend / Memory
│     └── 文件、工作数据和长期记忆
│         （与异步任务元数据不是同一概念）
│
└── Deployment / Transport
      ├── ASGI：同一部署内通信
      ├── HTTP：远程服务通信
      └── Hybrid：混合部署
```

## 九、最终归纳：记住这 6 句话

1. AsyncSubAgent 是配置对象，不是正在执行的任务。
2. Supervisor 通过 start_async_task 启动任务，立即获得 Task ID。
3. Task ID 在本文的实现中对应子智能体的 Thread ID。
4. check、update、cancel、list 负责任务管理，不负责具体业务执行。
5. async_tasks 独立记录任务元数据，避免任务信息只存在于可能被压缩的对话历史中。
6. ASGI、HTTP 和混合部署决定子智能体如何连接，不改变异步任务的基本管理思路。

下一步重点理解 start_async_task → Thread / Run → async_tasks → check_async_task 这条链路。把它弄明白后，再看多子智能体并发、任务恢复和分布式部署，就会容易很多。
