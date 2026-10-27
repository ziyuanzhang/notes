# langGraph-2.5-工作流与智能体

工作流（Workflows）与智能体（Agents）的设计模式

## 一、概念理解

- Workflow（工作流）: 执行路径 预先由代码定义，系统按照设计好的顺序执行。
- Agent（智能体）: 执行过程更具动态性，模型可以根据当前情况决定下一步做什么、使用什么工具。

Workflow 和 Agent 不是两种互斥的技术。 你完全可以在一个 Workflow 中嵌入 Agent，把固定流程与动态决策组合起来。

## 二、层级关系: 从基础组件到完整 Agent

<img src='./img/langGraph-2.5-层级关系.png' alt="langGraph-2.5-层级关系" width='800'/>

### 2.1 基础能力层: 模型能做什么？

| 能力       | 对应代码                           | 作用                       |
| ---------- | ---------------------------------- | -------------------------- |
| 结构化输出 | llm.with_structured_output(Schema) | 让模型按定义的结构返回数据 |
| 工具调用   | llm.bind_tools(tools)              | 让模型能够提出工具调用请求 |
| 短期记忆   | 消息历史、Graph State 等           | 为后续步骤提供之前的上下文 |

❗bind_tools() 不是直接执行工具，而是让模型能够按照工具定义生成调用请求。

```python
llm_with_tools = llm.bind_tools([multiply])
msg = llm_with_tools.invoke("What is 2 times 3?")
print(msg.tool_calls)

# [
#     {
#         "name": "multiply",
#         "args": {"a": 2, "b": 3},
#         "id": "call_123",
#     }
# ]
```

此时，工具函数不一定已经执行。你还需要工具执行器去真正调用 multiply(2, 3)，再把结果交回模型或后续节点。

这正是后面 Agent 循环的基础。

### 2.2 LangGraph 执行框架层: 程序如何组织起来？

```python
builder = StateGraph(State)

builder.add_node("generate", generate)
builder.add_node("check", check)

builder.add_edge(START, "generate")
builder.add_edge("generate", "check")
builder.add_edge("check", END)

graph = builder.compile()

result = graph.invoke({"topic": "cats"})
```

compile() 不会把你的 Python 代码翻译成某种新的机器代码;
它会 完成图的构建与检查，得到可运行的图对象。

### 2.3 流程控制层

Routing（路由）是一种应用设计模式，而条件边（Conditional Edges）是 LangGraph 实现路由的机制之一。

| 概念                    | 所属层级                   | 含义                                           |
| ----------------------- | -------------------------- | ---------------------------------------------- |
| Routing                 | 应用设计模式               | 根据请求或状态选择处理路径                     |
| add_conditional_edges() | Graph API                  | 根据函数返回值选择后继节点                     |
| route_decision()        | 用户编写的函数             | 具体实现路由判断                               |
| Command(goto=...)       | Graph API 的另一种控制方式 | 在节点返回结果中指定下一步                     |
| Send                    | 动态任务分发机制           | 向目标节点发送指定输入，可创建多个 worker 任务 |

### 2.4 应用架构层: 文档的六种主要模式

1. Prompt Chaining（提示链）
   A → B → C
   将复杂任务拆成多个串行步骤。例如生成内容 → 检查 → 润色。

2. Parallelization（并行化）
   A、B、C 同时执行 → 汇总
   适合互相独立的子任务，或对同一内容进行多角度评估。

3. Routing（路由）
   输入 → 分类 → 选择一个分支
   适合价格、退款、退货等不同类型请求的分流。

4. Orchestrator-Worker（编排器与工作节点）
   编排器规划 → 动态分发 → 汇总
   适合子任务数量不确定的场景，例如生成多章节报告或处理多个文件。

5. Evaluator-Optimizer（评估与优化）
   生成 → 评估 → 反馈 → 再生成
   适合具有明确验收标准、需要反复改进的任务。

6. Agent（智能体）
   模型决策 → 工具执行 → 观察结果 → 再决策
   适合下一步操作无法完全预先确定的任务。

前五种主要描述如何组织任务流程；第六种强调模型如何参与决策。实际项目可以把它们组合使用。

## 三、代码解读: 逐一理解关键实现
