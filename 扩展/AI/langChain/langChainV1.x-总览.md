# langChain-V1.x - 总览

- LangChain = 零件/高层 Agent 框架
- LangGraph = Agent 的流程引擎/运行时
- Deep Agents = 在 LangGraph 之上封装好的“高级 Agent Harness（智能体运行套件）”
- Managed Deep Agents = 把 Deep Agents 托管到 LangSmith 云上运行
- LangSmith = 观测、评估、调试、部署平台，不是 Agent 框架本身

## 流程图

| 东西            | 主要负责                                                   |
| --------------- | ---------------------------------------------------------- |
| **LangGraph**   | Agent 怎么运行、状态、流程、暂停/恢复                      |
| **LangChain**   | Model、Tool、Prompt、Middleware、Agent 等开发组件          |
| **Deep Agents** | Planning、Todo、Files、Subagents、Skills 等高级 Agent 能力 |
| **MCP**         | Agent 如何标准化连接外部工具/数据                          |
| **RAGFlow**     | 文档解析、知识库、RAG                                      |
| **FastAPI**     | 对外提供你的业务 API                                       |
| **Redis**       | Cache、Session、Queue、State 等                            |
| **PostgreSQL**  | 业务数据、审计、持久化等                                   |

```bash
                         ┌──────────────────────────┐
                         │       LangSmith          │
                         │  Observability / Eval    │
                         │  Debug / Deploy / Trace  │
                         └────────────┬─────────────┘
                                      │
                       托管 / 观测 / 部署
                                      │
                    ┌─────────────────▼─────────────────┐
                    │       Managed Deep Agents         │
                    │                                   │
                    │ LangSmith 托管的 Deep Agent Runtime│
                    └─────────────────┬─────────────────┘
                                      │
                               基于 Deep Agents
                                      │
        ┌─────────────────────────────────────────────────────────────────────┐
        │                         Deep Agents                                 │
        │                    高级 Agent Harness                                │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │  Planning   │   │   Todo      │   │   Context Management   │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │    Files    │   │  Subagents  │   │       Skills           │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐                                 │
        │   │    Tools    │   │   Memory    │                                 │
        │   └─────────────┘   └─────────────┘                                 │
        │                                                                     │
        │              ↓ 使用 LangChain 核心组件                                │
        │              ↓ 使用 LangGraph Runtime                                │
        └──────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────────────┐
        │                         LangChain                                   │
        │                  LLM 应用 / Agent 高层组件                            │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │    Model    │   │    Tools    │   │       Middleware       │    │
        │   │             │   │             │   │                        │    │
        │   │ OpenAI      │   │ Search      │   │ before_model           │    │
        │   │ Anthropic   │   │ DB          │   │ after_model            │    │
        │   │ Qwen        │   │ HTTP API    │   │ before_tool            │    │
        │   │ DeepSeek    │   │ Calculator  │   │ after_tool             │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │   Prompt    │   │   Messages  │   │   Structured Output    │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │     RAG     │   │ Retriever   │   │       Agent            │    │
        │   │             │   │ VectorStore │   │     create_agent()     │    │
        │   └─────────────┘   └─────────────┘   └───────────────┬────────┘    │
        │                                                       │             │
        └───────────────────────────────────────────────────────┼─────────────┘
                                                                │
                                                                ▼
        ┌─────────────────────────────────────────────────────────────────────┐
        │                         LangGraph                                   │
        │                 Agent Runtime / Orchestration                       │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │    State    │   │    Nodes    │   │        Edges           │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │ Conditional │   │   Loops     │   │     Checkpoints        │    │
        │   │    Edges    │   │             │   │     Persistence        │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────────────┐    │
        │   │    HITL     │   │  Streaming  │   │ Durable Execution      │    │
        │   └─────────────┘   └─────────────┘   └────────────────────────┘    │
        │                                                                     │
        └─────────────────────────────────────────────────────────────────────┘


# --- 更准确是： ----------------
LangChain
  ├── Model
  ├── Tools
  ├── Prompt
  ├── Messages
  ├── RAG
  ├── Middleware
  │
  └── Agent
        │
        ↓
    LangGraph Runtime


Deep Agents
  ├── Planning
  ├── Todo
  ├── Files
  ├── Skills
  ├── Subagents
  ├── Context Management
  │
  ├── LangChain building blocks
  │
  └── LangGraph Runtime
```

### 1. LangGraph 的零部件

- LangGraph 最核心的东西其实就是：

  ```bash
                      LangGraph
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
        State           Node           Edge
          │              │              │
     保存运行状态      执行逻辑       控制流程
                         │
                         ↓
                ┌────────────────┐
                │ Conditional    │
                │ Edge           │
                └────────────────┘
  ```

- 例如一个 Agent：

  ```bash
     START
       │
       ▼
     ┌──────────────┐
     │    Agent     │ ← Node
     └──────┬───────┘
            │
            ▼
        是否调用 Tool？ ← Conditional Edge
           /    \
         Yes     No
          │       │
          ▼       ▼
       Tool      END
        Node
          │
          └──────→ Agent
  ```

### 2. LangChain 的零部件

