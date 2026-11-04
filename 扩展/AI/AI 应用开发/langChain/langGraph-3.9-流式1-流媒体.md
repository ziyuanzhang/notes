# langGraph-3.9-流式1-流媒体(Streaming) - 不推荐了

1. LangGraph 的两种流式机制：Streaming（流模式） 和 Event Streaming（事件流）。核心区别在于：
   - Streaming 是底层、按模式分发的原始事件流，
   - Event Streaming 是建立在它之上的高层、类型化投影模型。

2. 这篇文档的核心：LangGraph 如何把图执行过程中的状态变化、LLM Token、节点进度、子图事件、持久化事件，实时暴露给应用层。

🔥 Graph 负责执行，Stream 负责观察执行过程，应用层负责消费事件并决定如何呈现。

## 一、概念理解：Streaming 是什么？

- 普通调用与流式调用的区别：
  1. 普通调用 invoke()：输入 → 执行完整 Graph → 返回最终结果【关注最终结果】
  2. 流式调用 stream()：输入 → Node A → Node B → Node C【持续输出执行过程中的事件】

❗注意：Streaming 不会改变 Graph 原本的执行逻辑，而是增加一个观察与数据输出通道。

## 二、层级关系：Streaming 位于哪里？

```bash
Application / Frontend
        │
        │ 消费实时事件、更新 UI
        ▼
LangGraph Streaming API
  ├── graph.stream()       同步迭代器
  ├── graph.astream()      异步迭代器
  │
  ├── Stream Modes         选择输出什么
  │    ├── values
  │    ├── updates
  │    ├── messages
  │    ├── custom
  │    ├── checkpoints
  │    ├── tasks
  │    └── debug
  │
  ├── Stream Format        统一输出结构
  │    ├── v1：不同模式返回格式不统一
  │    └── v2：StreamPart 统一结构
  │
  ▼
LangGraph Runtime
  ├── Graph / Node / Edge
  ├── LLM / Tool
  ├── Subgraph
  └── Checkpointer
```

| 概念          | 解决的问题               |
| ------------- | ------------------------ |
| Streaming API | 如何接收执行过程中的数据 |
| Stream Mode   | 想接收哪一类数据         |
| Stream Format | 接收到的数据采用什么结构 |

| Mode        | 返回内容                         | 主要用途       |
| ----------- | -------------------------------- | -------------- |
| values      | 每个执行步骤后的完整 Graph State | 状态快照       |
| updates     | Node 返回的状态增量              | 追踪节点更新   |
| messages    | LLM Token + metadata             | 实时生成文本   |
| custom      | 开发者自定义数据                 | 进度、业务事件 |
| checkpoints | Checkpoint 事件                  | 持久化状态观察 |
| tasks       | Task 开始、结束、结果、异常      | 任务级监控     |
| debug       | 尽可能全面的运行时事件           | 深度调试       |

## 三、为什么需要 Streaming？

在真实 Agent 应用中，用户通常不希望等待整个 Graph 执行完成才看到结果。

- Streaming 主要解决四类问题：

  | 需求                     | 对应能力                    |
  | ------------------------ | --------------------------- |
  | 实时展示 AI 回答         | messages                    |
  | 展示工作流执行进度       | updates / custom            |
  | 观察 Agent 当前状态      | values                      |
  | 监控、调试、追踪运行过程 | tasks / checkpoints / debug |

```bash
React 前端
    │
    │ SSE / WebSocket
    ▼
FastAPI 后端
    │
    │ graph.astream()
    ▼
LangGraph
    │
    ├── LLM Token
    ├── Node 状态变化
    ├── Tool 执行进度
    └── Graph 最终结果
```

LangGraph 负责产生事件，FastAPI 可以负责把事件转发给前端。

