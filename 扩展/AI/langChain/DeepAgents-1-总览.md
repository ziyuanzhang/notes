# Deep Agents（深度代理 -- 任务执行深度更深）

Deep Agents = 基于 LangChain 能力 + LangGraph Runtime，预先帮你组装好一套“适合复杂长期任务”的 Agent Harness（智能体运行框架/脚手架）。

Deep Agents 是一个独立的 deepagents Python 库，建立在 LangChain 的核心构建块之上，并使用 LangGraph 作为 Runtime。

```bash
                         你的业务 Agent
                              │
                              ▼
                    ┌──────────────────┐
                    │   Deep Agents    │
                    │   Agent Harness  │
                    │                  │
                    │ 文件系统          │
                    │ Memory           │
                    │ Skills           │
                    │ Subagents        │
                    │ Context 管理      │
                    │ Human-in-the-loop │
                    │ Task Planning    │
                    └────────┬─────────┘
                             │
                     基于 LangChain
                             │
                             ▼
                    ┌──────────────────┐
                    │    LangChain     │
                    │ Agent Building   │
                    │ Blocks / Tools   │
                    │ Models / MCP     │
                    └────────┬─────────┘
                             │
                     使用 LangGraph Runtime
                             │
                             ▼
                    ┌──────────────────┐
                    │    LangGraph     │
                    │ Durable Runtime  │
                    │ State / Resume   │
                    │ Streaming        │
                    │ HITL / 执行       │
                    └──────────────────┘
```

LangGraph = 怎么可靠地运行 Agent
LangChain = Agent 的各种零部件
Deep Agents = 把复杂 Agent 常用能力组装好的“高级 Agent Harness”

## Deep Agents 的重点不是“让 Agent 会调用工具”，而是让 Agent 能够长期、复杂、多步骤地完成任务。

## Deep Agents 的四大核心能力

```bash
                     Deep Agents
                          │
       ┌──────────────────┼──────────────────┐
       ↓                  ↓                  ↓
    Execution            Context            Delegation
    执行环境              上下文管理            委派
       │                  │                  │
    Tools               Skills              Planning
    Filesystem          Memory              Subagents
    Code(执行代码)       Summarization(摘要)
    HITL                Offloading(上下文卸载)
```

- 另外还有 Steering：
  1. Human-in-the-loop
  2. Permissions

### ① Execution Environment：Agent 真正“干活”

- 普通 Agent： LLM --> 调用几个 API
- Deep Agents：

  ```bash
                    Agent
                      │
          ┌───────────┼────────────┐
          ↓           ↓            ↓
        Tools      Filesystem     Code
          │           │            │
       API/DB       read/write    execute
  ```

- 也就是说 Agent 可以：
  - 调 API
  - 查数据库
  - 读文件
  - 写文件
  - 修改文件
  - 搜索文件
  - 执行代码
  - 执行 shell
  - 使用 MCP

    这就已经很接近：Coding Agent / Research Agent（研究型 Agent）/ Data Agent ,而不仅仅是聊天机器人。

### ② Virtual Filesystem：这是 Deep Agents 很关键的设计

虚拟文件系统: Agent 不需要把所有东西都塞进：LLM Context，而可以：

```bash
        LLM Context
             │
   当前真正需要的信息
             │
             ▼
     ┌──────────────┐
     │ Virtual FS   │
     ├──────────────┤
     │ research.md  │
     │ result.json  │
     │ code.py      │
     │ report.md    │
     └──────────────┘
```

这就是：Context Offloading（上下文卸载）

- 文件系统实际上成为 Agent 的“外部工作记忆”。

### ③ Skills：不要把所有知识塞进 System Prompt

```bash
    skills/
    ├── python/
    │   └── SKILL.md
    ├── react-native/
    │   └── SKILL.md
    ├── fastapi/
    │   └── SKILL.md
    ├── postgresql/
    │   └── SKILL.md
    └── security/
        └── SKILL.md
```

- Agent 启动时：只读取 Skill 的基本信息
- 真正需要时： 需要 FastAPI --> 加载 fastapi/SKILL.md

这叫：Progressive Disclosure（渐进式披露）

### ④ Memory：长期记忆

Deep Agents 使用： AGENTS.md 作为一种 Memory 载体。

例如：

```bash
    project/
    ├── AGENTS.md
    ├── src/
    ├── tests/
    └── docs/
```

Agent 每次进入项目，都可以知道：

- 这个项目：
  - 使用什么技术栈
  - 编码规范
  - 项目约定
  - 架构规则

所以它不是：Conversation Memory 这么简单。

而更像：项目级 Agent Instructions / Long-term Context

### Skills 和 Memory 不一样

Skills: 我应该怎么做某类事情(步骤)？
Memory: 这个项目/这个用户长期有什么规则（规则）？

Skill = 能力/方法
Memory = 长期规则/偏好/上下文

### ⑤ Context Management：Deep Agents 真正的“深”在哪里

```bash
Input Context: System Prompt + Memory + Skills + Tools
      ↓
Compression(压缩): 历史信息 → Summarization → 压缩 → 保留重要信息
      ↓
Isolation(隔离): 这是 Subagent 的核心, 每个 Subagent：自己的 Context, 而不是全部污染 Main Agent。
      ↓
Long-term Memory
```

### ⑥ Subagents：这是 Deep Agents 的另一大特色

每个 Subagent 有自己的 Context。 而且它只把最终结果返回给 Main Agent。

### ⑦ Task Planning：Todo(待办事项 / 任务清单) -- 【可选】

