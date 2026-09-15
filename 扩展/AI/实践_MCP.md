# MCP: Model Context Protocol（模型上下文协议）

- MCP 体系主要由三部分组成:

1. MCP Host (主机/客户端): 发起请求的 AI 应用程序(例如:Claude Desktop 客户端、Cursor 编辑器)。
2. MCP Server (服务器): 拥有数据的“管家”。它连接着你的本地文件、数据库或 API，并把这些数据翻译成 MCP 协议懂的格式。
3. MCP Client (连接层): 维持 Host 和 Server 之间通信的桥梁(通常集成在 Host 内部)。

- 一句话总结: MCP 就是让 AI 连接万物的通用标准接口。
- MCP 的出现，标志着 A1 从“聊天机器人“向“全能助手(Agent)“进化的关键一步。

## MCP VS HTTP

- 什么时候获取Tools列表？

  MCP Client 通常在 连接/初始化阶段 发现 Tools，并缓存；运行过程中如果工具列表发生变化，再刷新，而不是每次调用工具前都重新获取。

- MCP Client 先从 MCP Server 获取可用 Tools 列表，然后把这些 Tool 的名称、描述、参数 Schema 等信息提供给 Agent/LLM；

  ❗MCP Client 负责“连接、发现、调用”；LLM/Agent 负责“理解、选择、决定”。

- 关键是区分这两个动作：
  1. ① MCP Client 获取工 `(MCP Client --> tools/list --> MCP Server --> 返回所有 Tools)`；
  2. ② Agent/LLM 选择工具 `( 用户需求 --> LLM --> 分析 Tool 的 name + description + input schema --> 选择 query_orders )`;
  3. 然后才是：MCP Client 调用工具 `(MCP Client --> tools/call --> query_orders --> MCP Server --> 返回结果)`;

- 建议：

  ```bash
    FastAPI
       │
       │ 启动
       ↓
    MCP Client Manager
       │
       ├── MCP Server A
       │      ↓
       │   tools/list
       │
       ├── MCP Server B
       │      ↓
       │   tools/list
       │
       └── MCP Server C
              ↓
           tools/list
                ↓
           缓存所有 Tools
                ↓
           LangGraph Agent
                ↓
            用户请求
                ↓
           LLM选择Tool
                ↓
           MCP Client
                ↓
            tools/call
  ```

  ❗“MCP Client 拿到 Tool 列表” ≠ “LLM 每次都把所有 Tool 列表原封不动塞进 Prompt”。

  ❗Agent 框架通常还会做 Tool 注册、筛选、绑定（bind tools） 等处理。这个正好是 MCP → LangGraph → LLM 三者连接起来的关键。

## FastMCP V2.0

- FastMCP 是一个基于 MCP 的开源项目，它提供了一套完整的 MCP 框架，用于构建 MCP 服务器。
- FastMCP 分 服务端 和 客户端

- FastMCP 服务器开发涉及三个核心组件:
  1. Resources(资源): 结构化数据，提供上下文信息
  2. Tools(工具): 可执行函数，允许模型执行操作
  3. Prompts(提示): 可重用的交互板

- 服务器开发的关键要素
  1. 类型安全的接口定义
  2. 自动化的文档生成
  3. 内置的错误处理机制
  4. 调试和测试工具

- 2 种传输方式：1、Streamable；2、Stdio；3、sse（已经废弃）

```python
  # server.py
  from fastmcp import FastMCP
  from starlette.responses import JSONResponse

  mcp = FastMCP("My MCP Server")

  # 工具
  @mcp.tool(name="greet") # 工具标识符(未提供，用函数名字)
  def greet(name: str) -> str:
      return f"Hello, {name}!"

  # 资源
  @mcp.resource("data://{id}{?format,id}") # uri是资源的唯一标识符（函数名字不是）
  def get_data(id: str, format: str = "json") -> str:
      """Retrieve data in specified format."""
      if format == "xml":
          return f"<data id='{id}' />"
      return f'{{"id": "{id}"}}'

  # 提示
  @mcp.prompt
  def ask_about_topic(topic: str) -> str:
      """生成询问主题解释的用户消息。"""
      return f"Can you please explain the concept of '{topic}'?"

  # 健康检查--http://localhost:8000/health
  @mcp.custom_route("/health", methods=["GET"])
  async def health_check(request):
      return JSONResponse({"status": "healthy", "service": "mcp-server"})

# 运行方式1：
  if __name__ == "__main__":
      mcp.run(transport="http", port=8000) # Streamable 方式
      mcp.run() # Stdio 方式


# 运行方式2：使用 FastMCP CLI 运行
fastmcp run my_server.py:mcp # Stdio 方式
fastmcp run my_server.py:mcp --transport http --port 8000 # Streamable 方式


```

```python
  # client.py
  import asyncio
  from fastmcp import Client

  client = Client("http://localhost:8000/mcp")

  # 工具调用
  async def call_tool(name: str):
      async with client:
          result = await client.call_tool("greet", {"name": name})
          print(result)

  # 资源调用
  async def get_resource(id: str):
      async with client:
          result = await client.get_resource("data://{id}", {"format": "xml", "id": id})
          print(result)

  # 提示调用
  async def get_prompt_topic(topic: str):
      async with client:
          result = await client.get_prompt("ask_about_topic",{"topic":"测试"})
          print(result)

  asyncio.run(call_tool("Ford"))
```

## 项目配置 fastmcp.json

```json
{
  "$schema": "https://gofastmcp.com/public/schemas/fastmcp.json/v1.json",
  "source": {
    // WHERE（何处）：您的服务器代码位置
    "type": "filesystem", // 可选，默认为 "filesystem"
    "path": "server.py",
    "entrypoint": "mcp"
  },
  "environment": {
    // WHAT（什么）：环境设置和依赖项
    "type": "uv", // 可选，默认为 "uv"
    "python": ">=3.10",
    "dependencies": ["pandas", "numpy"]
  },
  "deployment": {
    // HOW（如何）：运行时配置
    "transport": "stdio",
    "log_level": "INFO"
  }
}
```

## 部署

- 方式 1: 直接 HTTP 服务器

  ```python
    if __name__ == "__main__":
        mcp.run(transport="http", host="0.0.0.0", port=8000, path="/api/mcp/")

    python server.py # 启动 HTTP 服务器
  ```

- 方式 2：创建 ASGI 应用

  ```python
    app = mcp.http_app(path="/api/mcp/")

    uvicorn app:app --host 0.0.0.0 --port 8000  # 启动 ASGI 应用
  ```

- 访问： http://localhost:8000/api/mcp/