- 注意：LangGraph Streaming 本身并不等于 SSE，也不等于 WebSocket。 它们属于不同层次：
  - LangGraph Streaming：Python 进程内部的事件迭代机制。
  - SSE：后端向浏览器单向推送事件的 HTTP 技术。
  - WebSocket：客户端与服务端双向通信技术。

## 四、工作原理：事件是如何产生的？

以一个包含两个 Node 的 Graph 为例：

```bash
  START
    ↓
  refine_topic
    ↓
  generate_joke
    ↓
  END

  # 假设初始状态为： {"topic": "ice cream", "joke": ""}
  # -- 执行过程： ---------------------------
  Graph Runtime
      │
      ├── 执行 refine_topic
      │      └── 返回 {"topic": "ice cream and cats"}
      │
      ├── 产生 updates / values 事件
      │
      ├── 执行 generate_joke
      │      └── 返回 {"joke": "This is a joke ..."}
      │
      ├── 产生 updates / values 事件
      │
      └── Graph 执行结束
```

🔥 Stream 输出的是 Runtime 执行过程中产生的事件，而不是要求开发者自己在每个 Node 中手动 yield。
如果你希望主动输出自定义进度，就可以使用 get_stream_writer()。

## 五、代码解读：基础 API 与统一格式 v2

### 5.1 stream() 与 astream()

| API             | 特征       | 典型场景          |
| --------------- | ---------- | ----------------- |
| graph.stream()  | 同步迭代器 | 同步程序、脚本    |
| graph.astream() | 异步迭代器 | FastAPI、异步服务 |

```python
  # -- 同步版本 --------------------------------
  for chunk in graph.stream(
      inputs,
      stream_mode="updates",
      version="v2",
  ):
      print(chunk)
  # -- 异步版本 --------------------------------
  async for chunk in graph.astream(
      inputs,
      stream_mode="updates",
      version="v2",
  ):
      print(chunk)
```

在 FastAPI 异步接口中，通常优先考虑 astream()。

### 5.2 为什么推荐 version="v2"？

- 旧的 v1 格式会因为模式组合不同，导致返回结构不同, 开发者需要编写多套解析逻辑。

- v2 统一为：`{"type": "updates","ns": (),"data": {...}}`

  | 字段 | 含义                          |
  | ---- | ----------------------------- |
  | type | 当前事件类型                  |
  | ns   | 事件来自哪个 Graph / Subgraph |
  | data | 事件实际携带的数据            |

  这意味着：不论开启多少种模式，甚至是否包含子图，都可以使用统一的事件处理逻辑。

- ns（namespace）可以帮助判断事件来源。

  | ns                        | 含义       |
  | ------------------------- | ---------- |
  | ()                        | 根 Graph   |
  | ("agent_node:<task_id>",) | Agent 子图 |
  | 更深层的 tuple            | 嵌套子图   |

  ❗注意： ns 是来源标识，不等于 Agent 的业务身份、权限或租户身份。不要直接将其作为授权依据。

### 5.3 推荐的事件分发模式

```python
  for part in graph.stream(
      inputs,
      stream_mode=["updates", "messages", "custom"],
      version="v2",
  ):
      if part["type"] == "updates":
          # 处理节点状态更新
          pass

      elif part["type"] == "messages":
          # 处理 LLM Token
          pass

      elif part["type"] == "custom":
          # 处理自定义进度
          pass
```

这实际上是一种典型的事件驱动编程模式：

```bash
  Event Producer
      ↓
  StreamPart
      ↓
  根据 type 分发
      ├── updates  → 状态更新处理器
      ├── messages → Token 处理器
      └── custom   → 进度处理器
```

## 六、七种 Stream Mode：能力与边界

| Mode        | 返回内容                         | 主要用途       |
| ----------- | -------------------------------- | -------------- |
| values      | 每个执行步骤后的完整 Graph State | 状态快照       |
| updates     | Node 返回的状态增量              | 追踪节点更新   |
| messages    | LLM Token + metadata             | 实时生成文本   |
| custom      | 开发者自定义数据                 | 进度、业务事件 |
| checkpoints | Checkpoint 事件                  | 持久化状态观察 |
| tasks       | Task 开始、结束、结果、异常      | 任务级监控     |
| debug       | 尽可能全面的运行时事件           | 深度调试       |

