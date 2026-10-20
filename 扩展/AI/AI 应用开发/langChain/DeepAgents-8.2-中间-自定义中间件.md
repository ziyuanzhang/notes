# DeepAgents-8.2-中间-自定义中间件

Agent 负责完成任务，Middleware 负责在任务执行过程中观察、修改、限制或干预执行过程。

## 一、先建立整体层级关系

```bash
create_agent(...)
    │
    ├── Model: 使用什么大模型
    │
    ├── Tools: 智能体可以调用哪些工具
    │
    ├── State Schema: 智能体运行状态有哪些字段
    │
    └── Middleware: 执行过程中的控制与扩展
            │
            ├── 1. Node-style hooks
            │      └── 在指定执行节点运行
            │
            ├── 2. Wrap-style hooks
            │      └── 包裹模型调用或工具调用
            │
            ├── 3. State updates
            │      └── 更新智能体状态
            │
            ├── 4. Agent jumps
            │      └── 提前结束或跳转到指定节点
            │
            ├── 5. Dynamic behavior
            │      ├── 动态提示词
            │      ├── 动态模型选择
            │      └── 动态工具筛选
            │
            └── 6. Composition
                   └── 多个中间件组合执行
```

自定义中间件可以采用装饰器函数，也可以采用 AgentMiddleware 类；复杂的中间件还能扩展状态结构、注册工具或配置流转换器。

## 二、核心知识点 1: Node-style hooks 🆚 Wrap-style hooks ？

- Node-style: 负责阶段性逻辑
  1. 例如: 调用前检查、调用后统计、状态更新、判断是否终止。
  2. 关键词: 在什么时候执行？

- Wrap-style: 负责调用级控制
  1. 例如: 重试、切换模型、修改请求、缓存、拦截工具调用。
  2. 关键词: 这次调用具体怎么执行？

官方文档给出的基本选择原则: 日志和验证通常使用 Node-style；重试、回退与缓存通常使用 Wrap-style。

### 2.1 Node-style hooks: 在指定节点执行逻辑

| Hook         | 什么时候执行          | 常见用途               |
| ------------ | --------------------- | ---------------------- |
| before_agent | 一次 Agent 调用开始前 | 初始化、记录调用信息   |
| before_model | 每次调用模型之前      | 检查调用次数、校验状态 |
| after_model  | 每次模型返回之后      | 记录调用结果、更新计数 |
| after_agent  | 一次 Agent 调用结束后 | 记录耗时、保存执行结果 |

```bash
from typing import Any

from langchain.agents.middleware import (
    AgentState,
    before_model,
)
from langgraph.runtime import Runtime


@before_model
def check_message_count(
    state: AgentState,
    runtime: Runtime,
) -> dict[str, Any] | None:
    if len(state["messages"]) >= 50:
        print("对话消息过多，需要提前终止")

    return None
```

### 2.2 Wrap-style hooks: 把一次调用包裹起来

它与 Node-style 的本质区别是: Wrap-style 不只是观察调用前后的情况，还可以控制被包裹的调用是否执行、执行几次，以及以什么参数执行。

| Hook            | 包裹的对象 | 典型用途                         |
| --------------- | ---------- | -------------------------------- |
| wrap_model_call | 模型调用   | 重试、模型切换、修改提示词、缓存 |
| wrap_tool_call  | 工具调用   | 工具调用监控、错误处理、参数检查 |

```bash
Agent 准备调用模型
        ↓
  wrap_model_call
        ↓
  handler(request)
        ↓
    实际模型调用
        ↓
    返回模型结果
        ↓
  wrap_model_call
        ↓
  返回给 Agent
```

❗其中 handler 是理解 Wrap-style 的关键。你可以把它理解为: 框架传给中间件的“下一步执行入口”。调用它，就会继续执行被包裹的模型或工具操作。

- demo