Planning 并不是 Deep Agents 的核心强制能力。

### ⑧ Human-in-the-loop

底层依赖：LangGraph interrupt / durable execution

### ⑨ MCP：Deep Agents 和你之前学的 MCP 完全可以接起来

### ⑩ Code Execution

Deep Agents 支持两种：

- Sandbox = 真正操作环境: execute --> shell --> Python / CLI / tests / dependencies
- Interpreter = 轻量计算环境: eval --> JavaScript
  - 它不是完整 Shell。

## Deep Agents 🆚 普通 LangChain Agent

| 能力               | 普通 LangChain Agent | Deep Agents   |
| ------------------ | -------------------- | ------------- |
| LLM                | ✅                   | ✅            |
| Tool Calling       | ✅                   | ✅            |
| MCP                | ✅                   | ✅            |
| Agent Loop         | ✅                   | ✅            |
| LangGraph Runtime  | 可使用               | 内置          |
| 文件系统           | 自己做               | **内置**      |
| Memory             | 自己设计             | **内置机制**  |
| Skills             | 自己设计             | **内置**      |
| Context Offloading | 自己做               | **内置**      |
| Summarization      | 自己做               | **内置**      |
| Subagents          | 自己设计             | **内置 task** |
| HITL               | 自己设计/组合        | **内置支持**  |
| Permissions        | 自己做               | **内置**      |
| Planning           | Middleware           | 可选          |
| Code Execution     | 自己接               | 支持          |

Deep Agents 不是“更强的 LLM”，而是“更多 Agent 基础设施已经替你组装好了”。

### Deep Agents 🆚 LangChain

LangChain = 零部件 / Framework
Deep Agents = 用这些零部件组装好的高级 Agent Harness

LangChain ≈ Spring Framework 提供大量基础能力
Deep Agents ≈ 基于这些能力提供一套更完整的 Agent 应用骨架

### Deep Agents 🆚 LangGraph

- LangGraph: 固定流程;流程可控、节点明确、状态明确。
- Deep Agents: 如果你的需求是：“去完成这个任务”, 而不是：“严格按照这个流程执行” 那么 Deep Agents 更合适。

LangGraph: 我告诉 Agent 怎么走;
Deep Agents: 我给 Agent 一个复杂任务，Agent 自己决定怎么完成;

###

- LangGraph: Runtime / Workflow Engine

  解决：Agent 怎么可靠运行？

- LangChain: Agent Building Blocks

  解决：Model / Tool / Middleware / MCP 怎么组合？

- Deep Agents: Agent Harness

  解决：
  - 复杂 Agent 需要的文件系统、
  - Memory、Skills、Subagent、
  - Context 管理、HITL 等能力，
  - 不想自己一个个搭怎么办？

- MCP: Tool/Context 的标准连接协议

  解决：Agent 怎么标准化连接外部工具和数据？

- RAGFlow: RAG / Knowledge Base 平台

  解决：企业知识怎么解析、索引、检索、召回？

最终就是：

```bash
                  ┌──────────────┐
                  │   Your App   │
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
         Deep Agents              RAGFlow
              │
       ┌──────┴───────┐
       ↓              ↓
   LangChain       LangGraph
       │              │
       └──────┬───────┘
              ↓
             MCP
              │
       ┌──────┼────────┐
       ↓      ↓        ↓
      API     DB      Tools
```

🔥 LangGraph 是“运行时”，LangChain 是“零部件”，Deep Agents 是“把复杂 Agent 所需的零部件和运行能力预先组装好的 Harness”。

## 生态关系图

```bash
                 Application
                      │
                      ▼
             ┌────────────────┐
             │  Deep Agents   │
             │ Agent Harness  │
             └───────┬────────┘
                     │
             LangChain Building
                  Blocks
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
    Model          Tools           MCP
      │              │              │
      └──────────────┼──────────────┘
                     ↓
               LangGraph Runtime
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
   Durable        Streaming        HITL
   Execution                       State
```

然后旁边还有:

```bash
              Deep Agents Harness
                     │
       ┌─────────────┼──────────────┐
       ↓             ↓              ↓
   Filesystem      Memory         Skills
       │             │              │
       └─────────────┼──────────────┘
                     ↓
              Context Management
                     │
             ┌───────┴───────┐
             ↓               ↓
        Summarization    Offloading

                     +

             Delegation
             ┌───────┴───────┐
             ↓               ↓
          Planning       Subagents
```

##

```bash
                    AI Application
                         │
                         ▼
                   FastAPI Backend
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
           Agent                  RAG
              │                     │
              ↓                     ↓
         Deep Agents             RAGFlow
              │
       ┌──────┴───────┐
       ↓              ↓
   LangChain       LangGraph
       │              │
       └──────┬───────┘
              ↓
             MCP
```

```bash
             User
              │
              ▼
        Deep Agent
              │
     ┌────────┼─────────┐
     ↓        ↓         ↓
 Filesystem  Skills   Memory
     │
     ├── grep
     ├── read_file
     ├── edit_file
     └── execute
              │
              ▼
          Subagents
        ┌─────┼─────┐
        ↓     ↓     ↓
      Auth   RBAC  Redis
        │     │     │
        └─────┼─────┘
              ↓
           Summary
              ↓
        Human Approval
              ↓
          Modify Code
              ↓
            pytest
```

Deep Agents / LangChain / LangGraph / MCP / Tool Calling / Context Engineering / HITL / Subagents 基本就串起来了。
