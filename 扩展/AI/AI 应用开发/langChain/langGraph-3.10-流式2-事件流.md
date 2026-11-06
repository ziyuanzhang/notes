# langGraph-3.10-流式2-事件流(推荐)

LangGraph 不仅可以把图执行过程中的原始事件暴露出来，还可以把这些事件整理成应用程序容易使用的流式接口。

Event Streaming 解决的是：图正在执行什么、LLM 正在输出什么、工具运行到哪一步、子 Agent 在做什么，以及最终结果是什么，应用程序如何实时观察并消费这些信息？

Event Streaming 不是另一套 Agent 执行引擎，也不是模型本身的流式输出功能。它建立在 LangGraph 的 Pregel 执行引擎和底层 Streaming 机制之上，进一步提供结构化事件与便于应用消费的投影（Projection）。

## 一、概念理解：Event Streaming 是什么？

### 1.1 先区分三个容易混淆的概念

| 概念            | 核心职责                           | 可以怎么理解                     |
| --------------- | ---------------------------------- | -------------------------------- |
| Pregel Engine   | 执行图中的节点和步骤               | 实际干活的执行引擎               |
| Streaming       | 暴露图执行过程中产生的原始数据     | 把执行过程中的信息流放出来       |
| Event Streaming | 整理原始事件，提供结构化的消费接口 | 把信息流加工成应用容易使用的形式 |

### 1.2 它为什么不等于 LLM Token Streaming？

- LLM Token Streaming：逐步输出模型生成的文本。
- LangGraph Streaming：暴露图执行产生的状态更新、消息、任务等信息。
- Event Streaming：把这些执行信息进一步组织成统一的事件流和多种类型化投影。

## 二、层级关系：整个 Streaming 系统是怎样组织的？

<img src="./img/langGraph-3.10-流式2-事件流-整个 Streaming 系统.png" alt="langGraph-3.10-流式2-事件流-整个 Streaming 系统" width=800 />

Graph 执行 → 原始事件 → 事件路由 → Transformer 转换 → 类型化投影 → 应用消费

各层职责

1. Pregel Engine 负责执行，Event Streaming 负责观察和整理执行过程。
2. Event Router 是事件分发的桥梁，Transformer 是事件加工器。
3. stream.messages、stream.values 和 stream.subgraphs 不是三次独立执行，而是同一次运行中不同视角的数据投影。

| 层级                                    | 职责                               |
| --------------------------------------- | ---------------------------------- |
| LangGraph Graph Runtime / Pregel Engine | 实际执行节点、调度任务、推进图运行 |
| Streaming                               | 输出底层 Graph 执行事件            |
| Event Router                            | 接收并路由规范化后的事件           |
| Stream Transformers                     | 将原始事件转换为不同的投影         |
| Event Stream                            | 对外提供类型化的消费接口           |
| Application                             | 消费流、展示 UI、构建业务逻辑      |

❗Event streaming 并不负责执行 Agent，而是负责观察、整理和暴露 Agent 的执行过程。它处于 Graph Runtime 之上的流式数据处理层。

## 三、为什么需要 Event Streaming？

1. 传统 Streaming 的问题: 当开启多个 stream_mode 时，开发者需要自己区分不同类型的 Chunk。随着功能增加，分支判断也会越来越复杂。
2. Event streaming 的改进: Event streaming 将原始事件转化为语义明确的接口：
   多个 Projection(投影) 消费者可以同时读取同一个底层事件流，而不会互相消耗数据。

3. 为什么不能只用 stream.messages？stream.messages 适合展示模型消息，但它本身不等于完整的业务进度系统。

   你可能需要另外显示：
   - 当前正在执行哪个工具；
   - 工具是否完成或失败；
   - 当前检索到多少份文档；
   - 是否正在等待人工审批；
   - 当前任务是否结束。

## 四、工作原理：从节点执行到应用收到事件

1. 第 1 步：启动图执行
   应用调用 graph.stream_events(input, version="v3")，开始一次图运行。

2. 第 2 步：Pregel Engine 执行
   引擎按照图的调度规则执行节点、处理任务并更新状态。

