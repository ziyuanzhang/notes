# DeepAgents-6.1-子代理-子智能体

Subagents 解决的是任务如何分工、上下文如何隔离，以及执行结果如何返回主智能体的问题。

## 一、先建立整体层级关系

```bash
        create_deep_agent(...)
                │
                ▼
┌──────────────────────────────────────┐
│         Deep Agent Harness           │
│                                      │
│  Middleware / Tools / Skills / ...   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │         Main Agent             │  │
│  │                                │  │
│  │  1. 理解用户需求                 │  │
│  │  2. 制定计划                    │  │
│  │  3. 决定是否委派                 │  │
│  │  4. 汇总子智能体的结果            │  │
│  └───────────────┬────────────────┘  │
│                  │                   │
│             task(...)                │
│                  │                   │
│      ┌───────────┼───────────┐       │
│      ▼           ▼           ▼       │
│  Researcher   Coder       Reviewer   │
│   研究智能体   编码智能体    审查智能体   │
│      │           │           │       │
│      ▼           ▼           ▼       │
│    研究结果    代码结果     审查结果     │
│      └───────────┼───────────┘       │
│                  ▼                   │
│          Main Agent 汇总              │
└──────────────────┬───────────────────┘
                   ▼
             最终回答用户
```

| 层次       | 主要职责        | 你需要理解的重点                        |
| ---------- | --------------- | --------------------------------------- |
| Harness    | 组装 Agent 能力 | 配置 subagents、模型、工具和 Middleware |
| Main Agent | 任务协调者      | 决定任务如何拆分、委派给谁、怎样汇总    |
| Subagent   | 任务执行者      | 根据自己的上下文、工具和指令完成工作    |

## 二、 Subagents 解决的核心问题: 上下文膨胀

context bloat（上下文膨胀） 和 context isolation（上下文隔离）。

专业的事，专业的agent

```bash
Subagents
    │
    ├── 任务分工
    │     └── 谁来做这项工作？
    │
    ├── Context Mode
    │     ├── Isolated：只接收委派任务所需的信息
    │     └── Fork：继承父智能体的对话历史
    │
    ├── Capabilities
    │     ├── Tools：能调用什么工具？
    │     ├── Skills：能加载什么技能？
    │     ├── Middleware：如何扩展执行行为？
    │     └── Permissions：能访问和修改什么？
    │
    ├── Orchestration
    │     ├── task()：普通委派
    │     └── Interpreter：动态编排
    │
    ├── Data Flow
    │     ├── Runtime Context：运行时数据传递
    │     ├── Streaming：观察执行进度
    │     └── response_format：约束输出结构
    │
    └── Observability
          └── lc_agent_name：识别子智能体调用与追踪
```

## 三、Subagent 的两种配置方式

1. SubAgent: 通过字典配置的子智能体。
2. CompiledSubAgent: 把一个已经编译好的 LangGraph 工作流作为子智能体。

### 3.1 第一种: 字典配置 SubAgent

```python
   research_subagent = {
       "name": "research-agent",
       "description": "负责使用网络搜索进行深入研究",
       "system_prompt": "你是一名严谨的研究员。",
       "tools": [internet_search],
       "model": "openai:gpt-5.5",
   }

   agent = create_deep_agent(
       model="google_genai:gemini-3.6-flash",
       subagents=[research_subagent],
   )
```

| 字段            | 作用                   | 直白解释                 |
| --------------- | ---------------------- | ------------------------ |
| name            | 子智能体唯一标识       | 它叫什么                 |
| description     | 描述其职责             | 主智能体什么时候应该找它 |
| system_prompt   | 定义行为和输出规范     | 它应该怎么干活           |
| mode            | 上下文隔离与继承       | 是否继承主智能体对话     |
| tools           | 配置可用工具           | 它能使用哪些能力         |
| model           | 可选的模型覆盖         | 它用哪个模型思考         |
| middleware      | 附加中间件             | 它还需要哪些运行能力     |
| interrupt_on    | 工具中断及人工审批配置 | 哪些工具需要人工介入     |
| skills          | 技能来源路径           | 它可以加载哪些技能       |
| response_format | 结构化输出规范         | 它要按照什么数据结构交付 |
| permissions     | 文件系统权限规则       | 它能访问或修改哪些文件   |

- 几个重要细节:
  - name 必须唯一，因为主智能体通过名称选择子智能体。
  - description 不应只写“负责研究”，而应明确研究什么、何时使用、交付什么。
  - 指定 tools 后，会完全覆盖默认继承的工具列表，而不是在继承列表上追加。
  - 自定义子智能体的 system_prompt、middleware 和 skills 不会自动继承主智能体的对应配置。
  - model 不指定时，默认使用主智能体的模型。
  - interrupt_on 的人工审批机制需要 Checkpointer 支持。

