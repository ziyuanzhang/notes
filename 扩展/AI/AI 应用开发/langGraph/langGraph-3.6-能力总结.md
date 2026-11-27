# langGraph-3.6-能力总结

## 第一部分 全局分类（11 篇归入 5 大支柱）

| 支柱                          | 主题                    | 原始文件                                 |
| ----------------------------- | ----------------------- | ---------------------------------------- |
| 一 持久化 Persistence（地基） | 让状态/数据跨越单次运行 | **3.2（Checkpointer 详解）**、3.1        |
| 二 持久化之上的控制能力       | 暂停/恢复、回到过去     | 3.4（Interrupt）、3.5（Time Travel）     |
| 三 记忆 Memory                | 短期/长期记忆及其管理   | 3.3（Store）、3.6（Memory）、3.7（总结） |
| 四 编排 Modular               | 工作流模块化、父子图    | 3.8（Subgraph）                          |
| 五 交互与可靠性               | 实时观察 + 故障处理     | 3.9/3.10（Streaming）、3.11（容错）      |

> 一句话主线：**Persistence 是地基，Memory / Interrupt / Time Travel / Subgraph 是地基上长出的能力，Streaming 是观察窗，容错是安全网。**

### 第 1 层：持久化基础机制（Persistence Infrastructure）

| 文档             | 核心                                                            |
| ---------------- | --------------------------------------------------------------- |
| 3.1 持久性总览   | Checkpointer vs Store，thread_id，namespace+key，能力边界       |
| 3.2 Checkpointer | State/Thread/Checkpoint/Super-step/Writes，保存时机，durability |
| 3.3 Store        | Namespace/Key/Value，put/get/search，语义索引，后端选择         |

这一层回答：数据存在哪、怎么存、怎么读。

### 第 2 层：执行控制机制（Execution Control）

| 文档            | 核心                                                           |
| --------------- | -------------------------------------------------------------- |
| 3.4 Interrupts  | interrupt() + Checkpointer + thread_id + Command(resume)，HITL |
| 3.5 Time Travel | Replay/Fork，get_state_history，update_state，as_node          |
| 3.11 容错机制   | Retry/Timeout/ErrorHandler/Checkpoint/Graceful Shutdown        |

这一层回答：执行怎么暂停、恢复、回放、重试、停止。

### 第 3 层：记忆体系（Memory System）

| 文档       | 核心                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 3.6 Memory | Short-term = State+Checkpointer+thread_id；Long-term = Store+业务逻辑 |
| 3.7 总结   | 记忆生命周期、管理策略（Trim/Delete/Summarize/Extraction/Update）     |

这一层回答：Agent 记什么、怎么记、怎么用、怎么删。

### 第 4 层：组合与编排（Composition & Orchestration）

| 文档         | 核心                                         |
| ------------ | -------------------------------------------- |
| 3.8 Subgraph | 父子图通信、三种 Checkpointer 模式、状态检查 |

这一层回答：复杂工作流怎么模块化、怎么组合。

### 第 5 层：可观测与流式（Observability & Streaming）

| 文档                         | 核心                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 3.9 Streaming（不推荐）      | stream_mode、v1/v2 格式、subgraphs=True、nostream      |
| 3.10 Event Streaming（推荐） | stream_events、Projection、Transformer、interrupt 观察 |

这一层回答：执行过程怎么实时暴露、怎么消费、怎么审计。

### 横切关注点（贯穿所有层）

- thread_id / namespace 的身份与权限：不能信任客户端，必须服务端校验。
- 幂等与补偿：Checkpoint/Retry/Replay 都不保证外部副作用 exactly-once。
- 数据保留与删除：Checkpointer、Store、业务库、向量索引、日志要分别处理。
- 自主可控：LangGraph 提供机制，业务策略、权限、审计、迁移由开发者掌握。

---

## 第二部分 层级关系（知识树）

### 2.1 建立层级关系：一张总图

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

### 2.2 横向层级：核心对象归属表（重点记忆）

