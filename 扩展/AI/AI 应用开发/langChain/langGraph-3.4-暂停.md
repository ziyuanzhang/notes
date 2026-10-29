# langGraph-3.4-暂停(Interrupts)

- interrupt(): 负责暂停并向外部提出请求;
- Checkpointer: 负责保存图的执行状态;
- thread_id : 负责定位这次执行;
- Command(resume=...) : 负责把外部输入送回暂停的位置;

四者组合起来，构成 LangGraph 的人工介入机制（Human-in-the-loop，HITL）。

## 一、概念理解：Interrupt 到底是什么？

对于查询操作，通常可以自动执行；但对于删除数据、修改权限、发送邮件、执行付款等高风险操作，通常应该先让人确认。
LangGraph 负责工作流暂停和恢复；具体的审批页面、身份认证、通知、权限校验，需要应用层配合实现。

## 层级关系：Interrupt 在 LangGraph 中处于什么位置？

<img src="./img/langGraph-3.4-暂停.png" alt="langGraph-3.4-暂停.png" width="800" />

| 概念                | 负责什么                       | 不负责什么                       |
| ------------------- | ------------------------------ | -------------------------------- |
| interrupt()         | 在节点中提出暂停请求           | 不负责展示审批页面               |
| Checkpointer        | 持久化图执行状态及恢复所需信息 | 不负责让人批准                   |
| thread_id           | 定位需要恢复的图执行线程       | 不等于用户身份或审批单号         |
| Command(resume=...) | 将外部响应传回中断点           | 不自动验证业务用户是否有审批权限 |
| stream.interrupts   | 向调用方暴露待处理的中断信息   | 不负责把通知送到审批人手机上     |
| response_schema     | 描述、校验恢复输入的结构       | 不替代业务授权与完整的业务规则   |

## 三、为什么需要 Interrupt？它解决了什么问题？

1. 普通工作流无法自然等待人工决策
2. 真实业务需要“执行权”的控制点
3. Interrupt 不是每个节点都需要使用

## 四、工作原理：一次 Interrupt 究竟发生了什么？

<img src="./img/langGraph-3.4-执行顺序拆解.png" alt="langGraph-3.4-执行顺序拆解.png" width="800" />

## a

```python
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import START, END, StateGraph
from langgraph.types import Command, interrupt

class State(TypedDict):
action: str
approved: bool | None

def approval_node(state: State):
approved = interrupt({
"question": "是否批准执行？",
"action": state["action"],
})
return {"approved": approved}

def execute_node(state: State): # 这里只展示流程，不实际执行外部操作
return {"action": f"已批准执行：{state['action']}"}

def cancel_node(state: State):
return {"action": f"已拒绝执行：{state['action']}"}

def route(state: State):
return "execute" if state["approved"] else "cancel"

builder = StateGraph(State)
builder.add_node("approval", approval_node)
builder.add_node("execute", execute_node)
builder.add_node("cancel", cancel_node)

builder.add_edge(START, "approval")
builder.add_conditional_edges(
"approval",
route,
{
"execute": "execute",
"cancel": "cancel",
},
)
builder.add_edge("execute", END)
builder.add_edge("cancel", END)

graph = builder.compile(checkpointer=InMemorySaver())

config = {
"configurable": {
"thread_id": "order-10086"
}
}

# 第一次执行：到达审批节点后暂停

result = graph.invoke(
{
"action": "删除订单 10086",
"approved": None,
},
config=config,
)

print(result["__interrupt__"])

# 恢复执行：模拟人工批准

result = graph.invoke(
Command(resume=True),
config=config,
)

print(result)

```

```

```
