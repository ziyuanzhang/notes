# LangGraph + FastAPI == 完整可运行 Demo（100% 不依赖 LangSmith）

这是生产可演进的最小闭环版本，不是玩具示例。

## 一、整体架构（你现在这个阶段最正确）

```bash
Client
  |
FastAPI  (Agent Gateway)
  |
trace_id / config
  |
LangGraph
  |
Node (LLM / Tool)
  |
State
```

## 二、项目结构（强烈建议按这个来）

```bash
app/
├── main.py                 # FastAPI 入口
├── agent/
│   ├── graph.py            # LangGraph 定义
│   ├── nodes.py            # LLM / Tool Node
│   ├── state.py            # AgentState
│   └── runner.py           # graph.invoke
├── tools/
│   └── calculator.py       # 示例 Tool
├── observe/
│   └── tracer.py           # 无 LangSmith Trace
└── config.py

```

## 三、Agent State（LangGraph 核心）

```python
# app/agent/state.py
from typing import TypedDict, List
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: List[BaseMessage]
    trace_id: str
```

## 四、Tool（示例）

```python
# app/tools/calculator.py
def add(a: int, b: int) -> int:
    return a + b
```

## 五、Nodes（LLM + Tool）

```python
# app/agent/nodes.py
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from tools.calculator import add

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def llm_node(state):
    messages = state["messages"]
    response = llm.invoke(messages)
    return {
        "messages": messages + [response]
    }

def tool_node(state):
    messages = state["messages"]
    last = messages[-1]

    # demo：简单硬编码 tool 调用
    if "add" in last.content:
        result = add(1, 2)
        return {
            "messages": messages + [
                AIMessage(content=f"Tool result: {result}")
            ]
        }

    return state
```

⚠️ 注意：

- 这里是 显式 Tool Node，不是 LangChain Agent 黑箱
- → 这是能做 Audit / Replay 的关键

## 六、LangGraph 定义（核心）

```python
# app/agent/graph.py
from langgraph.graph import StateGraph, END
from agent.state import AgentState
from agent.nodes import llm_node, tool_node

builder = StateGraph(AgentState)

builder.add_node("llm", llm_node)
builder.add_node("tool", tool_node)

builder.set_entry_point("llm")

builder.add_edge("llm", "tool")
builder.add_edge("tool", END)

graph = builder.compile()
```

### 七、Trace（替代 LangSmith 的关键）

```python
# app/observe/tracer.py
import logging
import time
from contextlib import contextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent")

@contextmanager
def trace(trace_id: str):
    start = time.time()
    logger.info(f"[TRACE START] {trace_id}")
    try:
        yield
    finally:
        cost = time.time() - start
        logger.info(f"[TRACE END] {trace_id} cost={cost:.2f}s")
```

## 八、Runner（LangGraph 调用入口）

```python
# app/agent/runner.py
from langchain_core.messages import HumanMessage
from agent.graph import graph
from observe.tracer import trace

def run_agent(input_text: str, trace_id: str):
    with trace(trace_id):
        result = graph.invoke({
            "messages": [HumanMessage(content=input_text)],
            "trace_id": trace_id
        })

    return result
```

## 九、FastAPI（Agent Gateway）

```python
# app/main.py
import uuid
from fastapi import FastAPI
from pydantic import BaseModel
from agent.runner import run_agent

app = FastAPI()

class ChatRequest(BaseModel):
    input: str

@app.post("/chat")
def chat(req: ChatRequest):
    trace_id = str(uuid.uuid4())
    result = run_agent(req.input, trace_id)

    return {
        "trace_id": trace_id,
        "output": result["messages"][-1].content
    }
```

## 十、运行 & 测试

```bash
uvicorn app.main:app --reload
```

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "please add numbers"}'
```

日志里会看到：

```bash
[TRACE START] 8c1c...
[TRACE END] 8c1c... cost=0.82s
```

## 十一、这套 Demo 已经具备什么能力？

- ✅ LangGraph 正确使用方式
- ✅ 无 LangSmith
- ✅ Trace ID 贯穿
- ✅ Node / Tool 显式
- ✅ 可插 DB / Redis
- ✅ 可 Replay（下一步）

## 十二、你下一步 100% 正确的演进路线

按顺序来：

- 1️⃣ trace_id + node_name → Event 表
- 2️⃣ State 每步持久化
- 3️⃣ Replay：用历史 event 重跑 graph
- 4️⃣ Policy / Auth 移到 Gateway
- 5️⃣ Tool 换成 MCP

到这一步，你就已经 完全不需要 LangSmith 了，而且比它强

- Event / Trace 表结构（SQL 版）
- Replay 一条历史请求的完整代码
- LangGraph + MCP Tool 的真实接入

1️⃣ Event 记录中间件（Python 代码版）
2️⃣ Replay 一个 trace 的完整 Runner
3️⃣ Grafana / SQL 看完整 Agent 执行流示例
4️⃣ 这套表结构 vs LangSmith 内部模型对照

---

1️⃣ EventStore 的 PostgreSQL 实现
2️⃣ Replay Runner（从 event 重建执行）
3️⃣ State Snapshot 策略（只存关键节点）
4️⃣ Grafana SQL 面板
一个完整的 ：LangGraph+ragflow+fastMCP + FastAPI（不用 langSmith） 可生产部署的工程