```python
from collections.abc import Callable
from langchain.agents.middleware import (ModelRequest,ModelResponse,wrap_model_call,)

@wrap_model_call
def retry_model(
request: ModelRequest,
handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    for attempt in range(3): # 串行，不是并行；和js的for、forEach不一样
        try:
            return handler(request) # 成功，直接终止
        except Exception as exc:
            if attempt == 2:
                raise # 不出错误，终止

            print(f"第 {attempt + 1} 次执行失败: {exc}")
```

- Callable 的通用格式是: Callable[[输入参数类型], 返回值类型]
- handler 不一定只调用一次: 中间件在满足相应返回类型的前提下，可以跳过底层调用，直接给出结果

## 三、核心知识点 2: State、Runtime、Request、Handler 分别是什么？

| 名称     | 在中间件中的作用                                    | 记忆方式             |
| -------- | --------------------------------------------------- | -------------------- |
| state    | 当前 Agent 的状态，例如消息历史、计数器、自定义字段 | 智能体当前保存着什么 |
| runtime  | 本次运行可访问的运行时信息                          | 当前运行环境提供什么 |
| request  | 当前模型调用请求，包含可供中间件检查和修改的信息    | 准备把什么交给模型   |
| handler  | 执行被包裹的下一步操作                              | 如何真正执行调用     |
| response | 模型或工具操作产生的结果                            | 执行后得到了什么     |

- 避免把三种不同概念混在一起:
  - State 是 Agent 执行过程中的状态。
  - Runtime 是运行时环境。
  - Request 是当前模型调用的请求对象

## 四、核心知识点 3: 中间件如何修改 Agent State？

### 4.1 Node-style: 直接返回字典

```python
from typing_extensions import NotRequired
from langchain.agents.middleware import AgentState
# -------- 扩展状态结构:  -----------------------
class TrackingState(AgentState):
    model_call_count: NotRequired[int]
# --------- 模型调用完成之后增加计数: ------------------------------
from typing import Any
from langchain.agents.middleware import after_model
from langgraph.runtime import Runtime

@after_model(state_schema=TrackingState)
def increment_counter(
    state: TrackingState,
    runtime: Runtime,
) -> dict[str, Any] | None:
    return {
        "model_call_count": (
            state.get("model_call_count", 0) + 1
        )
    }
# ---------- 返回:  ----------------------------------------
{"model_call_count": 1}
```

并不是说整个 Agent State 被替换成这个字典，而是将返回内容作为状态更新，按照对应字段的 reducer 规则合并到状态中。

### 4.2 Wrap-style: 返回 ExtendedModelResponse 和 Command

Wrap-style 处于模型调用的包裹层。如果要在模型结果之外注入状态更新，就需要使用文档给出的扩展返回对象。

```python
from collections.abc import Callable
from typing_extensions import NotRequired

from langagents_placeholder import unused
# ---------------------------------------------
from langchain.agents.middleware import (
    AgentState,
    ExtendedModelResponse,
    ModelRequest,
    ModelResponse,
    wrap_model_call,
)
from langgraph.types import Command
# -----------------------------------------------
class UsageState(AgentState):
    last_model_call_tokens: NotRequired[int]
# -----------------------------------------------------
@wrap_model_call(state_schema=UsageState)
def track_usage(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ExtendedModelResponse:
    response = handler(request)

    return ExtendedModelResponse(
        model_response=response,
        command=Command(
            update={"last_model_call_tokens": 150}
        ),
    )
```

- 注意两个概念:
  - model_response: 模型原本返回的结果。
  - command: 随本次调用一起提交的状态更新指令。

- 对于 wrap_tool_call，文档规定可以直接返回 Command 来注入状态更新。具体的返回类型与更新方式需要与工具调用接口匹配

### 4.3 为什么要关注 Reducer？

Reducer 决定状态更新如何与原状态合并。

```bash
Middleware 返回更新
         ↓
      Command
         ↓
   Graph Reducer
         |
         +-- messages: 可以采用追加合并
         |
         +-- 普通字段: 按照对应规则更新
         ↓
      新的 Agent State
```

