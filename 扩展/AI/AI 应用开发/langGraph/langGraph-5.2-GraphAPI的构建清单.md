# langGraph-5.2-GraphAPI的构建清单（技术实现）

《Thinking in the Graph API》讲的是如何`思考和设计`一个 Graph；《Build checklist for the Graph API》讲的是设计完成后，如何`逐项落实`为 LangGraph 的 API。

先定义数据如何共享，再设计执行流程，然后决定是否需要动态调度或组合控制，接着配置运行机制，最后验证图结构。

## 一、概念理解

1. 它实际上把 Graph API 的设计分成了五个层次：
   1. State：数据层——节点之间共享什么数据？
   2. Control Flow：流程层——节点按照什么规则执行？
   3. Send / Command：动态控制层——静态流程不够时如何扩展？
   4. Runtime：运行保障层——如何处理失败、超时、缓存和依赖？
   5. Visualization：可视化层——如何检查图结构？

2. 五个步骤之间的关系
   - Step 1：Define shared state: 定义共享数据及更新规则
   - Step 2：Choose control flow: 定义顺序、分支、并行、循环
   - Step 3：Send / Command: 解决动态分发及组合式控制
   - Step 4：Configure nodes: 配置可靠性、性能及运行依赖
   - Step 5：Visualize:检查图结构和路由逻辑

## 二、为什么需要这套设计流程？

- State 和流程混在一起
- 过度使用 Command
- 错误地理解并行
- 忽略运行时机制

## 三、Step 1：Define shared state（定义共享状态）

### 3.1 Shared State 的作用是

- Node 不需要直接调用其他 Node。
- Node 不需要互相传递函数参数。
- Node 通过 State 获取上游结果。
- Node 返回更新，由 LangGraph 按照字段的 Reducer 规则合并。

可以把 State 理解成整个 Graph 的共享数据中心。

### 3.2 State 的定义方式

| 方式        | 作用       | 特点                                  |
| ----------- | ---------- | ------------------------------------- |
| TypedDict   | 定义 State | Python 类型标注，不负责运行时数据验证 |
| dataclass   | 定义 State | Python 数据类                         |
| StateSchema | 定义 State | ❗LangGraph 的 TypeScript 状态 Schema |

```python
# -- TypedDict --------------------------------
import operator
from typing import Annotated
from typing_extensions import TypedDict

class State(TypedDict):
    foo: int
    bar: Annotated[list[str], operator.add]

# -- dataclass --------------------
import operator
from typing import Annotated
from dataclasses import dataclass, field

@dataclass
class State:
    foo: int = 0
    bar: Annotated[list[str], operator.add] = field(default_factory=list)

```

- Python 定义 State：TypedDict、dataclass（可选 Pydantic）
- TypeScript 定义 State：StateSchema（以及旧的 Annotation API）

### 3.3 Reducer：决定状态如何合并

第一种：没有 Reducer，默认覆盖。  
第二种：定义 Reducer，按照指定规则合并。

### 3.4 为什么并行节点尤其需要 Reducer？

如果没有合理的 Reducer，多个并行任务对同一字段产生更新时，可能发生更新冲突。

注意：

- Reducer 不是锁。
- Reducer 不负责控制 Node 的执行顺序。
- Reducer 负责处理同一 State 字段的更新合并。
- ❗并行更新的合并顺序不应被当成业务排序保证。

### 3.5 Private State 和 Input/Output Schema

- Private State（私有状态）： 有些中间数据只需要在 Graph 内部使用，不应该暴露给外部调用者。
- Input/Output Schema（输入输出 Schema）：可以分别定义外部允许传入的数据和最终允许输出的数据。

```python
class InputState(TypedDict):
    question: str


class OutputState(TypedDict):
    answer: str


class OverallState(TypedDict):
    question: str
    documents: list[str]
    answer: str

# -------------------
builder = StateGraph(
    OverallState,
    input=InputState,
    output=OutputState,
)
```

这样：

- 外部输入只需要提供 question。
- Graph 内部可以使用 documents。
- 外部输出只暴露 answer。