```bash
                         LangChain
                            │
       ┌──────────┬─────────┼──────────┬──────────┐
       ↓          ↓         ↓          ↓          ↓
     Model      Tools     Prompt     Messages   RAG
       │          │         │          │          │
       ↓          ↓         ↓          ↓          ↓
    LLM/API     外部能力   指令模板    对话消息     检索
       │
       └────────────────┬────────────────────────┐
                        ↓                        ↓
                  Structured Output         Middleware
                        │                        │
                        └───────────┬────────────┘
                                    ↓
                                  Agent
```

例如：User --> Prompt --> Model --> Tool --> Tool Result --> Model --> Structured Output

这些零件组合起来以后，才形成一个 Agent。

### 3. LangChain Agent 的零部件

LangChain Agent 的零部件

```bash
                    LangChain Agent
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
      Model             Tools          Middleware
        │                 │                 │
        │          ┌──────┼──────┐          │
        │          ↓      ↓      ↓          │
        │        Search   DB    MCP         │
        │                                    │
        └──────────────┬─────────────────────┘
                       ↓
                  Agent Loop
                       │
              ┌────────┴────────┐
              ↓                 ↓
          调用 Tool           直接回答
              │
              ↓
           Tool Result
              │
              ↓
             Model
              │
              └──────→ ...
```

这里的 Agent Loop，现在底层使用 LangGraph Runtime。所以：

```bash
LangChain Agent
      │
      ├── Model
      ├── Tools
      ├── Middleware
      ├── Prompt
      └── ...
              │
              ↓
         LangGraph Runtime
```

LangGraph → LangChain Agent → Deep Agents : 其他的 Model、Tool、Middleware、RAG、Structured Output 等，是围绕 Agent 的“零件”。

### 4. Deep Agents 的零部件

Deep Agents 就是在普通 Agent 的基础上增加了一大堆“高级能力”。
Deep Agents 是“基于 LangChain 的组件 + 基于 LangGraph 的运行时”，不是简单地“跳过 LangChain，直接构建在 LangGraph 上”。

普通 Agent：User --> Agent --> Model --> Tool --> Model --> Answer
Deep Agent：

```bash
                         Deep Agent
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
     Planning              Todo                Context
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ↓
                         Agent Loop
                             │
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
          Tools            Files           Subagents
            │                │                │
            ↓                ↓                ↓
         Search          write/read       子 Agent
                             │
                             ↓
                           Skills
                             │
                             ↓
                          Memory
```

因此 Deep Agent 特别适合：
“给 Agent 一个复杂任务，让它自己规划、拆任务、调用工具、管理上下文、委派子 Agent，然后最终完成任务。”

### 5. 结合 MCP

MCP 并不是 LangGraph 的零部件，也不是 LangChain 的核心零部件。

```bash
                         FastAPI
                            │
                            ↓
                      Agent Service
                            │
                  ┌─────────┴─────────┐
                  ↓                   ↓
              LangChain          Deep Agents
                  │                   │
                  └─────────┬─────────┘
                            ↓
                       LangGraph
                         Runtime
                            │
               ┌────────────┼────────────┐
               ↓            ↓            ↓
             Tools         MCP          RAG
               │            │            │
               ↓            ↓            ↓
             HTTP       MCP Server    RAGFlow
                            │
                            ↓
                         Redis
                       PostgreSQL
```

### 6. 总结

- 企业级 Agent, LangGraph 反而非常重要

  ```bash
                      用户
                       │
                       ↓
                    FastAPI
                       │
                       ↓
                Authentication
                       │
                       ↓
                      RBAC
                       │
                       ↓
                   AI Gateway (AI网关)
                       │
                       ↓
                  ┌──────────┐
                  │ LangGraph│
                  └────┬─────┘
                       │
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
     RAG Agent     Tool Agent    Research Agent
         │             │             │
      RAGFlow         MCP           Web
         │             │             │
         └─────────────┼─────────────┘
                       ↓
                      HITL
                       ↓
                     Audit
                       ↓
                   PostgreSQL
                       │
                       ↓
                   Evaluation
  ```

  这种系统：LangGraph 非常适合。

- Deep Agents 更适合另外一种场景
  例如：“给我一个研究员 Agent。” 然后你希望它自己：

  ```bash
    计划
     ↓
    搜索
     ↓
    阅读
     ↓
    整理
     ↓
    写文件
     ↓
    调用 subagent
     ↓
    继续搜索
     ↓
    总结
     ↓
    生成报告
  ```

  这时候：Deep Agents 会比你自己从 LangGraph 0 开始造一个完整 Agent Harness 快很多。

## 学习路径

FastAPI + LangGraph + RAGFlow + FastMCP + Redis + PostgreSQL + JWT + RBAC + HITL + AI Gateway + Audit + Replay + Eval

1. 第一阶段 LangChain --> 理解 Agent 基础
2. 第二阶段LangGraph --> 真正理解 Agent Runtime
3. 第三阶段Deep Agents --> 理解高级 Agent Harness
4. 第四阶段自己部署 Deep Agents --> FastAPI + Docker + Redis + PostgreSQL
5. 第五阶段LangSmith --> 理解 Observability / Eval / Deployment
6. 第六阶段Managed Deep Agents --> 理解托管 Agent 基础设施