### 6.1 values vs updates

- updates：只输出变更
- values：输出完整 State

记忆方式：

- updates = 增量更新（Delta）
- values = 完整快照（Snapshot）

对于大型 State，values 可能产生更多数据传输与处理开销。

### 6.2 messages：LLM Token 流

```python
for part in graph.stream(
    inputs,
    stream_mode="messages",
    version="v2",
):
    if part["type"] == "messages":
        message_chunk, metadata = part["data"]

        if message_chunk.content:
            print(message_chunk.content, end="", flush=True)


```

这里返回的是：(message_chunk, metadata),而不是直接返回字符串。

- message_chunk：LLM 输出的消息片段，通常包含 Token 内容。
- metadata：辅助识别该输出来源的信息，例如：
  - metadata["langgraph_node"]
  - metadata["tags"]

1. 因此可以过滤特定 Node：

   ```python
   if metadata["langgraph_node"] == "answer_node":
     print(message_chunk.content, end="")
   ```

2. 也可以根据模型调用的 tags 过滤。

🔥 重要边界： messages 只负责流式暴露 LLM 消息，不负责自动将 Tool 调用、业务进度或任意 Python 函数输出转换为 Token。

### 6.3 custom：开发者自定义事件

```python
from langgraph.config import get_stream_writer

def my_node(state):  # 作为一个节点
    writer = get_stream_writer()

    writer({"status": "processing", "progress": 30})
    writer({"status": "processing", "progress": 60})
    writer({"status": "completed", "progress": 100})

    return {"result": "done"}
# -- 接收端： ----------------------------------------------
for part in graph.stream(
    inputs,
    stream_mode="custom",
    version="v2",
):
    if part["type"] == "custom":
        print(part["data"])
```

自主可控性： custom 不依赖特定模型厂商的流式接口。你可以将 OpenAI、Anthropic 或自建模型的输出统一包装为自定义事件。

### 6.4 checkpoints、tasks、debug

这三种模式偏向运行时观测与调试。

| 模式        | 观察对象                     | 依赖                   |
| ----------- | ---------------------------- | ---------------------- |
| checkpoints | Graph 状态保存事件           | Checkpointer           |
| tasks       | Node / Task 执行、结果、异常 | Checkpointer           |
| debug       | 更完整的执行过程与元数据     | 依具体事件及持久化配置 |

- 注意：
  1. checkpoints 并不是用来代替 get_state() 的全部能力，而是允许你在 Graph 执行期间接收 Checkpoint 事件。
  2. tasks 则让你能够观察任务执行生命周期。
  3. debug 会提供大量信息，但也意味着更高的日志量、数据量与敏感信息暴露风险。
     生产环境不应该无差别地向前端暴露全部 Debug 事件。

## 七、子图 Streaming：为什么需要 subgraphs=True？

默认情况下，父 Graph 的 Streaming 不一定会把子图内部事件全部暴露出来。需要显式开启：

```python
  for part in graph.stream(
      inputs,
      stream_mode="messages",
      subgraphs=True,
      version="v2",
  ):
      if part["type"] == "messages":
          message_chunk, metadata = part["data"]

          print(part["ns"])
          print(message_chunk.content)
```

ns（namespace）可以帮助判断事件来源。

| ns                        | 含义       |
| ------------------------- | ---------- |
| ()                        | 根 Graph   |
| ("agent_node:<task_id>",) | Agent 子图 |
| 更深层的 tuple            | 嵌套子图   |

❗注意： ns 是来源标识，不等于 Agent 的业务身份、权限或租户身份。不要直接将其作为授权依据。

## 八、过滤与控制：哪些内容可以被暴露？
