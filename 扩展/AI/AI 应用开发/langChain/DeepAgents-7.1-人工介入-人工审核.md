# DeepAgents-7.1-人工介入-人工审核

```bash
Deep Agents
    │
    ├── Agent Runtime：智能体运行时
    │
    ├── Middleware：运行过程中的控制层
    │     └── HumanInTheLoopMiddleware
    │
    ├── Permissions：哪些操作允许执行
    │
    ├── HITL：哪些操作必须经过人审核
    │     ├── approve：批准
    │     ├── edit：修改参数
    │     ├── reject：拒绝
    │     └── respond：人工提供回复
    │
    ├── Checkpointer：保存中断时的运行状态
    │
    └── Command(resume=...)
          └── 根据人工决定恢复执行
```

Agent 负责提出操作，HITL 负责暂停并等待人工决策，Checkpointer 负责保存可恢复的运行状态，Command 负责把决策交回运行流程。

## 一、解读

### 1.1 Human-in-the-loop：什么是人工介入？

Deep Agents 借助 LangGraph 的 interrupt 能力实现人工介入工作流。

通过 interrupt_on，开发者可以配置哪些工具需要人工审核。当设置该参数时，Deep Agents 会在其 Middleware 栈中加入 HumanInTheLoopMiddleware。

如果一次运行在工具返回结果之前被取消或中断，同一栈中的 PatchToolCallsMiddleware 会自动修复消息历史，避免遗留不完整的工具调用记录。

```bash
用户提出请求
    ↓
Deep Agent 运行
    ↓
LLM 决定调用工具
    ↓
HumanInTheLoopMiddleware
    │
    ├──   当前调用不需要审核
    │            ↓
    │         执行工具
    │
    └──   当前调用需要审核
                 ↓
             暂停运行
                 ↓
             保存状态
                 ↓
             展示审核信息
                 ↓
            人工做出决定
                 │
         +-------+-------+-------+
         │       │       │       │
       approve  edit   reject   respond
         ↓       ↓       ↓       ↓
       执行    修改后   不执行   提供人工
      原操作     执行    并反馈    回复
         │       │       │       │
         +-------+-------+-------+
                 ↓
           Agent 继续运行
```

### 1.2 Basic configuration：基础配置

interrupt_on 接收一个字典，键: 是工具名称，值: 是中断配置。

- 它有三种配置方式：

  | 配置                       | 含义                                              |
  | :------------------------- | :------------------------------------------------ |
  | True                       | 启用中断，默认允许 approve、edit、reject、respond |
  | False                      | 不对该工具启用中断                                |
  | InterruptOnConfig 配置对象 | 自定义允许的审核决策，还可以使用条件判断          |

```python
from langchain.tools import tool
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

@tool
def remove_file(path: str) -> str:
    """Delete a file from the filesystem."""
    return f"Deleted {path}"

@tool
def fetch_file(path: str) -> str:
    """Read a file from the filesystem."""
    return f"Contents of {path}"

@tool
def notify_email(to: str, subject: str, body: str) -> str:
    """Send an email."""
    return f"Sent email to {to}"

@tool
def writes_outside_workspace(request: ToolCallRequest) -> bool:
    """Pause writes to paths outside the workspace directory."""
    path = request.tool_call["args"].get("file_path", "")
    return not path.startswith("/workspace/")

checkpointer = MemorySaver()

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    tools=[remove_file, fetch_file, notify_email],
    interrupt_on={
        "remove_file": True,
        "fetch_file": False,
        "notify_email": {
            "allowed_decisions": ["approve", "reject"]
        },
         "write_file": {  # Conditional interrupts：有条件地中断
            "allowed_decisions": ["approve", "edit", "reject"],
            "when": writes_outside_workspace,
        },
    },
    checkpointer=checkpointer,
)
```

❗拒绝有副作用的操作时使用 reject，不要用 respond 代替拒绝。

### 1.3 Handle interrupts：如何处理中断？