这里需要区分：Schema 控制的是 Graph 的数据接口和字段范围，不等于安全权限系统。真正的敏感数据保护还需要在应用层实施权限控制。

### 这一节总结

State 决定数据结构，Reducer 决定更新合并规则，Input/Output Schema 决定 Graph 对外的数据边界。

## 四、Step 2：Choose control flow（选择控制流程）

数据准备好了，接下来 Node 应该如何执行？

文档将流程归纳为四种：

1. Sequence：顺序执行【固定路由】
2. Branch：条件分支
3. Parallel：并行执行
4. Loop：循环执行

- 四种流程的关系：

  | 流程     | 解决的问题       | 主要 API                 |
  | -------- | ---------------- | ------------------------ |
  | Sequence | 固定顺序执行     | add_edge()               |
  | Branch   | 根据条件选择路径 | add_conditional_edges()  |
  | Parallel | 同时执行多个分支 | 多条边 / Fan-out         |
  | Loop     | 重复执行直到结束 | Conditional Edges / 回边 |

### 4.3 Parallel：并行执行

```text
           START
              ↓
         retrieve
              │
     ┌────────┼────────┐
     ↓        ↓        ↓
  search1  search2  search3
     │        │        │
     └────────┼────────┘
              ↓
           merge
              ↓
             END
```

```python
builder.add_edge(START, "retrieve")

builder.add_edge(
    "retrieve",
    "search1",
)
builder.add_edge(
    "retrieve",
    "search2",
)
builder.add_edge(
    "retrieve",
    "search3",
)

builder.add_edge(
    ["search1", "search2", "search3"],
    "merge",
)
```

### 4.4 Loop：循环执行

循环就是让图中的执行路径形成闭环。

```text
             START
                │
                ↓
             generate
                │
                ↓
              review
                │
           是否合格？
            /      \
          否        是
          │          │
          ↓          ↓
       generate     END
```

```python
def review_result(state: State):
    if state["score"] < 80:
        return "generate"

    return END


builder.add_conditional_edges(
    "review",
    review_result,
)
# -- 递归深度限制 ----------------
graph.invoke(
    input_data,
    config={
        "recursion_limit": 20
    },
)
```

recursion_limit 用来限制图的递归执行深度，防止无限循环。

它不是业务上的循环次数计数器，也不保证某个 Node 恰好执行指定次数。

## 五、Step 3：Send / Command （动态任务分发、状态更新 + 流程控制）

绝大多数 Graph 只需要 Node、Edge、Conditional Edge，就可以完成流程设计。

Send 和 Command 是为了解决更特殊的控制需求。

### 5.1 先理解三者的职责

| 机制             | 核心职责                             | 是否更新 State                      |
| ---------------- | ------------------------------------ | ----------------------------------- |
| Edge             | 固定连接两个节点                     | 否                                  |
| Conditional Edge | 根据条件选择下一个节点               | 否                                  |
| Send             | 动态创建目标节点的执行任务           | 传递任务输入，不直接充当 State 更新 |
| Command          | 在 Node 返回时组合状态更新和控制指令 | 可以                                |

### 5.2 Send：动态任务分发

Send 是 LangGraph 提供的 动态任务调度对象。

```python
from langgraph.types import Send

def generate_joke(state: JokeState):
    subject = state["subject"]

    return {
        "jokes": [
            f"A joke about {subject}"
        ]
    }

def continue_to_jokes(state: OverallState):
    return [
        Send(
            "generate_joke", # 1. 目标 Node。
            {"subject": subject} # 2. 这个 Node 本次执行所使用的输入数据。❗它不要求与整个 Graph 的 State 完全相同。
        )
        for subject in state["subjects"]
    ]

# 逻辑上相当于：
#  [
#      Send("generate_joke", {"subject": "Python"}),
#      Send("generate_joke", {"subject": "Java"}),
#      Send("generate_joke", {"subject": "AI"}),
#      Send("generate_joke", {"subject": "Robot"}),
#  ]

```

<img src="./img/langGraph-5.2-Orchestrator-Worker 模式.png" alt='Orchestrator-Worker 模式' width=800 />

❗Worker 的输入可以是局部 Schema，但 Worker 返回的更新仍然需要符合整个 Graph 的状态更新机制。

