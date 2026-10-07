# DeepAgents-4.1-执行环境-工具

Deep Agents = LLM + Agent Runtime + 一堆可调用 Tool。

- Tool分三部分:
  1. Custom Tools: 你自己写工具
  2. MCP Tools: 工具来自外部 MCP Server
  3. Built-in Harness Tools: Deep Agents 自带工具
     - ① 文件系统
     - ② Shell: 执行 Shell 命令(仅沙盒环境)。

❗Custom Tools: 一个特别重要的点：Deep Agents 自动推断 Tool Schema

不是 LLM 调用工具，而是 Agent Runtime 根据 LLM 的 Tool Call 去执行工具。

MCP 本质上是一个标准化的 Tool 接入协议。工具和agent解耦。

## list_tools() 是“发现工具”,不是执行

```bash
@mcp.tool()
      ↓
注册到 MCP Server
      ↓
Server 暴露 Tool
      ↓
Client list_tools()
      ↓
获取 Tool 定义 # 包含 Tool 的名字、描述、参数 Schema
```

list_tools() 本身不是扫描 Python 代码。

@tool：注册工具 → list_tools()：发现工具 → call_tool()：执行工具。

## Harness Tools 是 Deep Agents 为 Agent 提供的“执行能力”

```bash
                         Deep Agent
                              │
                        Agent Runtime
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
      Model                 Tools                  State
     思考/决策               执行能力
                              │
          ┌───────────────────┼───────────────────────────┐
          │                   │                           │
          ▼                   ▼                           ▼
       Custom Tools       MCP Tools                    Harness Tools
         业务函数          外部服务生态                    Agent自身能力
                                                          │
                                     ┌────────────────────┼───────────────┐
                                     ▼                    ▼               ▼
                                Filesystem             Shell           Subagent
                                ls/read/write/...      execute          task
```

## Multimodal Tool Outputs：工具不一定只能返回字符串