| 对象                       | 所属支柱  | 层级   | 核心职责                       | 定位方式                             |
| -------------------------- | --------- | ------ | ------------------------------ | ------------------------------------ |
| Runtime                    |           |        | 运行时上下文入口               |
| Writes                     | 一 持久化 | 元数据 | 记录“已完成节点”的中间更新     | 随 Checkpoint                        |
| State                      | 一 持久化 | 运行态 | 图当前业务数据                 | 内存中随执行变化                     |
| Checkpoint(检查点)         | 一 持久化 |        | super-step 边界的 完整状态快照 |                                      |
| Checkpointer(检查点管理器) | 一 持久化 | 机制   | 保存线程内 State 快照          | thread_id                            |
| Store                      | 一 持久化 | 机制   | 保存跨线程自定义数据           | namespace + key                      |
| thread_id                  | 一 持久化 | 标识   | 标识一个执行线程（≠ 用户 ID）  | config.configurable                  |
| Super-step                 | 一 持久化 | 边界   | 执行/检查点的调度单位          | 运行时                               |
| Interrupt                  | 二 控制   | 能力   | 动态暂停等待外部输入           | interrupt() + Command(resume)        |
| Time Travel                | 二 控制   | 能力   | 回到历史检查点 Replay/Fork     | get_state_history() + update_state() |
| Short-term Memory          | 三 记忆   | 能力   | 当前会话记住历史               | State + Checkpointer                 |
| Long-term Memory           | 三 记忆   | 能力   | 跨会话共享用户信息             | Store + 业务逻辑                     |
| Subgraph                   | 四 编排   | 能力   | 工作流模块化                   | 作为 Node 嵌套                       |
| Streaming(v2)              | 五 交互   | 观察   | 原始模式事件流                 | graph.stream(version="v2")           |
| Event Streaming(v3)        | 五 交互   | 观察   | 类型化投影事件流               | graph.stream_events(version="v3")    |
| Retry/Timeout/ErrorHandler | 五 可靠   | 容错   | 失败处理                       | add_node(...)                        |
| Graceful Shutdown          | 五 可靠   | 容错   | 安全停机保留恢复点             | RunControl                           |

| 机制               | 何时触发                          | 状态存哪                           | 如何恢复                         | 关键坑                                   |
| ------------------ | --------------------------------- | ---------------------------------- | -------------------------------- | ---------------------------------------- |
| Interrupt          | 节点调用 interrupt()              | Checkpointer                       | Command(resume=…) + 同 thread_id | 节点整段重跑，副作用要幂等               |
| Time Travel-Replay | invoke(None, 历史 config)         | Checkpointer                       | 自动续跑后续节点                 | 可能重触发 interrupt；结果未必与原跑一致 |
| Time Travel-Fork   | update_state(历史 config, values) | 新 Checkpoint 分支                 | invoke(None, fork_config)        | 不删原历史；as_node 控归属               |
| delete_thread      | 显式调用                          | Checkpointer 数据被删              | 不可恢复该线程                   | 不删 Store 长期记忆                      |
| Retry              | 节点抛可重试异常                  | 清除本次失败写入                   | 自动再试                         | 清除 State 写入 ≠ 撤销外部副作用         |
| Timeout            | run/idle 超限 → NodeTimeoutError  | 清除本次写入                       | 交由 Retry/ErrorHandler          | 仅异步节点、需 langgraph≥1.2             |
| ErrorHandler       | 重试耗尽                          | Command 更新 State 改路由          | 由 handler 决定                  | handler 自身异常向外传播                 |
| Graceful Shutdown  | control.request_drain()           | Super-step 边界存可恢复 Checkpoint | invoke(None, 同 thread_id)       | 停机耗时须 < 容器宽限期，否则 SIGKILL    |

### 2.3 易混概念「非关系」澄清

1. **Checkpointer ≠ Store**：两套互补机制，不是父子。可同库但非必须；保存内容不同（线程状态 vs 业务长期数据）。
2. **Memory ≠ 第三种数据库**：Memory 是 Agent 的「记忆能力」概念层，落地 = Checkpointer（短期）+ Store（长期）。
3. **Runtime ≠ 数据库**：Runtime 是节点运行时上下文入口（runtime.context / runtime.store），不是存储。
4. **ns（流式 namespace）≠ 用户身份**：流式事件里的 ns 只是事件来源标识，不可作授权依据。
5. **thread_id ≠ 用户 ID ≠ Store key**：一个用户可有多个 thread；Store 用 namespace 定位用户数据。