```python
from langchain_core.utils.uuid import uuid7
from langgraph.types import Command

config = {
    "configurable": {
        "thread_id": str(uuid7())
    }
}
result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "Delete the file temp.txt"
            }
        ]
    },
    config=config,
)
# =========== 第一步：检查是否发生中断 =========================
if result.get("__interrupt__"):
    interrupt_value = result["__interrupt__"][0].value

    action_requests = interrupt_value["action_requests"]
    review_configs = interrupt_value["review_configs"]

# ================ 第二步：提交人工决定 =========================
decisions = [
    {
        "type": "reject",
        "message": ( # message 是拒绝反馈，用来告诉 Agent 为什么不能继续执行。
            "User rejected deleting temp.txt. "
            "Do not retry deletion."
        ),
    }
]
# ================ 第三步：恢复运行 =========================
result = agent.invoke(
    Command(resume={"decisions": decisions}),
    config=config,
)
# ================= 第四步：读取最终结果 =================
print(result["messages"][-1].content)
```

- 第一步：有三个重要概念：

  | 字段            | 作用                           |
  | :-------------- | :----------------------------- |
  | **interrupt**   | 检查本次运行是否产生中断       |
  | action_requests | 查看等待审核的工具操作及其参数 |
  | review_configs  | 查看每个操作允许哪些审核决策   |

- 第三步：是 HITL 的核心。
  - Command(resume=...)：提交人工决定，恢复被暂停的流程。
  - config：使用原来相同的配置，特别是相同的 thread_id。
  - Agent：根据恢复后的状态继续运行。
    注意：恢复时不是重新发送一次“删除文件”的用户请求，而是向已有的中断流程提交恢复信息。

### 1.4 Handle interrupts with streaming：流式处理中断

```python
agent.stream(
    ...,
    stream_mode=["messages", "updates"],
)
```

- 两种模式分别负责不同的事情：

| Stream mode | 作用                           |
| ----------- | ------------------------------ |
| messages    | 实时输出模型消息或 token       |
| updates     | 获取运行状态更新，包括中断信息 |

```bash
Agent 开始运行
      │
      ├── messages
      │       └── 向用户流式展示模型输出
      │
      └── updates
              └── 监听运行状态
                      ↓
                发现 __interrupt__
                      ↓
                暂停并展示审核界面
                      ↓
                收集人工决策
                      ↓
                Command(resume=...)
                      ↓
                继续流式运行
```

- while True，原因是一次恢复后还可能再次触发中断。
- 普通的 interrupt_on 审核中断，恢复时通常使用：`Command(resume={"decisions": [...]})`;
- 如果同时存在多个并行分支中的中断，则可能需要按照中断 ID 分别提供恢复值.

### 1.5 Multiple tool calls：多个工具同时需要审核

- 多个需要审核的工具调用，可以被合并到同一个中断中。

```python
decisions = [
    {"type": "approve"}, # 1
    {                  # 2
        "type": "reject",
        "message": (
            "User rejected this action. "
            "Do not retry this tool call."
        ),
    },
]
```

🔥 1、2 的顺序很重要

### 1.6 Rejection messages：拒绝后如何反馈

如果不提供 message，系统也会提供默认拒绝反馈，说明工具没有执行，并提示模型除非用户另行要求，否则不要重试同一个操作。

### 1.7 Edit tool arguments：人工修改工具参数

```python
decisions = [
    {
        "type": "edit",
        "edited_action": {
            "name": action_request["name"],
            "args": {
                "to": "team@company.com",
                "subject": "...",
                "body": "...",
            },
        },
    }
]
```

这里需要提供：

- name：对应的工具名称。
- args：修改后的工具参数。

### 1.8 Subagent interrupts：子智能体也能使用 HITL

#### 1.8.1 子智能体的工具审核配置

```python
agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    tools=[delete_file, read_file],
    interrupt_on={
        "delete_file": True,
        "read_file": False,
    },
    subagents=[
        {
            "name": "file-manager",
            "description": "Manages file operations",
            "system_prompt": "You are a file management assistant.",
            "tools": [delete_file, read_file],
            "interrupt_on": {
                "delete_file": True,
                "read_file": True,
            },
        }
    ],
    checkpointer=checkpointer,
)
```

主 Agent 不要求审核 read_file，但 file-manager 子智能体要求审核 read_file。

子智能体触发的中断也会通过父 Agent 的结果或流式更新暴露出来，不需要为了传递中断专门设置 subgraphs=True。如果希望流式展示子智能体自身的 token 和进度，则可以启用 subgraphs=True。

#### 1.8.2 在工具内部主动请求人工批准