- 三个组合规则:
  1. 更新通过 Reducer 应用。 每个 Command 都会成为相应的状态更新。
  2. 外层中间件在字段冲突时优先。 对非 Reducer 决定的普通字段，示例中采用内部先应用、外部后应用的顺序，因此外层值胜出。
  3. 重试会丢弃先前尝试中的状态更新。 如果外层中间件再次调用 handler() 重试，先前调用产生的相关 Command 不会被简单重复累积。

## 五、核心知识点 4: 装饰器 🆚 类

### 5.1 装饰器方式: 一个简单函数就是一个中间件

- 适合:
  - 只有一个 Hook。
  - 功能简单，不需要太多配置。
  - 快速验证方案。

- 常用装饰器:

  | 装饰器           | 用途               |
  | ---------------- | ------------------ |
  | @before_agent    | Agent 启动前执行   |
  | @before_model    | 模型调用前执行     |
  | @after_model     | 模型返回后执行     |
  | @after_agent     | Agent 结束后执行   |
  | @wrap_model_call | 包裹模型调用       |
  | @wrap_tool_call  | 包裹工具调用       |
  | @dynamic_prompt  | 动态生成系统提示词 |

### 5.2 类方式: 适合完整、可配置的中间件

```python
from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
)
from langgraph.runtime import Runtime


class LoggingMiddleware(AgentMiddleware):

    def before_model(
        self,
        state: AgentState,
        runtime: Runtime,
    ):
        print(
            f"即将调用模型，当前消息数: "
            f"{len(state['messages'])}"
        )
        return None

    def after_model(
        self,
        state: AgentState,
        runtime: Runtime,
    ):
        print("模型调用完成")
        return None
```

- 适合:
  - 一个中间件需要实现多个 Hook。
  - 同时需要同步和异步实现，例如 before_model 与 abefore_model。
  - 需要在初始化时配置阈值、模型或其他参数。
  - 需要扩展 State Schema，或者注册额外工具、流转换器。

- 类还可以声明一些重要属性:

  | 属性         | 意义                          |
  | ------------ | ----------------------------- |
  | state_schema | 为 Agent State 添加自定义字段 |
  | tools        | 注册随中间件提供的工具        |
  | transformers | 注册流转换器工厂              |

  这些是框架在配置或编译阶段能够识别的类属性，并不意味着每一个中间件都需要全部声明。

## 六、核心知识点 5: 自定义 State Schema 与提前跳转

### 6.1 扩展状态，并在多个 Hook 之间共享信息

```bash
AgentState
    ├── messages             # 原有的消息状态
    ├── model_call_count     # 自定义: 模型调用次数
    └── user_id              # 自定义: 用户标识
```

通过继承 AgentState，就能描述这些额外字段，再通过 state_schema 把结构关联到对应 Hook 或中间件。
这使中间件能够完成跨阶段逻辑:

```bash
before_model
     |
     ├── 读取 model_call_count
     ├── 判断是否超过限制
     └── 决定继续还是终止
                ↓
            模型调用
                ↓
after_model
     |
     └── 更新 model_call_count
```

这比直接在每一个业务 Agent 中重复编写相同的计数代码更容易维护。

### 6.2 jump_to: 控制 Agent 的执行路线

| jump_to | 作用                      |
| ------- | ------------------------- |
| "end"   | 跳到 Agent 执行结束的位置 |
| "tools" | 跳到工具节点              |
| "model" | 跳到模型节点              |

```python
from typing import Any
from langchain.agents.middleware import (
    AgentState,
    after_model,
    hook_config,
)
from langchain.messages import AIMessage
from langgraph.runtime import Runtime

@after_model
@hook_config(can_jump_to=["end"])
def block_response(
    state: AgentState,
    runtime: Runtime,
) -> dict[str, Any] | None:
    last_message = state["messages"][-1]

    if "BLOCKED" in last_message.content:
        return {
            "messages": [
                AIMessage("无法处理该请求。")
            ],
            "jump_to": "end",
        }

    return None
```