- Subgraph 三种 Checkpointer 模式

  | 模式           | 配置                      | 跨调用记忆 | Interrupt      | 并行同子图  | 适用                  |
  | -------------- | ------------------------- | ---------- | -------------- | ----------- | --------------------- |
  | Per-invocation | checkpointer=None（默认） | 否         | 单次调用内支持 | 安全        | 一次性任务、SQL Agent |
  | Per-thread     | checkpointer=True         | 是         | 支持           | ⚠️ 可能冲突 | 持续对话、研究 Agent  |
  | Stateless      | checkpointer=False        | 否         | 不支持         | 安全        | 纯计算、确定性流程    |

---

## 第三部分 分支柱整合正文（优化重组）

### 3.1 持久化 Persistence —— 地基

- **解决四类问题**：对话连续性、中断后继续、故障恢复、长期记忆。
- **两大机制对照**：

  | 概念         | 用途             | 范围   | 数据形式               | 访问               | 类比                   |
  | ------------ | ---------------- | ------ | ---------------------- | ------------------ | ---------------------- |
  | Checkpointer | 保存图执行状态   | 单线程 | State 检查点 + 元数据  | thread_id + config | 某任务的「存档」       |
  | Store        | 保存应用定义数据 | 跨线程 | namespace 下 key-value | namespace + key    | 多任务可查的「资料库」 |

- **Super-step（执行轮次）= 检查点的分界单位**：
  1. 一轮 = Plan（据当前状态+上轮更新决定本轮跑谁）→ Execute（节点可并行执行，更新在本轮内不互相可见）→ Update（汇总写入形成后续状态）。
  2. 分界由「调度与节点执行状态」决定，不是手动数代码行数；
  3. super-step 数取决于实际执行路径，而非图上边数或节点总数。

- **Checkpoint vs Writes**：
  1. Checkpoint 是 super-step 边界上的**完整 State 快照**，答「恢复时整个图状态是什么」；
  2. Writes 是同一轮内**已成功节点**的级写入记录，答「哪些节点已做完、结果是什么」，用于恢复时避免重跑。
  3. Writes ≠ 新快照，其保留/关联/清理由 Checkpointer 实现与恢复机制决定。

- **全量 vs 增量**：
  1. 默认每个 super-step 写入各通道完整值；
  2. 生产级 Postgres Checkpointer 分通道存储并版本管理，新检查点只存发生变更的值（增量）。

- **读 / 改 / 回放原语**：
  1. `get_state(config)` → StateSnapshot【values / next（空元组通常表示图已结束）/ metadata（来源·节点写入·step）/ parent_config】；
  2. `update_state(config, values, as_node=...)` **创建新检查点**而非改写旧检查点，下一步位置还受 as_node 与 reducer 影响；
  3. `get_state_history(config)` 读历史，可从历史 checkpoint_id **回放**——回放会重新触发后续模型调用/中断，**不能等同只读查看**。

- **durability 写入时机**：
  1. sync（下一步前同步写完，最稳最慢）；
  2. async（与下一步并行推进，崩溃可能来不及写最新）；
  3. exit（退出时才写，中途崩溃丢未存中间态）；

- **存储治理**：
  1. 控制 State 体积（勿把大文档/完整检索结果塞进 State）＋ 消息裁剪/摘要 ＋ 评估增量存储 ＋ 按业务保留期限清理旧线程与检查点；
  2. 「检查点数量增多」与「每个检查点数据变大」是两个独立问题。

- **关键边界**：
  1. 持久化 ≠ 模型有了永久记忆（是应用+底层存储在读写，不会自动做用户画像/知识库检索）；
  2. 保存检查点 ≠ 外部操作 exactly-once（节点结果写入前崩溃，恢复可能重执行，如重复扣款）；
  3. sync 只强化检查点写入**时序**，不代表整个业务事务具有原子性；
  4. 数据库连接、HTTP 客户端、模型客户端、进程全局变量 不会因出现在 Python 进程里就自动成为可恢复业务状态。

### 3.2 控制能力：Interrupt 与 Time Travel

**Interrupt（人工介入闭环）** —— 四件套：interrupt() 提请求 + Checkpointer 存状态 + thread_id 定位 + Command(resume=...) 送回输入。

- ⚠️ 恢复时**重新执行包含 interrupt() 的整个节点函数体**（不是从下一行直接跳转），故中断点之前的副作用要考虑重复执行。
- 静态断点 interrupt_before / interrupt_after 偏调试；动态 interrupt() 偏业务审批。
- 进阶：response_schema 类型化响应、多 / 并行 Interrupt（用 {item.id: response} 映射）、中断可放进 Tool 内部。