```python
from langgraph.types import interrupt

def request_approval(action_description: str) -> str:
    approval = interrupt({
        "type": "approval_request",
        "action": action_description,
        "message": (
            f"Please approve or reject: {action_description}"
        ),
    })

    if approval.get("approved"):
        return f"Action '{action_description}' was APPROVED."

    return (
        f"Action '{action_description}' was REJECTED. "
        f"Reason: {approval.get('reason', 'No reason provided')}"
    )
```

它和前面的 interrupt_on 有什么区别？

- interrupt_on：在工具调用的外围配置哪些操作需要审核。
- interrupt()：在工具或工作流的内部逻辑中，主动暂停并请求恢复值

### 1.9 Filesystem permission interrupts：文件系统权限也能触发中断

```python
from deepagents import FilesystemPermission, create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

agent = create_deep_agent(
    model=model,
    permissions=[
        FilesystemPermission(
            operations=["write"],
            paths=["/secrets/**"],
            mode="interrupt",
        ),
    ],
    checkpointer=MemorySaver(),
)
```

当 Agent 通过内置文件系统工具写入匹配 /secrets/\*\* 的路径时，系统可以暂停执行并请求人工审核。

## 二、建立完整的层级关系：HITL 在 Deep Agents 中究竟处于什么位置？

Middleware、Permissions、Backend、Runtime、Subagents。

```bash
create_deep_agent(...)
        ↓
+----------------------------------------+
|              Deep Agent                |
|                                        |
|  Agent Runtime                         |
|      |                                 |
|      +---- Model                       |
|      |      └── 决定是否调用工具          |
|      |                                 |
|      +---- Tools                       |
|      |      ├── read_file              |
|      |      ├── write_file             |
|      |      └── delete_file            |
|      |                                 |
|      +---- Middleware                  |
|      |      ├── HumanInTheLoop         |
|      |      ├── PatchToolCalls         |
|      |      └── 其他中间件               |
|      |                                 |
|      +---- Permissions                 |
|      |      └── 控制允许的文件操作        |
|      |                                 |
|      +---- Checkpointer                |
|             └── 保存运行状态             |
+----------------------------------------+
        ↓
   工具调用请求
        ↓
   是否需要人工审核？
        |
        +---- 否 ----> 执行工具
        |
        +---- 是 ----> interrupt
                          ↓
                     保存运行状态
                          ↓
                     人工审核界面
                          ↓
                     审核决定
                          ↓
                  Command(resume=...)
                          ↓
                     恢复 Agent
```

这里要区分三个层次。

1. 第一层：权限控制
   Permissions 解决的是：这个操作是否符合允许执行的权限规则？

   例如，Agent 不应该写入 /secrets/ 下的文件。

2. 第二层：人工审核
   HumanInTheLoopMiddleware 解决的是：这个操作虽然进入了可执行流程，但是否需要先由人决定？

   例如，删除工作区中的文件可能被允许，但仍然要求用户确认。

3. 第三层：状态恢复
   Checkpointer 和 Command(resume=...) 解决的是：人工审核完成之后，如何找到原来的运行并继续执行？

三者不能互相替代。

| 机制                     | 核心职责                                 |
| ------------------------ | ---------------------------------------- |
| Permissions              | 约束允许的操作                           |
| HITL                     | 暂停并等待人工决策                       |
| Checkpointer             | 保存可恢复的运行状态                     |
| Command(resume=...)      | 提交恢复信息                             |
| PatchToolCallsMiddleware | 处理取消或中断后不完整的工具调用消息历史 |

❗特别注意：要求人工审核，不代表自动获得权限；没有触发审核，也不代表操作一定安全。

## 三、总结

1. interrupt_on: 配置哪些工具需要审核，以及审核时允许哪些决策。
2. when: 根据工具调用参数决定是否触发审核，减少不必要的人工干预。
3. `__interrupt__`: 用来检查本次运行是否暂停，以及获取待审核操作的信息。
4. Checkpointer + thread_id: 保存运行状态，并在恢复时定位原来的执行过程。
5. Command(resume=...): 把人工决策提交给被暂停的工作流，恢复执行。
6. Permissions 与 HITL 配合: 权限控制约束操作范围，HITL 提供人工决策，两者共同构成安全执行流程的一部分。
