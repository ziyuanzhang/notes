# DeepAgents-5.4-上下文管理-上下文工程

## 一、Deep Agents 的五类上下文

Input Context：启动时给 Agent 什么指令、记忆和技能。
Runtime Context：每次执行任务时，向 Agent 的运行环境传入什么配置和依赖。
Context Compression：上下文过长时，如何压缩历史或把大内容转存到文件。
Context Isolation：如何让 Subagent 独立完成繁重工作，只向主 Agent 返回结果。
Long-term Memory：如何跨线程、跨对话持久保存需要长期使用的信息。

| 上下文类型          | 中文理解     | 主要职责                       | 作用范围                    |
| ------------------- | ------------ | ------------------------------ | --------------------------- |
| Input Context       | 输入上下文   | 启动时提供提示词、记忆、技能等 | 每次运行时构建              |
| Runtime Context     | 运行时上下文 | 传入用户元数据、密钥、连接等   | 单次运行，并传播给子 Agent  |
| Context Compression | 上下文压缩   | 卸载大内容、总结历史消息       | 上下文接近容量限制时        |
| Context Isolation   | 上下文隔离   | 将繁重工作交给独立的子 Agent   | 每个子 Agent 的独立执行过程 |
| Long-term Memory    | 长期记忆     | 跨线程保存可复用的信息         | 跨对话持久化                |

## 二、建立完整的层级关系

```bash
create_deep_agent(...)
        ↓
+--------------------------------------+
|         Deep Agent Harness           |
|                                      |
|  1. Input Context                    |
|     +-- System Prompt                |
|     +-- Memory (AGENTS.md)           |
|     +-- Skills                       |
|     +-- Tool Prompts                 |
|     +-- Middleware Prompts           |
|                                      |
|  2. Runtime Context                  |
|     +-- User ID / Role               |
|     +-- API Keys / Connections       |
|     +-- Feature Flags                |
|                                      |
|  3. State / Checkpoint               |
|     +-- Messages                     |
|     +-- Custom State                 |
|     +-- Thread Progress              |
|                                      |
|  4. Context Management               |
|     +-- Offloading                   |
|     +-- Summarization                |
|     +-- Context Isolation            |
|                                      |
|  5. Long-term Memory Backend         |
|     +-- CompositeBackend             |
|     +-- StoreBackend                 |
+--------------------------------------+
        |
        | agent.invoke(...) / ainvoke(...)
        ▼
+--------------------------------------+
|             Agent Runtime            |
|                                      |
|  Model <----> Tools                  |
|    |           |                     |
|    |           +--> Filesystem       |
|    |           +--> Database         |
|    |           +--> External APIs    |
|    |                                 |
|    +--> Context / Middleware         |
|    +--> State updates                |
|    +--> Subagent delegation           |
+--------------------------------------+
        |
        +------> Subagent A
        |          +-- 独立上下文
        |          +-- 独立工具调用
        |          +-- 返回精简结果
        |
        +------> Subagent B
                   +-- 独立上下文
                   +-- 独立工具调用
                   +-- 返回精简结果
```

- Deep Agent Harness：负责组装 Agent 的能力、指令和运行机制。
- Input Context：是 Agent 获得指令与背景知识的来源。
- Runtime Context：是一次运行过程中供工具、Middleware 等读取的配置。
- State：是 Agent 执行过程中可变的图状态，可参与 Checkpoint 持久化。
- Backend：决定虚拟文件系统中的内容如何读写和存储。
- Context Management：负责减少上下文负担，或将任务分离。
- Subagent：是主 Agent 委派工作的执行单元，拥有自己的上下文。

## 三、Input Context：启动时提供什么信息？

### 3.1 完整 System Prompt 组成部分

```bash
Complete System Prompt
|
+-- 1. Custom system_prompt
|
+-- 2. Base agent prompt
|
+-- 3. Memory prompt
|      +-- AGENTS.md
|      +-- Memory 使用说明
|
+-- 4. Skills prompt
|      +-- 技能位置
|      +-- 技能 frontmatter 信息
|      +-- 技能使用说明
|
+-- 5. Virtual filesystem prompt
|      +-- 文件读写工具说明
|      +-- execute 工具说明（适用时）
|
+-- 6. Subagent prompt
|      +-- task 工具使用说明
|
+-- 7. 自定义 Middleware prompts
|
+-- 8. Human-in-the-loop prompt（启用时）
```

## 四、Runtime Context：每次运行时传入什么配置？

Runtime Context 不会自动加入模型提示词。只有当工具、Middleware 或其他逻辑读取它，并将其加入消息或 System Prompt 时，模型才会看到相应内容。
Runtime Context 会传播给子 Agent，因此子 Agent 可以获得父 Agent 的运行上下文。

```python
from dataclasses import dataclass

from deepagents import create_deep_agent
from langchain.tools import ToolRuntime, tool


@dataclass
class Context:
    user_id: str
    api_key: str

@tool
def fetch_user_data(query: str, runtime: ToolRuntime[Context],) -> str:
    """查询当前用户的数据。"""
    user_id = runtime.context.user_id

    # 实际项目中，应在此处通过服务端逻辑鉴权并查询数据
    return f"查询用户 {user_id} 的数据：{query}"

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    tools=[fetch_user_data],
    context_schema=Context,
)

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "查询我的最近活动",
            }
        ]
    },
    context=Context(
        user_id="user-123",
        api_key="server-managed-key",
    ),
)


```

