# langGraph-3.8-子图(Subgraph)

Subgraph（子图）就是一个被当作节点使用的 Graph。

- 普通 Node: 执行一个函数。
- Subgraph Node: 执行一套完整的 Graph 工作流。
- Parent Graph（父图）: 负责整体流程调度。
- Subgraph（子图）: 负责某个相对独立的业务流程。

❗本质: Subgraph 是一种工作流的模块化、组合化机制。

## 二、层级关系: Subgraph 在整个 LangGraph 中处于什么位置？

```bash
                      user Request
                            ↓
                      Parent Graph/主图
                            ↓
                       Router/路由节点
                            │
    ┌───────────────────────┼───────────────────────┐
    ↓                       ↓                       ↓
QSL Agent Subgraph     RAG Agent Subgraph       Report Agent Subgraph
   子图1                    子图2                    子图3

    ↓                       ↓                       ↓
    └───────────────────────┼───────────────────────┘
                            ↓
                        主图后续节点
                            ↓
                        Final output
```

❗注意: Subgraph 不是 Agent 的同义词。
❗Agent 可以通过 create_agent() 构建，而 create_agent() 底层会生成 LangGraph 图。因此，Agent 可以作为 Subgraph 使用，但 Subgraph 也可以是普通的、没有 LLM 的业务工作流。

## 三、为什么需要 Subgraph？

1. 复杂流程拆分，降低单图复杂度;
2. 复用工作流;
3. 支持团队独立开发;
4. 支持多 Agent 协作; 多 Agent ≠ 必须使用 Subgraph。

   有些 Agent 可以通过 Tool 形式调用，有些适合直接作为 Graph Node，还有些适合封装成独立 Subgraph。选择取决于状态共享、复用、持久化和调度需求。

## 四、工作原理: 父图和子图如何通信？

LangGraph 提供两种通信模式:

- 模式 A: 在父图 Node 内调用 Subgraph
  适用: 父图和子图的 State Schema 不同，或者需要转换数据。
  优点: 边界清晰、数据隔离、输入输出可控。

  ```python
    def call_subgraph(state: ParentState):
        sub_input = {"bar": state["foo"]}
        result = subgraph.invoke(sub_input)
        return {"foo": result["bar"]}
  ```

- 模式 B: 直接把 Subgraph 添加为父图的 Node
  适用: 父图与子图共享 State Key。
  `builder.add_node("child", subgraph)`
  优点: 代码简洁，适合基于共享 messages 的多 Agent 架构。
  缺点: 模块之间耦合更高，需要注意 State Key 的管理和数据污染。

## 五、代码解读: 从构建到调用

### 模式 A: 不同 State Schema

```python
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# ===== 子图 State =====
class SubgraphState(TypedDict):
    bar: str

def subgraph_node(state: SubgraphState):
    return {"bar": "hi! " + state["bar"]}

# ===== 构建子图 =====
sub_builder = StateGraph(SubgraphState)
sub_builder.add_node("process", subgraph_node)
sub_builder.add_edge(START, "process")
sub_builder.add_edge("process", END)
subgraph = sub_builder.compile()


# ===== 父图 State =====
class ParentState(TypedDict):
    foo: str

def call_subgraph(state: ParentState):
    # 1. 父图 State → 子图输入
    subgraph_input = {"bar": state["foo"]}
    # 2. 调用子图
    subgraph_output = subgraph.invoke(subgraph_input)
    # 3. 子图输出 → 父图 State 更新
    return {"foo": subgraph_output["bar"]}

# ===== 构建父图 =====
parent_builder = StateGraph(ParentState)
parent_builder.add_node("call_subgraph", call_subgraph)
parent_builder.add_edge(START, "call_subgraph")
parent_builder.add_edge("call_subgraph", END)
graph = parent_builder.compile()

# ===== 执行 =====
result = graph.invoke({"foo": "world"})
print(result)
# {'foo': 'hi! world'}
```

### 模式 B: 共享 State，直接添加子图

```python
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    foo: str

def subgraph_node(state: State):
    return {"foo": "hi! " + state["foo"]}

# ===== 子图 =====
sub_builder = StateGraph(State)
sub_builder.add_node("process", subgraph_node)
sub_builder.add_edge(START, "process")
sub_builder.add_edge("process", END)
subgraph = sub_builder.compile()

# ===== 父图 =====
parent_builder = StateGraph(State)
# 直接添加编译后的子图
parent_builder.add_node("child", subgraph)
parent_builder.add_edge(START, "child")
parent_builder.add_edge("child", END)

graph = parent_builder.compile()

result = graph.invoke({"foo": "world"})
print(result)
# {'foo': 'hi! world'}
```