### 3.2 第二种: CompiledSubAgent

```python
from langchain.agents import create_agent
from deepagents import CompiledSubAgent, create_deep_agent

custom_graph = create_agent(
    model="openai:gpt-5.5",
    tools=specialized_tools,
    system_prompt="你是一个专门负责数据分析的智能体。",
)

custom_subagent = CompiledSubAgent(
    name="data-analyzer",
    description="负责复杂的数据分析任务",
    runnable=custom_graph,
)

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    subagents=[custom_subagent],
)
```

| 字段          | 作用               | 直白解释                 |
| ------------- | ------------------ | ------------------------ |
| name          | 子智能体唯一标识   | 它叫什么                 |
| description   | 描述其职责         | 主智能体什么时候应该找它 |
| system_prompt | 定义行为和输出规范 | 它应该怎么干活           |
| mode          | 上下文隔离与继承   | 是否继承主智能体对话     |

如果你自行构建 LangGraph 图并将其作为子智能体，图的 State 必须包含 messages 这个状态键。

### 3.3 最重要的区别: Isolated(隔离上下文) 与 Fork(继承父智能体的对话历史)

默认情况下，子智能体使用 mode="isolated"。另一种模式是 mode="fork"。

它们决定的是: 子智能体执行任务时，能够看到多少父智能体的对话上下文。

| 维度       | Isolated（默认）       | Fork                         |
| ---------- | ---------------------- | ---------------------------- |
| 对话历史   | 只有委派任务所需的描述 | 继承父智能体完整对话历史     |
| 系统提示词 | 使用自己的提示词       | 继承父提示词，可追加补充内容 |
| 技能       | 可配置独立技能         | 不允许设置 skills            |
| 任务独立性 | 高                     | 依赖已有对话上下文           |
| 上下文开销 | 通常较低               | 通常较高                     |
| 典型用途   | 独立研究、专门分析     | 延续已经开始的调查或修复     |

❗Fork 继承的是对话历史和系统提示词，不等于自动复制了所有外部资源、工具运行状态或数据库事务。

## 四、默认子智能体 general-purpose

```python
from deepagents import create_deep_agent

agent = create_deep_agent()
result = agent.invoke({
    "messages": [{"role": "user", "content": "你好"}]
})
```

Deep Agents 默认会自动添加 general-purpose 子智能体，即使没有写 subagents，框架也会自动添加一个默认的 general-purpose 子智能体。但创建了它，不等于每次调用都会使用它。

```bash
create_deep_agent()
        ↓
   创建主 Agent
        ├── 主 Agent
        └── 默认添加
              ↓
        general-purpose
        （通用子智能体）
# ------------------------------
用户提出问题
      ↓
   主 Agent
      ├── 简单问题
      │      └── 自己回答
      └── 复杂任务
             └── 调用 task()
                       ↓
                 general-purpose
                       ↓
                   返回结果
```

- 新增 researcher，默认的 general-purpose 通常不会因此消失;

  ```bash
  Main Agent
      │
      ├── researcher（你配置的）
      │
      └── general-purpose（默认添加的）
  ```

- 如何替换默认的 general-purpose

  只需要提供一个同名的自定义子智能体，就会替换默认的通用子智能体，而不是再额外添加一个同名的。

- 如何完全关闭同步子智能体？

  需要同时满足两个条件：
  1. 在当前使用的 Harness Profile 中，将 general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False) 设置为禁用。
  2. 在 create_deep_agent() 中不传入任何同步子智能体。

  满足这两个条件后，Deep Agents 不会挂载 SubAgentMiddleware 和 task 工具。

## 五、Dynamic Subagents：动态子智能体

态方式能够使用代码中的循环、分支和批量处理逻辑来组织委派。

```python
uv add "deepagents[quickjs]"

from deepagents import create_deep_agent
from langchain_quickjs import CodeInterpreterMiddleware

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    subagents=[
        {
            "name": "reviewer",
            "description": "审查代码中的安全问题，并给出行号和严重程度",
            "system_prompt": (
                "你是一名安全审查专家。"
                "报告问题时必须给出行号和严重程度。"
            ),
        }
    ],
    middleware=[CodeInterpreterMiddleware()],
)
```

当子智能体和解释器 Middleware 同时存在时，动态分发默认可用；如果希望强制使用普通 task 工具路径，可以配置 CodeInterpreterMiddleware(subagents=False)。

