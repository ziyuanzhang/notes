# DeepAgents-9-前端可视化概览

Deep Agents 的前端可视化：如何把 Agent 内部的任务规划、子智能体执行、工具调用和最终结果，实时展示在前端界面上。

## 一、先建立整体架构

### 1.1 Deep Agents 前后端完整关系

```bash
                    用户
                     │
                     ▼
          ┌──────────────────────┐
          │    React 前端 UI     │
          │                      │
          │  聊天消息 / 任务列表  │
          │  子 Agent 进度        │
          │  文件浏览 / 代码查看  │
          └──────────┬───────────┘
                     │
                     │ useStream()
                     ▼
          ┌──────────────────────┐
          │ LangGraph API Server │
          │                      │
          │  Stream / State      │
          │  运行状态 / 中断恢复   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │    Deep Agent        │
          │                      │
          │  create_deep_agent() │
          │          │           │
          │          ▼           │
          │      Coordinator     │
          │       主 Agent       │
          │          │           │
          │      ┌───┴───┐       │
          │      ▼       ▼       │
          │  Research  Coder     │
          │  子 Agent   子 Agent  │
          └──────────────────────┘
```

- 这里有三个关键点：
  1. Deep Agent 负责执行任务：规划、委派、调用工具、汇总结果。
  2. LangGraph API Server 负责提供运行接口和流式数据：让前端可以连接 Agent、接收状态更新。
  3. React 前端负责展示运行过程：把流式消息、子 Agent、任务列表和工具结果变成用户看得懂的 UI。

  注意：useStream() 不是 Agent 的执行引擎，而是前端 SDK 提供的流式交互接口。文档示例中的 apiUrl: "http://localhost:2024" 指向 LangGraph API Server，而不是直接指向普通的 FastAPI 路由。

### 1.2 这一篇和之前学的内容如何衔接？

之前学习的内容 本篇对应的前端能力

| create_deep_agent() | 创建后端 Agent                  |
| ------------------- | ------------------------------- |
| Subagents           | 展示不同子 Agent 的执行状态     |
| Todo / 任务规划     | 展示实时任务清单                |
| State / Runtime     | 向前端暴露需要展示的状态        |
| Tools / Middleware  | 展示工具调用过程和结果          |
| HITL                | 展示审批、等待输入等交互        |
| Backend / 文件系统  | 展示文件、代码、修改差异        |
| LangGraph API       | 通过 useStream() 连接后端运行时 |

后端有某种能力，不代表前端会自动出现对应界面。

## 二、 useStream()：前端如何接收数据？

```bash
后端 Agent
    │
    │ 写入 / 更新 State
    ▼
LangGraph Runtime
    │
    │ 通过流式更新暴露状态
    ▼
前端 useStream()
    │
    ▼
stream.values.todos
    │
    ▼
React Todo 组件
```

```python
import { useStream } from "@langchain/react";

function App() {
  const stream = useStream<typeof agent>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
  });

  # Deep Agent 的额外状态
  const todos = stream.values?.todos;
  const subagents = [...stream.subagents.values()];
}
```

| 代码             | 含义                                       |
| ---------------- | ------------------------------------------ |
| useStream()      | 建立前端与 Agent 运行服务之间的流式交互    |
| apiUrl           | 后端 LangGraph API Server 的地址           |
| assistantId      | 要调用的已配置 Assistant 标识              |
| stream.values    | 当前可访问的 Agent 状态值                  |
| stream.subagents | 前端 SDK 暴露的子 Agent 发现信息与相关状态 |

- ① stream.messages：聊天消息

  用于展示主 Agent 的对话内容和最终综合回答。
  主 Agent 的消息可以持续流式更新，而不必等所有工作结束后才一次性显示。

- ② stream.subagents：子 Agent 信息
- ③ stream.values：自定义状态

## 三、SDK 暴露了哪些数据？

1. stream.messages: 主 Agent 对话与最终回答

   用于聊天记录、Markdown 渲染、流式文字展示。