- ToolRuntime[Context] 可以理解为： 类似 TS中的泛型类型 ToolRuntime<Context>，其中 Context 是类型参数；
  - ToolRuntime：泛型类；
  - Context：作为类型参数传入的具体类型；
  - ToolRuntime[Context]：用 Context 指定类型参数后的参数化类型；
  - runtime：变量名，指向一个工具运行时对象；
    该对象携带工具执行所需的运行时信息，其中 Context 指定了上下文数据的类型。

## 五、Custom State：Agent 执行过程中的可变状态

- Runtime Context 解决的是“这次运行需要什么配置”；
- State 解决的则是“执行过程中需要维护什么状态”。

自定义 State Schema 继承 DeepAgentState，以保留内置的消息 DeltaChannel reducer 行为

State 可以参与 Checkpoint 持久化，但它不等于自动永久保存的长期记忆。 它的实际生命周期取决于线程、Checkpointer 和部署配置。

## 六、Context Compression：上下文过长了怎么办？

Deep Agents 默认包含上下文压缩机制，不需要为了基础的卸载和自动总结再额外添加 Middleware。

主要机制分为两类：Offloading（内容卸载） 和 Summarization（历史总结）

区别：

- Offloading：原文通常仍然保存在文件中，模型当前只携带引用和预览。
- Summarization：模型把历史消息压缩成结构化摘要，以较少的 Token 保留任务意图、已经创建的产物和下一步计划。

```bash
               旧的对话历史
                   │
      ┌────────────┴─────────────┐
      ↓                          ↓
LLM 生成结构化摘要           原始消息写入文件
      ↓                          ↓
替代工作上下文中的历史       保留可检索的原始记录
      ↓                          ↓
节省 Token                  需要时搜索或读取
```

### 6.1 第一种：Offloading（内容卸载）

Offloading 的核心是：把很大的内容保存到文件系统，再用文件路径和简短预览替代上下文中的完整内容。

文档给出了以下默认行为：

- 工具调用输入或结果超过 20,000 Token 时，会触发相应的卸载机制。
- 对于过大的工具调用结果，会将结果保存到配置的 Backend，并用文件路径和前 10 行预览替代。
- 对于文件写入和编辑操作留下的大型工具调用记录，当上下文达到模型可用窗口的约 85% 时，可以截断较旧的冗余调用记录，用文件引用替代。

### 6.2 第二种：Summarization（历史总结）

当上下文接近容量上限，并且没有更多适合卸载的内容时，Deep Agents 会尝试总结较旧的消息。

## 七、实战思路

| 业务需求               | 建议机制           | 设计原因                     |
| ---------------------- | ------------------ | ---------------------------- |
| Agent 的角色、通用行为 | System Prompt      | 所有相关任务都需要遵守       |
| 项目通用规范           | Memory / AGENTS.md | 持续适用的重要约定           |
| RAG 检索流程           | Skills             | 只在相关任务中加载详细流程   |
| 当前用户 ID、角色      | Runtime Context    | 由应用后端传入               |
| 数据库连接、服务配置   | Runtime Context    | 避免要求模型自行生成连接信息 |
| 当前任务执行到哪一步   | State              | 需要在执行过程中更新         |
| 大量 PDF 提取文本      | Backend 文件       | 避免全部进入模型上下文       |
| 多个部门分别分析       | Subagents          | 隔离各自的工作过程           |
| 跨线程保留的用户偏好   | StoreBackend       | 跨对话复用                   |
| 过长的对话历史         | Summarization      | 减少工作上下文占用           |
| 超大的工具结果         | Offloading         | 将完整结果保存到文件         |

## 八、总结

一句话总结：Context Engineering 就是管理 Agent 的信息供应、运行状态、上下文容量、任务隔离和长期记忆，让 Agent 在复杂、长期运行的任务中仍然能够可靠地工作。

### 8.1 第一层：上下文输入

解决模型需要知道什么的问题

- System Prompt：定义职责与通用规则。
- Memory：提供始终需要的重要信息。
- Skills：按需提供专业工作流。
- Tool Prompts：让模型正确使用工具。
- Runtime Context：向运行逻辑提供本次调用的配置。

### 8.2 第二层：运行时状态与存储

解决数据放在哪里、如何读写的问题

- State：可变的执行状态。
- Checkpoint：保存和恢复线程执行状态。
- Backend：管理虚拟文件系统的读写。
- StoreBackend：为指定路径提供跨线程存储能力。

### 8.3 第三层：上下文管理

解决上下文太长和任务太复杂的问题

- Offloading：大内容保存到文件，以引用替代完整内容。
- Summarization：将历史压缩为摘要。
- Context Isolation：让 Subagent 独立完成繁重任务。
- Long-term Memory：跨对话复用有价值的信息。