❗使用 jump_to 时需要通过 can_jump_to 或类方法上的 hook_config 声明允许的跳转目标。不是任意返回一个字符串就能随意跳到任何位置。

## 七、多中间件如何组合？顺序非常重要

- 根据文档规定:
  - `before_*`: 按照列表顺序执行。
  - `after_*`: 按照列表的逆序执行。
  - `wrap_*`: 形成嵌套调用，列表中靠前的中间件包裹后续中间件。

- 执行流程图

```bash
middleware=[
    middleware1,
    middleware2,
    middleware3,
]
# ---------------------------------
Agent 开始
    ↓
middleware1.before_agent
    ↓
middleware2.before_agent
    ↓
middleware3.before_agent
    ↓
      Agent Loop
          ↓
middleware1.before_model
          ↓
middleware2.before_model
          ↓
middleware3.before_model
          ↓
+----------------------------------+
| middleware1.wrap_model_call      |
|    +--------------------------+  |
|    | middleware2.wrap_model   |  |
|    |    +-----------------+   |  |
|    |    | middleware3     |   |  |
|    |    |   调用模型       |   |  |
|    |    +-----------------+   |  |
|    +--------------------------+  |
+----------------------------------+
          ↓
middleware3.after_model
          ↓
middleware2.after_model
          ↓
middleware1.after_model
          ↓
      Agent 结束
          ↓
middleware3.after_agent
          ↓
middleware2.after_agent
          ↓
middleware1.after_agent
```

❗先后顺序要由业务语义决定，不要只根据文件名称排序。

## 八、文档后半部分的六类实战能力

### 8.1 动态提示词: 在运行时给模型补充上下文

文档示例通过 request.system_message 读取系统消息，再追加额外上下文。
这里要注意: system_message 是 SystemMessage 对象，不应该当成普通字符串直接拼接。应当通过 content_blocks 保留原有内容结构，再构造新的 SystemMessage。

```python
from collections.abc import Callable

from langchain.agents.middleware import (
    ModelRequest,
    ModelResponse,
    wrap_model_call,
)
from langchain.messages import SystemMessage


@wrap_model_call
def add_context(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    content = list(
        request.system_message.content_blocks
    )

    content.append({
        "type": "text",
        "text": "回答时优先使用当前用户有权限访问的知识。",
    })

    new_system_message = SystemMessage(
        content=content
    )

    return handler(
        request.override(
            system_message=new_system_message
        )
    )
```

### 8.2 动态模型选择：按任务切换不同模型

`return handler(request.override(model=selected_model))`

### 8.3 动态工具筛选：只暴露当前需要的工具

筛选已经注册的工具, 根据当前用户的权限与任务

```bash
所有已注册的工具
        ↓
按状态与上下文筛选
        ↓
当前模型可见的工具
        ↓
模型选择工具并发起调用
```

### 8.4 工具调用监控：观察工具调用的输入和结果

### 8.5 提示词缓存：减少重复处理成本

### 8.6 Trace Policy 与 Stream Transformers

- Trace Policy（追踪策略）: 用于控制中间件的输入和输出如何记录进追踪数据。例如，可以在追踪中省略某个 Hook 的完整输入，以避免记录大量无助于排查问题的消息历史。
- Stream Transformers（流转换器）: 用于把实时 Agent 流中的事件转换成自定义的类型化扩展通道，可以用于显示工具活动、传递部分结果，或实现特定的数据脱敏处理。

## 九、实战：写一个限制模型调用次数的中间件

❗最关键的区别：agent.invoke() 是启动一次 Agent 执行；模型调用循环由 Agent 内部负责。