3. 第 3 步：产生原始 Streaming 数据

   可能包括状态更新、模型消息、工具事件、自定义数据和任务事件。

4. 第 4 步：标准化与路由
   运行时将底层输出规范化为 ProtocolEvent，由 Event Router 依次分发给注册的 Transformer。

5. 第 5 步：生成投影
   内置 Transformer 和自定义 Transformer 分别生成消息、状态、子图、工具活动等视图。

6. 第 6 步：应用消费
   UI、CLI、日志模块或业务代码读取需要的投影，最终通过 stream.output 获取结果。

- 细节一：Event Router 不是图的条件路由。

  你之前学习的 LangGraph add_conditional_edges，负责决定图下一步执行哪个节点。
  Event Router 负责把已经产生的事件交给 Transformer。
  两者都涉及路由，但作用完全不同。

- 细节二：Transformer 不负责重新执行图。
  Transformer 观察事件并加工数据。它可以维护计数器、累积文本、生成业务进度，也可以决定是否抑制某个原始事件。
  但按照这篇文档描述，Transformer 本身不回调图运行时来决定下一步执行哪个节点。它是观察与投影层，不是新的 Agent 控制器。

## 五、代码解读：从最简单的用法开始

### 5.1 最基础：逐 Token 输出并取得最终结果

```python
# stream = graph.stream_events(input, version="v3")

stream = graph.stream_events( #启动图运行并创建运行流对象
    {
        "messages": [
            {
                "role": "user",
                "content": "What is 42 * 17?",
            }
        ]
    },
    version="v3", # 指定这套 Event Streaming API 的协议版本
)

for message in stream.messages:
    for token in message.text:
        print(token, end="", flush=True)

final_state = stream.output

# stream.messages: 获取模型消息投影
# message.text: 访问消息文本流
# for token in message.text: 逐步消费文本片段
# stream.output: 获取最终输出
```

遍历 stream.messages 拿到的只是文本增量的实时流（可能横跨多次模型调用）；最后一个 token 只是文本的终点，不是图的终点。
要拿完整结果，得等图跑完看 stream.output，它才是聚合后的最终状态，且结构取决于图的定义，未必等于"最后那段文本"。

### 5.2 stream.messages 能提供哪些内容？

- message.text：消息文本，可以按增量消费，也可以转换成完整文本。
- message.reasoning：推理内容的增量（如果模型和运行环境提供）。
- message.tool_calls：工具调用片段，包括调用 ID、工具名以及新增的参数片段。

尤其要注意，工具调用参数也可能是增量的。

### 5.3 stream.values 与 Checkpoint 的区别

- stream.values：运行时观察状态变化。
- stream.output：取得运行最终输出。
- Checkpoint：由持久化机制保存的图状态检查点，可用于恢复、续跑等操作。

看到一次状态快照，不代表它一定被作为一个独立的 Checkpoint 永久保存。 两者可能在同一次运行中都出现，但职责不同。

### 5.4 同时消费多个投影

```python
# -- 同步 ----------------------------------
stream = graph.stream_events(input, version="v3")

for name, item in stream.interleave(
    "values",
    "messages",
    "subgraphs",
):
    if name == "values":
        print(f"[state] keys={list(item)}")
    elif name == "messages":
        print(f"[llm] node={item.node}")
    elif name == "subgraphs":
        print(f"[subgraph] path={item.path}")
# -- 异步 ----------------------------------
import asyncio

stream = await graph.astream_events(
    input,
    version="v3",
)

async def consume_messages():
    async for message in stream.messages:
        print(f"[llm] node={message.node}")

async def consume_subgraphs():
    async for subgraph in stream.subgraphs:
        print(f"[subgraph] path={subgraph.path}")

await asyncio.gather(
    consume_messages(),
    consume_subgraphs(),
)
```

1. Python的构成（需要整体了解），现在的教程都是从变量开始，没有全局观念；
2. 有哪些标准库，都是干什么的；
3. 哪些标准库是常用的？哪些是不常用的？哪些是被淘汰的？
