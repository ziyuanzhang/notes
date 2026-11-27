# DeepAgents-8-中间件

Middleware（中间件）让你能够在 Agent 执行过程中插入自己的控制逻辑，而不必重写整个 Agent。

- Agent：负责理解任务、决定下一步做什么，以及是否调用工具。
- Middleware：负责在执行过程中的指定时机介入，进行检查、修改、记录、拦截等操作。
- LangGraph：负责承载和编排 Agent 的执行流程。
- Tool：负责执行具体操作，例如查询数据库、读取邮件、发送邮件。

## 一、

### 1.1 Middleware overview（中间件概述）

中间件适用于以下场景：

1. 追踪 Agent 行为：记录日志、进行数据分析和调试。
2. 转换输入与输出：修改提示词、调整工具选择、格式化模型输出。
3. 控制执行流程：添加重试机制、备用方案和提前终止逻辑。
4. 实施安全策略：进行速率限制、安全护栏检查以及个人身份信息（PII）检测。

### 1.2 The agent loop（Agent 执行循环）

Agent 的核心循环包括：

1. 调用模型。
2. 让模型决定要执行哪些工具。
3. 执行模型选择的工具。
4. 将工具结果交回模型。
5. 如果模型不再要求调用工具，就结束本轮执行。

Middleware 会在上述步骤的前后提供钩子（Hooks），让开发者有机会介入。

### 1.3 在 LangGraph 工作流中使用 Middleware

Middleware 并不是一个独立的运行时系统。

create_agent() 返回的 Agent 会被编译为 LangGraph 工作流的一部分，中间件钩子就在这个已编译的工作流内部执行。

### 1.4 demo HumanInTheLoopMiddleware 示例

```python
from langchain.agents import AgentState, create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.graph import START, StateGraph

# 假设以下函数已经定义：
# read_email、send_email、classify_node 和 route

email_agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[read_email, send_email],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={"send_email": True}
        )
    ],
)

graph = (
    StateGraph(AgentState)
    .add_node("classify", classify_node)
    .add_node("email_agent", email_agent)
    .add_edge(START, "classify")
    .add_conditional_edges("classify", route)
    .compile()
)
```

## 二、建立整体架构：Middleware 究竟在哪里？

```bash
create_agent(...)
       |
       v
+----------------------------------+
|       LangGraph Agent Graph      |
|                                  |
|  Middleware 控制层                |
|  +----------------------------+  |
|  | 输入检查 / Prompt 修改       |  |
|  | 日志 / 重试 / 权限检查        |  |
|  | 摘要 / PII 脱敏 / HITL      |  |
|  +----------------------------+  |
|                |                 |
|                v                 |
|         Agent 执行循环            |
|                                  |
|     Model -> Tool Call           |
|        ^          |              |
|        |          v              |
|        +------ Tool Result       |
|                                  |
+----------------------------------+
       |
       v
    最终结果
```

❗注意：这是一张概念架构图，不是 LangChain 内部节点的精确实现图。具体钩子会在模型调用、工具执行等不同阶段触发，而不是所有中间件都在一个统一的入口执行。

### 2.1 四个层次怎么理解？

| 层次         | 职责                           | 类比           |
| ------------ | ------------------------------ | -------------- |
| LangGraph    | 编排整个执行流程               | 工作流引擎     |
| Agent Loop   | 组织模型与工具反复交互         | 任务执行循环   |
| Middleware   | 在指定时机检查、修改或控制执行 | 可插拔的拦截器 |
| Model / Tool | 推理决策、执行具体操作         | 决策者与执行器 |

## 三、Middleware 的钩子：到底什么时候介入？

### 3.1 Agent 的完整执行流程

```bash
用户输入
   |
   v
[输入阶段]
   |
   +--> Middleware：检查输入、注入上下文
   |
   v
[调用模型]
   |
   +--> Middleware：修改 Prompt、记录调用
   |
   v
[模型返回结果]
   |
   +--> Middleware：检查模型响应
   |
   v
模型是否请求调用工具？
   |
   +--- 是 ---> [工具执行前]
   |                 |
   |                 +--> 权限检查 / 参数检查 / 人工审批
   |                 |
   |                 v
   |             [执行工具]
   |                 |
   |                 v
   |             [工具执行后]
   |                 |
   |                 +--> 日志 / 错误处理 / 结果处理
   |                 |
   |                 +-----------> 再次调用模型
   |
   +--- 否 ---> [最终输出阶段]
                     |
                     +--> 输出检查 / 格式转换
                     |
                     v
                   返回结果
```

### 3.2 为什么叫 Hook（钩子）？

钩子的意义：在框架预留的时机执行自己的代码。

## 四、常见 Middleware 分类

1. 上下文与 Prompt 管理
   - 代表：SummarizationMiddleware
   - 对话太长时压缩历史记录，减少 Token 消耗，帮助模型保留关键上下文。
   - 典型场景：长对话、复杂任务、长时间运行的 Agent。

2. 安全与人工审核
   - 代表：HumanInTheLoopMiddleware、PII 检查类中间件
   - 在敏感工具执行前暂停，检查或脱敏个人信息，落实执行限制。
   - 典型场景：发送邮件、退款、修改生产数据。

3. 可靠性与故障处理
   - 重试、备用模型、错误恢复、提前终止
   - 某个步骤失败后，按规则重试、切换备用方案，或者停止执行。
   - 典型场景：模型限流、外部 API 暂时不可用。

4. 可观测性
   - 日志、指标、调用追踪、调试
   - 记录模型调用次数、工具执行时间、失败原因和 Token 消耗。
   - 典型场景：生产环境排障、成本分析、性能优化。

## 五、建议的学习顺序

Middleware 是 Agent 的执行过程控制与扩展机制；LangGraph 是承载和编排执行流程的框架。