如果多个 Worker 都向同一个字段写入结果，就需要合理定义 Reducer。

### 5.3 Command：状态更新 + 流程控制

```python
from typing import Literal
from langgraph.types import Command


def my_node(state: State) -> Command[Literal["my_other_node"]]:

    return Command(
        update={"foo": "bar"}, # 更新 State。
        goto="my_other_node", # goto：指定下一步执行的 Node。
    )

# 这里的 Literal["my_other_node"] 是类型标注，用于声明可能跳转到的目标节点，方便静态类型检查，并不负责实际路由。
```

### 5.4 Command 还有哪些用途？

- 场景一：更新 State 并路由

  ```python
  return Command(
      update={"status": "approved"},
      goto="next_node",
  )
  ```

- 场景二：从 Interrupt 恢复执行

  ```python
  from langgraph.types import Command

  graph.invoke(
      Command(resume=True),
      config=config,
  )
  ```

- 场景三：工具更新 State

  ```python
  @tool
  def lookup_user_info(tool_call_id: Annotated[str, InjectedToolCallId],config: RunnableConfig,):
      """查询用户信息并更新 Graph State。"""
      # 模拟查询逻辑（实际可从 config 或数据库获取）
      user_info = "用户等级：VIP；积分：5200"
      return Command(
          update={
              "user_info": user_info,
              "messages": [
                  ToolMessage(
                      content="用户信息查询成功",
                      tool_call_id=tool_call_id,
                  )
              ],
          }
      )

  builder.add_node("tools", ToolNode([lookup_user_info]))  # ToolNode 自动处理 Command 返回值
  ```

  1. messages、ToolMessage、tool_call_id 必须
  2. 优先使用 ToolNode（也可自定义，麻烦）
  3. 可选：用 goto 控制路由

  🔥 工具返回 Command 的核心价值是：让工具不再只是一个“数据生产者”，而是成为一个能够主动修改上下文、甚至引导流程走向的参与者。

### 5.5 Edge、Conditional Edge、Send、Command 如何选择？

- Edge：固定执行顺序？
- Conditional Edge：根据 State 条件选择路径？
- Send：运行时决定执行多少个相同 Worker，每个 Worker 输入不同？
- Command：一个 Node 需要同时更新 State 和决定下一步，或者执行恢复操作？

* 特别容易误解的地方：
  1. Send 不是 Conditional Edge 的替代品。它主要解决动态任务实例化问题。
  2. Command 也不是 Conditional Edge 的替代品。它解决的是需要将状态更新和控制指令组合起来的问题。

❗另外，Command(goto=...) 并不意味着可以无视已有的静态边。如果一个 Node 同时配置了静态出边和 Command 路由，可能产生多个执行路径。因此不要随意混用，除非你确实希望两种路由都生效。

## 六、Step 4：Configure nodes as needed（配置节点）

- 前三步主要解决：
  - 数据如何组织。
  - 流程如何执行。
  - 如何动态调度和控制。

- 第四步开始考虑生产环境运行保障。

| 能力                     | 解决的问题             |
| ------------------------ | ---------------------- |
| Retry                    | 节点失败后重试         |
| Timeout                  | 限制节点执行时间       |
| Error Handler            | 重试耗尽后执行错误处理 |
| Cache                    | 避免重复执行昂贵操作   |
| Runtime Context / Config | 传递运行依赖和配置     |

- State: 描述 Graph 当前执行到哪里，以及业务数据是什么。
- Runtime Context: 提供执行过程中需要使用的依赖。
- Config: 提供本次执行的配置，例如线程标识、递归限制等。

## 七、Step 5：Visualize the graph（图可视化）

LangGraph 可以将图结构:

1. 输出为 Mermaid：`print( graph.get_graph().draw_mermaid() )`
2. 也可以将图渲染为 PNG：

```python
png_data = graph.get_graph().draw_mermaid_png()

with open("graph.png", "wb") as f:
    f.write(png_data)
```

图可视化只能展示结构，不能完整展示运行时行为。

## 八、能力边界：这套 Graph API 能做什么，不能做什么？

