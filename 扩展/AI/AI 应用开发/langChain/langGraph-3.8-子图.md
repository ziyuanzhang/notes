# langGraph-3.8-子图(Subgraph)

Subgraph（子图）就是一个被当作节点使用的 Graph。

- 普通 Node：执行一个函数。
- Subgraph Node：执行一套完整的 Graph 工作流。
- Parent Graph（父图）：负责整体流程调度。
- Subgraph（子图）：负责某个相对独立的业务流程。

❗本质：Subgraph 是一种工作流的模块化、组合化机制。

## 二、层级关系：Subgraph 在整个 LangGraph 中处于什么位置？

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

❗注意：Subgraph 不是 Agent 的同义词。
❗Agent 可以通过 create_agent() 构建，而 create_agent() 底层会生成 LangGraph 图。因此，Agent 可以作为 Subgraph 使用，但 Subgraph 也可以是普通的、没有 LLM 的业务工作流。

## 三、为什么需要 Subgraph？

1. 复杂流程拆分，降低单图复杂度;
2. 复用工作流;
3. 支持团队独立开发;
4. 支持多 Agent 协作; 多 Agent ≠ 必须使用 Subgraph。

   有些 Agent 可以通过 Tool 形式调用，有些适合直接作为 Graph Node，还有些适合封装成独立 Subgraph。选择取决于状态共享、复用、持久化和调度需求。

## 四、工作原理：父图和子图如何通信？

LangGraph 提供两种通信模式：

- 模式 A：在父图 Node 内调用 Subgraph
  适用：父图和子图的 State Schema 不同，或者需要转换数据。
  优点：边界清晰、数据隔离、输入输出可控。

  ```python
    def call_subgraph(state: ParentState):
        sub_input = {"bar": state["foo"]}
        result = subgraph.invoke(sub_input)
        return {"foo": result["bar"]}
  ```

- 模式 B：直接把 Subgraph 添加为父图的 Node
  适用：父图与子图共享 State Key。
  `builder.add_node("child", subgraph)`
  优点：代码简洁，适合基于共享 messages 的多 Agent 架构。
  缺点：模块之间耦合更高，需要注意 State Key 的管理和数据污染。

## 五、代码解读：从构建到调用

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

### 模式 B：共享 State，直接添加子图

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

## 六、自主可控性：重点关注 Subgraph Persistence
