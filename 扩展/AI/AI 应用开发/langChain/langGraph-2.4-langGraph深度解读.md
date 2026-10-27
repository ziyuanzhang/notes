# langGraph-2.4-langGraph深度解读

## 一、概念理解: LangGraph 到底在解决什么问题？

### 1.1 六个核心概念

| 概念                         | 直观理解                                    | 在代码中的典型形式     |
| ---------------------------- | ------------------------------------------- | ---------------------- |
| Graph（图）                  | 整个工作流                                  | StateGraph(...)        |
| Node（节点）                 | 一个具体任务                                | classify_intent(state) |
| Edge（边）                   | 节点之间的连接                              | add_edge(...)          |
| State（状态）                | 节点之间共享的数据                          | EmailAgentState        |
| Routing（路由）              | 决定下一步执行什么                          | Command、条件边        |
| Checkpointer（检查点保存器） | 保存执行进度，以便后续恢复 MemorySaver() 等 |

其中最关键的是: `Node 负责做事，State 负责传递数据，Edge 或 Command 负责控制流程。`这三个职责不要混为一谈。

### 1.2 和普通 Python 程序有什么区别？

LangGraph 并不是因为 Python 做不到才存在。

它的价值在于: 把节点、状态、流程跳转、暂停恢复等机制显式组织起来，让复杂流程更容易管理、调试和扩展。文档也强调了节点拆分、共享状态和流程可追踪的价值。

## 二、层级关系: 从业务需求到实际运行

- 第 1 层: 业务层:要解决什么问题？

  客服邮件、RAG 问答、订单处理、设备告警

- 第 2 层: 工作流设计层: 拆成节点、状态和跳转规则。

  StateGraph、Node、Edge、Command、START、END

- 第 3 层: 运行时机制: 负责实际执行、状态更新、暂停和恢复。

  编译后的图、执行引擎、Checkpointer、Interrupt、Retry

- 第 4 层: 基础设施与部署: 模型、数据库、API、日志、监控和服务进程。

  LLM API / 本地模型、PostgreSQL、FastAPI、LangGraph Server

1. 每一层分别解决什么？
   - 业务层: 定义流程目标和业务规则。
   - 工作流层: 把业务规则转换成可执行的图。
   - 运行时层: 执行图中的节点，并管理运行期间的状态和控制流。
   - 基础设施层: 为节点提供模型、数据库、外部 API 和部署环境。

2. compile()、invoke() 和服务器的关系

   compile() 不等于启动 HTTP 服务，invoke() 也不等于启动一个长期运行的服务器。
   - 同样，LangGraph 的图对象与 LangGraph Server 不是同一个东西。
   - 图对象可以直接在普通 Python 程序里执行；
   - 服务器是在其外层提供服务化运行能力。

## 三、代码解读: 从 TypedDict 到 Command，真正理解运行机制

1. State: 状态

   ```python
   from typing import TypedDict, Literal

   intent: Literal[
       "question", "bug", "billing", "feature", "complex"
   ]
   class EmailClassification(TypedDict):
       intent: Literal[
           "question", "bug", "billing", "feature", "complex"
       ]
       urgency: Literal[
           "low", "medium", "high", "critical"
       ]
       topic: str
       summary: str

   class EmailAgentState(TypedDict):
       email_content: str
       sender_email: str
       email_id: str

       classification: EmailClassification | None
   ```

   - TypedDict 是 Python 的一种类型标注方式，用于描述字典应当具有哪些键、每个键对应什么类型。

     TypedDict 的作用主要是帮助 IDE、静态类型检查器和开发者理解数据结构。

   - Literal 表示预期的意图值限定在列出的字符串中。

     Literal 本身并不会在运行时自动阻止模型返回 "unknown"。 如果需要严格验证模型输出，应当额外使用 Pydantic 等校验机制。

   - EmailClassification | None 表示这个字段可以是一个分类字典，也可以是 None。

2. Node(节点): 一个普通 Python 函数就可以

   读取当前 State，执行任务，然后返回需要更新的字段。

   区分两件事:
   - state: 当前节点能够读取的状态数据。
   - return {...}: 当前节点提交的状态更新。

3. 路由: Command 如何决定下一步？

   节点可以通过 Command 同时提交状态更新和下一步的目标节点。

   ```python
    return Command(
        update={"classification": classification},
        goto=next_node,
    )

   ```

4. 注册节点不等于执行节点，声明边也不等于立即沿边执行。

   真正执行发生在调用编译后图对象的 invoke()、ainvoke()、stream() 或 astream() 等方法时。

5. RetryPolicy: 重试和业务循环不是一回事

   ```python
      from langgraph.types import RetryPolicy

      workflow.add_node(
          "search_documentation",
          search_documentation,
          retry_policy=RetryPolicy(
              max_attempts=3,
              initial_interval=1.0,
          ),
      )
   ```

6. interrupt() 与 Checkpointer: 暂停后如何继续？
   文档指出，人工介入时可以使用 interrupt() 暂停执行，并依靠 Checkpointer 保存执行状态，以便之后恢复。

   涉及三个不同概念:

   | 概念         | 职责                                   |
   | ------------ | -------------------------------------- |
   | interrupt()  | 在流程中设置暂停点，等待外部输入或审批 |
   | Checkpointer | 保存与线程执行有关的图状态检查点       |
   | thread_id    | 标识需要继续执行的那条工作流线程       |

## 四、能力边界：LangGraph 能做什么，不能做什么？

1. LangGraph 不等于 RAG

   RAG 解决的是知识检索增强生成问题。

2. LangGraph 不等于 Agent

   Agent 通常涉及模型根据上下文决定下一步做什么，例如调用搜索工具、查询数据库或继续回答。
   LangGraph 提供的是编排这种动态行为的基础设施。

3. LangGraph 不等于 LangGraph Server
   - LangGraph Python 库: 在 Python 程序中定义和执行图。适合本地开发、测试，以及嵌入自己的服务。
   - LangGraph Server / 部署平台: 提供服务化运行、接口及配套运行能力。具体能力和配置取决于部署方式与版本。