2. stream.subagents: 子 Agent 发现信息与状态

   用于展示委派关系、执行进度和各个子 Agent 的独立视图。

3. stream.values: Agent State 的可访问投影

   用于 Todo、计划、报告章节、沙箱元数据等自定义状态。

4. Tool-call state: 工具调用的过程与结果

   可以将搜索、文件操作、浏览器操作等渲染成带有进度和结果的卡片。

5. Interrupts: 中断、等待审批或补充信息

   用于实现人工审核按钮、确认对话框，以及恢复被中断的执行。

## 四、Patterns：三种典型的前端实现模式

### 4.1 Subagent streaming：子 Agent 流式展示

目标：让用户看到各个子 Agent 的输出与进度。

```bash
主 Agent
   │
   ├── Researcher
   │      ├── 当前状态
   │      ├── 流式输出
   │      └── 执行结果
   │
   └── Coder
          ├── 当前状态
          ├── 流式输出
          └── 执行结果
```

useMessages(stream, subagent): 用来针对特定子 Agent 选择消息，而不是把所有消息混在主 Agent 的对话里。

### 4.2 Todo list：实时任务清单

目标：把 Agent 的任务计划变成前端的可视化清单。

```bash
任务：分析并修复项目

[✓] 分析项目结构
[✓] 定位鉴权模块
[>] 检查 JWT 校验逻辑
[ ] 修复问题
[ ] 执行测试
```

### 4.3 Sandbox：类似 IDE 的沙箱界面

## 五、总结

```bash
Deep Agents 前端可视化
│
├── 1. 消息层
│      └── stream.messages
│
├── 2. 委派层
│      └── stream.subagents
│
├── 3. 状态层
│      └── stream.values
│             ├── todos
│             ├── plans
│             └── 自定义状态
│
├── 4. 工具层
│      └── 工具调用状态与结果
│
├── 5. 交互控制层
│      └── Interrupts / HITL
│
└── 6. 产物展示层
       └── 文件浏览 / 代码 / Diff
```

Deep Agents 的前端不是简单地把 LLM 返回的文本显示出来，而是把 Agent 运行时中的消息、状态、委派信息和执行产物转换成用户可以观察、理解和交互的工作界面。

## 六、 useStream() 🆚 FastAPI 中转方案

前端通过 LangGraph API Server 连接 Agent 的方式，不是前端直接调用 Python Agent 对象。

前端直连 LangGraph 服务，LangGraph 服务再运行 Deep Agent。

```ts
const stream = useStream<typeof agent>
  {
    apiUrl: "http://localhost:2024",
    assistantId: "agent"
  };
```

localhost:2024 指向 LangGraph API Server，而不是 Python Agent 对象本身。

- 方案 A：前端直连 LangGraph API Server（本文档）

  `React ──────► LangGraph API ──────► Deep Agent`

- 方案 B：FastAPI 中转（更适合整合业务系统）

  ```bash
    React ──────► FastAPI ──────► LangGraph API ──────► Deep Agent
                      │
                      ├── 用户认证 / JWT
                      ├── 业务权限 / RBAC
                      ├── 业务数据库
                      └── 业务 API
  ```

- 对比

  | 对比项             | 方案 A：前端直连      | 方案 B：FastAPI 中转       |
  | ------------------ | --------------------- | -------------------------- |
  | 架构复杂度         | 较低                  | 较高                       |
  | 快速验证 Agent     | 很适合                | 可以                       |
  | 业务鉴权与权限控制 | 需要在服务端另行配置  | 可以集中处理               |
  | 业务数据库与       | API 集成 需要额外设计 | 更自然                     |
  | 生产环境           | 适用于受控场景        | 适合需要统一业务入口的系统 |

❗如果 Python 服务里直接执行 agent.ainvoke()，并通过 FastAPI 返回结果，那么也不必额外启动 LangGraph API Server；但如果要使用本文档这种 useStream() 对接方式，就需要提供与它兼容的后端接口。
