# langGraph-3.10-流式2-事件流(推荐)

LangGraph 不仅可以把图执行过程中的原始事件暴露出来，还可以把这些事件整理成应用程序容易使用的流式接口。

Event Streaming 解决的是：图正在执行什么、LLM 正在输出什么、工具运行到哪一步、子 Agent 在做什么，以及最终结果是什么，应用程序如何实时观察并消费这些信息？

Event Streaming 不是另一套 Agent 执行引擎，也不是模型本身的流式输出功能。它建立在 LangGraph 的 Pregel 执行引擎和底层 Streaming 机制之上，进一步提供结构化事件与便于应用消费的投影（Projection）。

实时观察、状态持久化、历史审计和远程传输是不同职责。要构建自主可控的 Agent 平台，需要将它们通过明确的接口组合起来，而不是把所有能力都寄托在一个 Streaming API 上。

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

- 这两种写法的核心思想是：一次图运行可以有多个消费者，分别关注不同类型的信息。
  - interleave(...)：在同步代码中，把指定的多个投影按照严格的到达顺序交错消费。
  - asyncio.gather(...)：在异步代码中，并发运行多个消费协程。

它们共享的是同一次运行产生的事件流，消费的是不同的投影视角。

## 六、原始事件：当内置投影不够用时

## 七、StreamTransformer：如何把底层事件加工成业务能力？

## 八、把 Streaming 与 Interrupt、Checkpoint、Store 联系起来

| 机制            | 解决的问题                       | 主要职责                     |
| --------------- | -------------------------------- | ---------------------------- |
| Streaming       | 运行过程中发生了什么？           | 实时暴露执行信息             |
| Event Streaming | 如何方便地消费这些信息？         | 提供类型化投影与事件处理管道 |
| Checkpointer    | 如何保存并恢复线程状态？         | 持久化图状态检查点           |
| Store           | 如何跨线程保存长期信息？         | 持久化跨线程的键值数据       |
| Interrupt       | 运行是否需要暂停并等待外部输入？ | 控制执行暂停与恢复           |

### 8.1 中断后如何恢复？

```python
from langgraph.types import Command
from langgraph.checkpoint.memory import MemorySaver

# 1. 编译图时必须挂载 checkpointer
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

# 2. 首次调用：必须传入带 thread_id 的 config
config = {"configurable": {"thread_id": "your-thread-id"}}

stream = graph.stream_events(
    input,
    config=config,
    version="v3",
)

for message in stream.messages:
    print(message.text)
# -- 是否暂停 --------------------------------
if stream.interrupted:
    print(stream.interrupts)

# 3. 恢复时：同样带上同一个 config，输入改为 Command
stream = graph.stream_events(
    Command(
        resume={
            "decisions": [
                {"type": "approve"}
            ]
        }
    ),
    config=config,
    version="v3",
)

final_state = stream.output
```

理解这段代码要分清两件事：

- stream.interrupted 和 stream.interrupts：观察本次运行是否暂停，以及暂停所携带的信息。
- Command(resume=...)：向图提供恢复所需的输入。

### 8.2 观察中断不等于控制中断

Event Streaming 可以告诉应用程序：

- 当前运行已经中断；
- 中断携带了哪些信息；
- 何时可以由用户或其他业务系统提供恢复输入。

但它不会自动决定“是否批准”。

## 九、能力边界：Event Streaming 能做什么，不能做什么？

| 能力                    | 是否支持       | 需要注意                                                   |
| ----------------------- | -------------- | ---------------------------------------------------------- |
| 模型文本增量输出        | 支持           | 取决于模型与运行链路是否提供流式输出                       |
| 观察状态变化            | 支持           | 快照与增量是不同的数据粒度                                 |
| 观察工具调用            | 支持           | 应根据工具事件的生命周期构建准确状态                       |
| 观察子图与子 Agent      | 支持           | 需要正确理解执行作用域和嵌套路径                           |
| 生成自定义业务事件      | 支持           | 需要自行设计数据结构和 Transformer                         |
| 统计 Token 用量         | 可以实现       | 必须依据实际可用的用量事件；最终用量可能在消息结束时才出现 |
| 事件持久化与长期审计    | 不自动保证     | 需要自己实现持久化、索引、保留和访问控制                   |
| 跨进程实时推送          | 不等于自动具备 | 需要建立服务端与客户端之间的传输协议                       |
| 自动恢复中断任务        | 不单靠它完成   | 需要 Checkpointer、线程配置和恢复逻辑                      |
| 自动保证工具操作成功    | 不支持         | 工具执行结果和业务成功条件仍需检查                         |
| 自动实现 RBAC、租户隔离 | 不支持         | 需要应用层权限与数据隔离设计                               |

还有一个重要边界：Event Streaming 提供的是运行时事件与投影，不等于完整的可观测性平台。

## 十、 最终总结：应该怎样学习与实战？

1. Pregel Engine：执行图、推进节点任务、更新状态。
2. 底层 Streaming：选择并暴露 messages、updates、values、tools 等原始执行信息。
3. ProtocolEvent：将执行数据规范化成包含 seq、method、namespace、data 的事件封装。
4. Event Router：把事件交给注册的 Transformer。
5. StreamTransformer：观察事件、累积数据、生成自定义投影。
6. Event Stream：向应用提供 messages、values、subgraphs、output、extensions 等接口。
7. 应用层：实现 UI、进度条、工具活动、日志、审计、权限与远程推送。

实时观察、状态持久化、历史审计和远程传输是不同职责。要构建自主可控的 Agent 平台，需要将它们通过明确的接口组合起来，而不是把所有能力都寄托在一个 Streaming API 上。

##

1. Python的构成（需要整体了解），现在的教程都是从变量开始，没有全局观念；
2. 有哪些标准库，都是干什么的；
3. 哪些标准库是常用的？哪些是不常用的？哪些是被淘汰的？