## 六、自主可控性: 重点关注 Subgraph Persistence

Subgraph 的持久化分成三种模式:

| 模式           | 配置                      | 含义                           |
| -------------- | ------------------------- | ------------------------------ |
| Per-invocation | checkpointer=None（默认） | 每次调用重新开始               |
| Per-thread     | checkpointer=True         | 同一个 Thread “跨调用”保留状态 |
| Stateless      | checkpointer=False        | 不保存检查点                   |

### 6.1 Per-invocation: 每次调用独立

`subgraph = builder.compile()`
特点:

- 每次调用子图，内部 State 从头开始。
- 不保留上一次调用的对话历史。
- 单次调用过程中仍可继承父图 Checkpointer。
- 支持 Interrupt、持久化执行以及并行调用。
  适用场景: SQL 查询 Agent、一次性文档分析、独立任务委派。

### 6.2 Per-thread: 同一 Thread 保留记忆

`subgraph = builder.compile(checkpointer=True)`
特点:

- 同一个 Thread 下，子图状态跨调用积累。
- 子 Agent 能够记住之前的交互。
- 支持 Interrupt、状态检查与持久化。
- 同一个带状态的子图不适合在同一个节点内被并行调用，可能产生 Checkpoint Namespace 冲突。
  适用场景: 持续对话的研究 Agent、跨轮次的代码助手、需要积累上下文的专业 Agent。

### 6.3 Stateless: 无检查点

`subgraph = builder.compile(checkpointer=False)`
特点:

- 不创建 Checkpoint。
- 不支持 Interrupt / Resume。
- 不支持持久化恢复。
- 执行失败后，通常需要从头运行。
  适用场景: 简单、确定性的轻量计算流程。

### 6.4 三种模式的能力矩阵

| 能力                     | Per-invocation(None) | Per-thread(True) | Stateless(False) |
| ------------------------ | -------------------- | ---------------- | ---------------- |
| 单次调用内 Interrupt     | ✅                   | ✅               | ❌               |
| 跨调用记忆(保留上次记忆) | ❌                   | ✅               | ❌               |
| 持久化恢复               | ✅                   | ✅               | ❌               |
| 多次调用不同子图         | ✅                   | ✅               | ✅               |
| 同一节点并行调用同一子图 | ✅                   | ⚠️               | ✅               |
| 子图状态检查             | 当前调用             | 跨调用状态       | ❌               |

### 6.5 父图和子图的 Checkpointer 关系

子图的持久化行为不能脱离父图的 Checkpointer 独立理解。

文档指出:

- 父图必须编译时配置 Checkpointer，子图的持久化功能才能正常工作。
- Per-invocation 子图默认继承父图的 Checkpointer，以支持单次调用内的 Interrupt 和 Durable Execution。
- Per-thread 子图通过 checkpointer=True 开启跨调用状态积累。
- Stateless 子图通过 checkpointer=False 禁用检查点。

### 6.6 状态检查与调试

```python
state = graph.get_state(
    config,
    subgraphs=True,
)

subgraph_state = state.tasks[0].state
```

- 父图自己的状态 → state.values
- 子图的状态 → state.tasks[0].state.values（前提是有挂起的子图任务）

get_state 返回的外层对象永远属于父图。你拿 state 本身就是父图的快照，拿 state.tasks[...].state 才是子图的。

- 如果子图被静态识别为 Graph Node，或者在某个 Node 内直接调用，LangGraph 可以发现并检查子图状态。
- 如果子图藏在 Tool Function 或其他间接调用中（例如某些 Subagent-as-Tool 模式），就无法通过这种方式静态检查内部状态。

## 七、 总结: 建立正确的 Subgraph 心智模型

- Subgraph = Graph 的组合与模块化机制
- Parent Graph 负责全局调度。
- Subgraph 负责局部复杂工作流。
- State Schema 决定父子图之间如何通信。
- Checkpointer 决定子图状态是否持久化。
- Per-invocation / Per-thread / Stateless 决定子图每次调用的状态生命周期。

建议你记住这五条:

1. Subgraph 不只是嵌套 Graph，更是工作流模块化的核心机制。
2. 父图和子图可以共享 State，也可以通过 Wrapper 实现状态隔离。
3. Agent 可以作为 Subgraph，但 Subgraph 不一定是 Agent。
4. Checkpointer 决定子图是否跨调用保留状态；不要把持久化与 Agent 自主性混为一谈。
5. Subgraph 只解决编排与模块化，权限、数据隔离、记忆策略、审计与安全边界仍需开发者设计。