- **Time Travel（基于检查点）** —— 两种玩法：

  | 方式   | 含义                   | 是否改 State | 用途       |
  | ------ | ---------------------- | ------------ | ---------- |
  | Replay | 历史检查点重新执行     | 默认不改     | 重试、调试 |
  | Fork   | 历史检查点改状态后分支 | 可改         | 方案探索   |

- update_state() 既能改 State，也能用 as_node= 指定「这次更新视为哪个节点产出」，用于并行分支 / 新线程 / 跳过节点。
- 默认子图继承父图 Checkpointer 时，父图把子图整体当**一个 Super-step**，无法穿透到子图内部任意检查点。
- 边界：不能自动撤销外部 API 副作用、不能自动复现原 LLM 输出。

### 3.3 记忆 Memory —— 地基上长出的能力

#### 3.2.1 两条主线

- 短期 = State + Checkpointer + thread_id（管「当前会话」）；
- 长期 = Store + namespace/key/value（管「跨会话共享」）。

#### 3.2.2 短期记忆管理四法（核心区分：「保存」≠「发送给 LLM」）

| 方法            | 作用                          | 改 State   |
| --------------- | ----------------------------- | ---------- |
| Trim            | 裁剪本次发给模型的消息        | 否         |
| Delete          | 删除历史消息（RemoveMessage） | 是         |
| Summarize       | 压缩早期对话成摘要            | 是         |
| Checkpoint 管理 | 查看 / 恢复 / 删除检查点      | 操作持久化 |

#### 3.2.3 长期记忆管理（Store 只给存取，「记什么」需业务设计）

Extraction 提取、Update 去重/修正、Semantic Search 检索。

- 语义检索铁律：**建库与查询必须用同一个 embedding 模型**；生成模型可换。
- delete_thread() 删的是短期线程数据，**不删** Store 里的长期记忆；用户注销需分别清理 Checkpointer / Store / 业务库 / 向量索引。

#### 3.2.4 6 句话总纲

Persistence 是体系 → Checkpointer 管线程状态 → Store 管跨线程数据 → Memory 是能力概念 → Memory Manager 决定记什么 → Memory Retrieval 决定用什么。

### 3.4 编排 Subgraph —— 工作流模块化

- 本质：**被当作节点使用的 Graph**；父图调度、子图承担局部流程。Agent 可作子图，子图不一定是 Agent。
- 父子通信两模式：
  1. A 在父 Node 内 subgraph.invoke()（State Schema 不同/需转换、隔离好）；
  2. B add_node(child, subgraph) 直接挂（共享 State key、简洁但耦合高）。

- 持久化三模式（与 一/二 衔接）：

  | 模式           | 配置                      | 含义                           | 跨调用记忆 | 适用             |
  | -------------- | ------------------------- | ------------------------------ | ---------- | ---------------- |
  | Per-invocation | checkpointer=None（默认） | 每次调用重开，单次内可继承父图 | ❌         | 一次性任务       |
  | Per-thread     | checkpointer=True         | 同线程跨调用积累               | ✅         | 持续对话子 Agent |
  | Stateless      | checkpointer=False        | 不建检查点                     | ❌         | 轻量确定性流程   |

- 调试：graph.get_state(config, subgraphs=True) → 父图状态在 state.values，子图状态在 state.tasks[0].state.values；藏在 Tool 里的子图无法静态检查。

### 3.5 交互与可靠性：Streaming 与容错

#### **流式两代 API**

| 对比 | Streaming（v2，旧·不推荐）  | Event Streaming（v3，推荐）                      |
| ---- | --------------------------- | ------------------------------------------------ |
| 调用 | graph.stream / astream      | graph.stream_events / astream_events             |
| 模型 | 7 种 Stream Mode            | 类型化 Projection 投影                           |
| 消费 | 按 type 手动分发            | stream.messages / .values / .subgraphs / .output |
| 结构 | {type, ns, data} StreamPart | 多消费者共享同一事件流（interleave / gather）    |