## 六、Streaming：实时查看子智能体进度

## 七、Structured Output：让子智能体返回结构化结果

## 八、Context Engineering：父子智能体的上下文究竟如何传递？

专门区分了两件事：

1. 对话上下文：主智能体之前说过什么、做过什么。
2. Runtime Context：调用时传入的运行时数据，例如 user_id、session_id 和业务配置。

### 8.1 Runtime Context 会自动传给子智能体

```python
from dataclasses import dataclass
from langchain.tools import ToolRuntime, tool
from deepagents import create_deep_agent

@dataclass
class Context:
    user_id: str
    session_id: str

@tool
def get_user_data(
    query: str,
    runtime: ToolRuntime[Context],
) -> str:
    """查询当前用户的数据。"""
    user_id = runtime.context.user_id
    return f"Data for user {user_id}: {query}"

research_subagent = {
    "name": "researcher",
    "description": "为当前用户查询业务数据",
    "system_prompt": "你是一名研究助手。",
    "tools": [get_user_data],
}

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    subagents=[research_subagent],
    context_schema=Context,
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "查询我的近期活动"}]},
    context=Context(
        user_id="user-123",
        session_id="abc",
    ),
)
```

主智能体调用时传入的 Runtime Context 会自动传递给所有子智能体。因此，子智能体内部的工具也能读取相同的 user_id 和 session_id

🔥所有子智能体收到的是同一份父级 Runtime Context；如果要让不同子智能体采用不同配置，需要通过字段或命名空间明确区分。

### 8.2 如何判断是哪个子智能体调用了工具？

lc_agent_name 元数据。

```python
@tool
def shared_lookup(query: str,runtime: ToolRuntime,) -> str:
    """查询信息。"""

    agent_name = runtime.config.get("metadata", {}).get("lc_agent_name")
    if agent_name == "fact-checker":
        return strict_lookup(query)

    return general_lookup(query)
```

## 九、Skills、Middleware、Tools 和 Permissions：哪些继承，哪些不继承？

| 能力          | 默认通用子智能体              | 自定义子智能体                           | Fork 子智能体                    |
| ------------- | ----------------------------- | ---------------------------------------- | -------------------------------- |
| 模型          | 默认与主智能体相同            | 默认与主智能体相同，可覆盖               | 按 Fork 机制继承父级提示词与历史 |
| Skills        | 自动继承主智能体配置的 Skills | 默认不继承，需要单独配置                 | 不允许配置 skills                |
| Tools         | 默认拥有文件系统工具          | 默认继承主智能体工具；显式指定后完全覆盖 | 可配置自己的工具                 |
| System Prompt | 默认提示词及 Profile 配置     | 隔离模式必须提供                         | 继承父级提示词，可追加补充内容   |
| Middleware    | 使用自身默认栈                | 可附加自定义 Middleware                  | 按 Fork 模式构建                 |
| Permissions   | 默认继承相关权限配置          | 可显式覆盖父级权限                       | 需结合具体配置与版本核实         |

```bash
agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    skills=["/skills/main/"],
    subagents=[
        {
            "name": "researcher",
            "description": "专门负责研究",
            "system_prompt": "你是一名研究助手。",
            "tools": [web_search],
            "skills": ["/skills/researcher/"],
        }
    ],
)
# -----------------------------------------------
Deep Agent Harness
        │
        ▼
    Main Agent
        │
        ├── SkillsMiddleware
        │       └── /skills/main/
        │
        └── SubAgentMiddleware
                │
                ├── general-purpose
                │       └── 继承主智能体 Skills
                │
                └── researcher
                        └── /skills/researcher/
```

skills 指定的路径是技能来源路径，不是技能内容本身。技能文件最终由对应的 Backend 和 Skills Middleware 按其配置加载。

## 十、生产环境如何设计子智能体

```bash
用户请求
    │
    ▼
FastAPI API 层
    │
    ├── 身份认证
    ├── 租户识别
    └── 权限检查
    │
    ▼
Deep Agent / Coordinator
    │
    ├── 任务规划
    ├── 选择子智能体
    └── 控制执行流程
    │
    ├──────────────┬───────────────┐
    ▼              ▼               ▼
 Researcher     RAG Agent      Code Reviewer
    │              │               │
    ▼              ▼               ▼
 搜索工具        检索工具         代码分析工具
    │              │               │
    └──────────────┼───────────────┘
                   ▼
              结果校验层
                   │
            ┌──────┴──────┐
            ▼             ▼
         权限校验       结果整合
            │             │
            └──────┬──────┘
                   ▼
             最终响应 / 审计
```
