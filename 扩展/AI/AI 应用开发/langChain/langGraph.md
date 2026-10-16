# langGraph

2中启动方式

## 方案 A：单服务

```bash
my-agent-project/
├── app/
│ └── main.py
└── pyproject.toml
```

```python
from fastapi import FastAPI
from deepagents import create_deep_agent

app = FastAPI()

# 在应用启动时创建 Agent
agent = create_deep_agent(
    model="你的模型配置",
)

@app.post("/chat")
async def chat(message: str):
    result = await agent.ainvoke({
        "messages": [
            {"role": "user", "content": message}
        ]
    })

    return result
```

启动：`uv run uvicorn app.main:app --port 8000`

## 方案 B：双服务

前端 → FastAPI → LangGraph API → Agent

```bash
┌────────────────────────────┐
│         用户 / 前端         │
└──────────────┬─────────────┘
               │ POST /chat
               ▼
┌────────────────────────────┐
│ 服务一：FastAPI             │
│ 端口：8000                  │
│                            │
│ 接收问题                    │
│ 调用 LangGraph SDK         │
│ 返回回答                    │
└──────────────┬─────────────┘
               │ HTTP API
               ▼
┌────────────────────────────┐
│ 服务二：LangGraph API       │
│ 本地开发端口：2024           │
│                            │
│ 读取 langgraph.json         │
│ 找到 assistant / graph      │
│ 创建 Run 并执行 Graph        │
└──────────────┬─────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Agent Graph                  │
│ 接收问题 → 调用 LLM → 返回回答  │
└──────────────────────────────┘
```

```bash
agent-demo/
├── pyproject.toml
├── uv.lock
├── .env
├── langgraph.json # 自己写
├── src/
│   └── agent/
│       └── graph.py       # Agent 的执行逻辑
└── api/
    └── main.py            # FastAPI 业务接口
```

```python
# ======= 编写 langgraph.json ================
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "env": ".env"
}
# ===== 编写 Agent: src/agent/graph.py ============
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph

model = ChatOpenAI(model="gpt-4.1-mini")

def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

builder = StateGraph(MessagesState)
builder.add_node("call_model", call_model)

builder.add_edge(START, "call_model")
builder.add_edge("call_model", END)

graph = builder.compile()

# ======= 编写 FastAPI：api/main.py ==========================
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langgraph_sdk import get_client

app = FastAPI(title="Agent Business API")

# 连接独立运行的 LangGraph API 服务
client = get_client(url="http://127.0.0.1:2024")


class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None


@app.post("/chat")
async def chat(request: ChatRequest):
    # 没有 thread_id，就创建一个新对话线程
    thread_id = request.thread_id

    if thread_id is None:
        thread = await client.threads.create()
        thread_id = thread["thread_id"]

    # 请求 LangGraph API 执行名为 agent 的 Graph
    result = await client.runs.wait(
        thread_id=thread_id,
        assistant_id="agent",
        input={
            "messages": [
                {"role": "human", "content": request.message}
            ]
        },
    )

    # 提取最后一条 AI 消息
    messages = result.get("messages", [])
    if not messages:
        raise HTTPException(
            status_code=502,
            detail="Agent 没有返回消息",
        )

    answer = messages[-1].get("content", "")

    return {
        "thread_id": thread_id,
        "answer": answer,
    }
# ================= 启动 LangGraph API=================
cd agent-demo
uv run langgraph dev
# 默认监听 127.0.0.1:2024。首次启动时注意查看日志，确认 Graph 加载成功。
# ================= 启动 FastAPI =================
cd agent-demo
uv run uvicorn api.main:app --reload --port 8000
# FastAPI 监听 8000 端口。这里的 --reload 仅用于开发调试。
```