- 7 种 Stream Mode：values（全快照）/ updates（增量）/ messages（Token + metadata）/ custom（get_stream_writer）/ checkpoints / tasks / debug（生产慎透出）。
- 关键边界：
  1. Streaming 是**观察通道**不改执行逻辑；
  2. nostream 标签只控该流输出、非脱敏/隔离；
  3. LangGraph Streaming ≠ SSE ≠ WebSocket（不同传输层）。

- version="v2" 还影响 invoke()：用 result.value / result.interrupts 分离业务结果与中断元数据。

#### **容错四件套 + 安全网**（顺序：异常 → Retry → Error Handler → 传播/Checkpoint 恢复）：

| 机制              | 解决                                                                              | 是否管持久化恢复  |
| ----------------- | --------------------------------------------------------------------------------- | ----------------- |
| RetryPolicy       | 暂时失败重试（指数退避 + jitter，default_retry_on 排除确定性错误）                | 否                |
| TimeoutPolicy     | run_timeout（运行上限）/ idle_timeout（无进展上限），仅异步节点、需 langgraph≥1.2 | 否                |
| error_handler     | 重试耗尽后降级/补偿/改路由（返回 Command）                                        | 否                |
| Checkpoint        | 保存可恢复执行状态                                                                | 是                |
| Graceful Shutdown | RunControl 在 Super-step 边界停、存恢复点（须 < 容器宽限期，SIGKILL 是绝对命令）  | 依赖 Checkpointer |

- 三条铁律：
  1. 清除 State 写入 ≠ 撤销外部副作用（重试可能重复扣款）；
  2. Retry ≠ exactly-once；
  3. Checkpoint ≠ 自动回滚。

- set_node_defaults() 图级默认策略**不继承给子图**；
  1. runtime.execution_info（node_attempt / thread_id / run_id / checkpoint_id / task_id）支撑「第 N 次走备用服务」式降级。

---

## 第四部分 全局总结：一张图记住 LangGraph 运行时

```text
一次 Agent 运行的完整生命周期

用户输入 → [Graph/Node 执行] ─┬─ 过程可观察 → Streaming(v2)/Event Streaming(v3) → 前端 SSE/WS
                            ├─ 需人工决策 → interrupt() 暂停 → Command(resume) 恢复
                            ├─ 失败   → Retry → Timeout → Error Handler → Checkpoint 恢复
                            ├─ 模块化   → Subgraph（Per-invocation/Per-thread/Stateless）
                            └─ 状态落地   → Checkpointer(thread_id, 短期) + Store(namespace, 长期)
                                                └── 时间旅行 Replay/Fork 回到历史检查点
```

### 4.1 三句话

1. thread_id 解决“这是哪个线程”，不是“这是哪个用户”；namespace 解决“这是谁的数据”，但权限必须服务端校验。
2. Checkpointer 解决“上次执行到哪、状态是什么”；Store 解决“其他线程也需要哪些长期数据”；Memory 是两者加业务策略的组合，不是第三种数据库。
3. 持久化只是可靠 Agent 的基础；幂等、权限、审计、备份、保留策略、故障恢复设计，仍然由应用开发者掌握。

### 4.2 五个核心认知

1. Short-term Memory = State + Checkpointer + thread_id，
   - 通过 thread_id 恢复当前会话状态；
   - 保存完整 State ≠ 每次把完整 State 发给 LLM（Trim/Delete/Summarize 是不同策略）。

2. Long-term Memory = Store + Namespace + Key + Value + 业务逻辑，
   - Store 不会自动总结对话；
   - 记忆提取、去重、更新、过期、删除需要开发者设计。

3. Interrupt / Time Travel / Retry / Graceful Shutdown 都依赖 Checkpointer；
   - 恢复时节点函数体会重跑，interrupt 前的副作用要考虑重复执行。

4. Streaming/Event Streaming 是观察层，不是执行层；
   - 观察 ≠ 控制，
   - ns ≠ 权限，
   - stream.output ≠ 最后一段文本。

5. Subgraph 是编排模块化机制，不是 Agent 同义词；
   - Subgraph Checkpointer 的 None/True/False 决定子图状态生命周期，父图 Checkpointer 是前提。

### 4.3 一条主线

Graph 执行 → 状态变化 → Checkpointer 保存检查点 → Store 保存跨线程记忆 → Interrupt/Time Travel/Retry 基于检查点控制执行 → Subgraph 组合工作流 → Streaming/Event Streaming 观察执行 → 应用层负责权限、幂等、审计、保留策略。

---
