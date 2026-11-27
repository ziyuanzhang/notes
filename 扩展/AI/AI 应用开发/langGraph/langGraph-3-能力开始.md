# langGraph-3.0-能力开始

建立层级关系：一张总图

```text
┌─────────────────────────────────────────────────────────────┐
│ 应用层：FastAPI / 前端 / 审批页面 / 权限 / 审计 / 业务事件协议     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 可观测层：Streaming（v2）/ Event Streaming（v3）               │
│                                                             │
│   - stream_mode: values/updates/messages/custom/...         │
│   - stream_events: messages/values/subgraphs/output         │
│   - 注意：观察 ≠ 控制，ns ≠ 权限                               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 编排层：Graph / Node / Edge / Subgraph / Command(goto)       │
│                                                             │
│   - 父图调度，子图模块化                                         │
│   - Subgraph Checkpointer: None / True / False              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 执行控制层：Interrupt / Time Travel / Retry / Timeout /       │
│             ErrorHandler / Graceful Shutdown                │
│                                                             │
│   - 暂停、恢复、回放、重试、停止                                 │
│   - 依赖 Checkpointer 保存恢复点                              │
└─────────────────────────────▲───────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│ 记忆层：Short-term Memory / Long-term Memory                  │
│                                                              │
│   - Short-term = State + Checkpointer + thread_id            │
│   - Long-term = Store + Namespace + Key + Value + 业务逻辑    │
│   - 管理策略：Trim / Delete / Summarize / Extraction / Update  │
└─────────────────────────────▲────────────────────────────────┘
                              │  建立在…之上
┌─────────────────────────────────────────────────────────────┐
│ 持久化基础层：Checkpointer(线程内)  / Store(跨线程)             │
│                                                             │
│   - Checkpointer: thread_id → Checkpoint/Writes → 图状态     │
│   - Store: namespace + key → value → 跨线程数据               │
│   - 后端：InMemory / SQLite / PostgreSQL / MongoDB / Redis   │
└─────────────────────────────▲───────────────────────────────┘
                              │  落盘到…
┌────────────────────────────────────────────────────────────────┐
│ 存储层：PostgreSQL(+pgvector) / SQLite / 向量索引 / 对象存储 / 备份 │
└────────────────────────────────────────────────────────────────┘
```

上层每个能力最终都要回答「我的状态存在哪」——短期(对话类)落 Checkpointer，跨会话(画像类)落 Store，向量检索落到带 pgvector 的 Store。

- 读图要点：
  1. 越往下越“机制”，越往上越“业务”。
     - Checkpointer/Store 是机制；记忆提取、权限、审计是业务。

  2. Checkpointer 和 Store 是并列的两套持久化，不是父子。
     - 它们可以共用 PostgreSQL，但不是同一套逻辑。

  3. Interrupt/Time Travel/Retry 都依赖 Checkpointer。
     - 没有 Checkpointer，暂停无法恢复，Time Travel 无历史，Retry 无法跨进程恢复。

  4. Streaming/Event Streaming 是观察层，不是执行层。
     - 它不改变图执行路径，不负责持久化，不负责权限。

  5. Subgraph 是编排层的组合机制，不是 Agent 的同义词。
     - Agent 可以是 Subgraph，Subgraph 也可以是纯业务工作流