```python
from langchain.agents import create_agent
from langchain.tools import tool
from langchain.agents.middleware import (
    AgentState,
    before_model,
    after_model,
)
from langchain.messages import AIMessage
from typing import Any
from typing_extensions import NotRequired
from langgraph.runtime import Runtime


# 1. 自定义 State
class AppState(AgentState):
    model_call_count: NotRequired[int]


# 2. 模型调用前检查次数
@before_model(state_schema=AppState, can_jump_to=["end"])
def enforce_call_limit(
    state: AppState,
    runtime: Runtime,
) -> dict[str, Any] | None:
    count = state.get("model_call_count", 0)

    print(f"即将调用模型，当前已调用 {count} 次")

    if count >= 10:
        return {
            "messages": [
                AIMessage("已达到本次执行的模型调用上限。")
            ],
            "jump_to": "end",
        }

    return None


# 3. 模型返回后，增加计数
@after_model(state_schema=AppState)
def increment_call_count(
    state: AppState,
    runtime: Runtime,
) -> dict[str, Any] | None:
    count = state.get("model_call_count", 0) + 1
    print(f"模型调用完成，累计 {count} 次")
    return {"model_call_count": count}


# 4. 定义一个工具
@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气。"""
    print(f"执行天气工具：{city}")
    return f"{city}今天晴天，气温 25°C"


# 5. 创建 Agent
agent = create_agent(
    model=your_chat_model,  # 替换为已配置的聊天模型
    tools=[get_weather],
    middleware=[
        enforce_call_limit,
        increment_call_count,
    ],
)


# 6. 只调用一次 invoke
result = agent.invoke({
    "messages": [
        ("human", "查询北京天气，并告诉我是否适合出门。")
    ],
    "model_call_count": 0,
})

print(result["messages"][-1].content)
print("本次模型调用总数：", result["model_call_count"])

# ------- 整个过程只执行了一次： agent.invoke(...)-----------------
# 即将调用模型，当前已调用 0 次
# 模型调用完成，累计 1 次
# 执行天气工具：北京
#
# 即将调用模型，当前已调用 1 次
# 模型调用完成，累计 2 次
#
# 本次模型调用总数：2
```

## 十、放到你的企业 AI 项目中，应该怎样设计？

```bash
Enterprise Agent
    |
    ├── 1. Observability（可观测性）
    │      ├── 调用日志
    │      ├── 执行耗时
    │      ├── 工具调用记录
    │      └── 模型用量
    │
    ├── 2. Control（执行控制）
    │      ├── 调用上限
    │      ├── 异常重试
    │      ├── 超时与回退
    │      └── 提前终止
    │
    ├── 3. Context & Routing（上下文与路由）
    │      ├── 动态提示词
    │      ├── 模型选择
    │      ├── 工具筛选
    │      └── 检索上下文注入
    │
    └── 4. Governance（治理与安全）
           ├── 工具调用权限检查
           ├── 敏感信息处理
           ├── 输出检查
           └── 审计与合规记录
```

建议分阶段落地：

- 第一阶段：先能看见 Agent 做了什么。

  实现模型调用日志、工具调用日志、执行耗时与调用次数。先把一次请求的执行轨迹理清楚，再做复杂控制。

- 第二阶段：让 Agent 可以被控制。

  实现模型调用上限、针对瞬时故障的重试和明确的提前终止条件。对可能产生副作用的工具，区分模型重试和工具重试。

- 第三阶段：增加动态能力。

  实现动态提示词、按任务选择模型、按权限和场景筛选工具，再根据需要加入 RAG 上下文。

- 第四阶段：补足生产治理。

  将用户身份、租户边界、工具资源权限、审计持久化和用量配额落实到完整调用链。中间件可以承担其中一部分，但不应该把所有安全职责都压在中间件上。

## 总结

Node-style 让你在执行流程的指定阶段插入逻辑；
Wrap-style 让你介入具体调用。
State 负责保存执行状态，
Reducer、Hook 顺序与跳转规则决定这些逻辑组合起来之后究竟会发生什么。
