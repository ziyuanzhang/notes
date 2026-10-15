# langGraph

2中启动方式

## 第一中

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

## 第二种
