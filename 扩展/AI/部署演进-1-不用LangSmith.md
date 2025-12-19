# langGraph-部署-不用 LangSmith

## 一、 什么时候「真的需要」LangSmith？

- 建议你 只在这几种情况才用：
  - Prompt / Tool 还在疯狂调试期
  - 团队里有 非工程背景（产品 / 标注）
  - 想快速做 Eval 而不写代码

❗LangSmith 是“教学 & 研发加速器”，不是“生产基础设施”

## 二、不用 LangSmith，你必须自己补的 5 件事

| 能力   | LangSmith 给的 | 不用 LangSmith 你怎么做  |
| ------ | -------------- | ------------------------ |
| Trace  | 调用链路       | 自己打 log / trace_id    |
| State  | 可视化         | 状态持久化（DB / Redis） |
| Replay | 一键重放       | Request + State 事件表   |
| Debug  | UI             | 日志 + Grafana           |
| Eval   | Dataset        | 离线脚本                 |

## 三、最小可运行部署（不依赖 LangSmith）

### 1️⃣ 目录结构（推荐）

```bash
app/
├── main.py                # FastAPI 入口
├── agent/
│   ├── graph.py           # LangGraph 定义
│   ├── nodes.py           # 各 Node
│   ├── state.py           # TypedDict / Pydantic State
│   └── runner.py          # graph.invoke
├── tools/
│   ├── search.py
│   └── db.py
├── observe/
│   ├── tracer.py          # 替代 LangSmith
│   └── logger.py
├── store/
│   ├── state_store.py     # Redis / DB
│   └── event_store.py     # Replay
└── config.py
```

### 2️⃣ LangGraph 本身 不依赖 LangSmith

```python
from langgraph.graph import StateGraph
from agent.state import AgentState
from agent.nodes import llm_node, tool_node

builder = StateGraph(AgentState)

builder.add_node("llm", llm_node)
builder.add_node("tool", tool_node)

builder.set_entry_point("llm")
builder.add_edge("llm", "tool")
builder.add_edge("tool", "llm")

graph = builder.compile()
```

⚠️ 这里完全没有 LangSmith 的代码

### 3️⃣ 运行时：你自己打 Trace（关键）

```python
import uuid
from observe.tracer import trace

def run_agent(input: str):
    trace_id = str(uuid.uuid4())

    with trace(trace_id, input):
        result = graph.invoke(
            {"input": input},
            config={
                "configurable": {
                    "trace_id": trace_id
                }
            }
        )

    return result
```

### 4️⃣ 自己实现一个「穷人版 LangSmith」

```python
# observe/tracer.py
from contextlib import contextmanager
import time
import logging

logger = logging.getLogger("agent")

@contextmanager
def trace(trace_id: str, input: str):
    start = time.time()
    logger.info(f"[START] {trace_id} input={input}")
    try:
        yield
    finally:
        cost = time.time() - start
        logger.info(f"[END] {trace_id} cost={cost:.2f}s")
```

这一步，是 80% LangSmith 的本质

## 四、生产级部署（替代 LangSmith 方案）

### 方案一（最常见）

```bash
FastAPI
  |
LangGraph
  |
Logging + TraceID
  |
ELK / Loki / Grafana
```

- 每个 request 一个 trace_id
- 每个 node / tool 打日志
- Grafana 看完整链路

### 方案二（正在走的高级路线）

```bash
Client
  |
Agent Gateway (FastAPI)
  |
Policy / Auth / Rate Limit
  |
LangGraph Runner
  |
Event Store（DB）
  |
Replay / Audit / Eval
```

前面说的：Audit + Replay

❗ 本质就是 自建 LangSmith（但更符合业务）