| 能力               | LangGraph 是否负责 | 说明                               |
| ------------------ | ------------------ | ---------------------------------- |
| 节点调度           | 支持               | 按 Graph 结构调度                  |
| 状态管理           | 支持               | State + Reducer                    |
| 条件路由           | 支持               | Conditional Edges                  |
| 动态任务分发       | 支持               | Send                               |
| 状态更新和跳转组合 | 支持               | Command                            |
| 持久化执行状态     | 支持               | Checkpointer                       |
| 跨会话长期存储     | 支持               | Store                              |
| 节点容错           | 支持               | Retry / Timeout / Error Handler    |
| 数据库业务事务     | 不直接负责         | 需要应用自行设计                   |
| 分布式任务队列     | 不等同于           | 不应将 Graph 调度直接理解为 Celery |
| RBAC / 多租户权限  | 不直接负责         | 需要业务层实现                     |
| 完整可观测平台     | 不直接负责         | 需要日志、Tracing、指标等配套      |

这里需要特别区分三个概念：

1. Graph 调度不等于分布式任务调度

   Send 可以动态创建多个 Worker 任务，但不代表它自动提供跨机器的分布式任务队列、任务租约、消息重投等能力。

2. Checkpointer 不等于业务数据库事务

   Graph 可以保存执行检查点，但不代表它可以自动保证数据库扣款、外部 API 调用和 Graph State 三者构成原子事务。

3. Visualization 不等于 Observability

   图结构展示和实际执行监控是两回事。

## 九、对比：Graph API 中容易混淆的设计

1. Edge vs Conditional Edge vs Send vs Command

   能用普通 Edge 解决的，不要轻易使用 Command；能用 Conditional Edge 解决的，也不需要为了路由而引入 Command。

2. State vs Runtime Context vs Config

   | 对比                 | State            | Runtime Context Config |
   | -------------------- | ---------------- | ---------------------- | -------------------------- |
   | 定义                 | 业务执行状态     | 运行依赖               | 执行配置                   |
   | 是否参与节点数据更新 | 是               | 否，作为依赖读取       | 通常不作为业务更新         |
   | 是否适合持久化       | 是               | 通常不需要             | 视具体配置而定             |
   | 示例                 | question、answer | DB、模型客户端         | thread_id、recursion_limit |

3. Parallel vs Send
   - 假设需要执行三个固定任务：使用普通并行边即可。
   - 但如果需要根据用户上传的文件数量，动态决定执行多少个相同的解析任务：此时 Send 更合适。

   Parallel：多个固定的执行分支。

   Send：运行时动态生成多个任务实例。

## 十、总结：建立 Graph API 的整体设计思维

Graph API 五层设计模型

1. 数据层：State

   定义节点之间共享什么数据，以及数据如何合并。

   TypedDict / Reducer / Input Schema / Output Schema / Private State

2. 流程层：Control Flow

   定义节点按照什么规则执行。

   Sequence / Branch / Parallel / Loop

3. 动态控制层：Send / Command

   解决静态流程难以表达的动态任务分发，以及状态更新与路由组合问题。

   Send / Command / goto / resume

4. 运行保障层：Runtime

   处理节点运行过程中的异常、超时、缓存和依赖注入。

   Retry / Timeout / Error Handler / Cache / Context / Config

5. 验证层：Visualization

   检查 Graph 结构是否符合设计预期。

   Mermaid / PNG / Graph Structure

### 在这个架构里：

- State：保存用户请求、执行结果、上下文。
- Edge：组织固定的执行流程。
- Conditional Edge：决定走哪个 Agent。
- Send：需要动态分发多个子任务时使用。
- Command：需要组合状态更新与路由控制时使用。
- Checkpointer：保存执行过程中的检查点。
- Store：保存跨 Thread 的长期数据。
- Runtime Context：提供数据库、模型客户端等依赖。

### 最重要的认识：

Graph API 不是 Agent 专用的 API，而是一个通用的状态化工作流编排框架。

它既可以构建普通业务工作流，也可以构建复杂 Agent、多 Agent 协作、RAG、Human-in-the-loop 等系统。
