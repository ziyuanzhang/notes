# langGraph-3.3-持久性-存储(store)

- LangGraph 提供了两种互补的持久化系统：
  1. Checkpointer 保存一次对话线程的图状态，
  2. Store 保存跨线程长期使用的数据。两者解决不同的问题，生产系统通常可以同时使用。

## 一、概念理解：Store 到底是什么？

Store 可以理解为 Agent 使用的一个持久化键值存储接口。

1. 它保存的数据可以是：
   - 用户偏好：喜欢什么食物、使用什么编程语言。
   - 长期知识：用户已经确认的项目背景、业务规则。
   - 用户配置：语言、时区、输出格式等。
   - 应用数据：Agent 在多次任务中积累的、允许跨线程访问的信息。

### 1.1 Store 与 Checkpointer 的核心区别

- Checkpointer：线程级运行状态
  Thread-scoped · 对话过程 · Graph State
  保存消息历史、当前状态、节点执行产生的状态快照和恢复执行所需的信息。

- Store：跨线程共享数据
  Cross-thread · 长期记忆 · Key-Value Items
  保存用户偏好、长期知识和业务数据，由应用决定如何组织、查询和更新。

* Agent 在当前对话中可能同时发生两件事：
  1. Checkpointer 保存本轮对话消息和 Graph 执行状态。
  2. Store 保存经过提取、确认的长期偏好。

  下周用户开启新线程，Checkpointer 不会自动把旧线程的全部消息变成新线程的状态；但 Agent 可以主动查询 Store，取回相关偏好。

❗关键区别：Store 不等于聊天历史，也不等于自动记忆。 它只提供存取能力。
是否提取记忆、什么时候写入、如何检索以及是否注入模型上下文，仍需要应用逻辑或框架提供的相应能力。

## 二、层级关系：Store 在 LangGraph 架构中的位置

| 层次          | 核心职责             | 典型对象                        |
| ------------- | -------------------- | ------------------------------- |
| Graph / Agent | 决定什么时候读写记忆 | Node、Runtime                   |
| 存储接口      | 规定如何读写和检索   | BaseStore                       |
| 存储后端      | 真正保存数据         | InMemoryStore、PostgresStore 等 |

❗Checkpointer 和 Store 在逻辑上是两个独立的持久化组件，不要求它们使用同一个数据库。

Runtime 本身不是数据库，也不是长期记忆。它是节点运行时可以使用的上下文与能力入口。

## 三、为什么需要 Store？

把两类不同的需求分离了：

- 会话连续性：需要继续某个线程的运行过程，用 Checkpointer。
- 用户跨会话记忆：需要在不同线程复用用户信息，用 Store。

并非所有历史消息都应该保存成长期记忆。消息历史可能非常长、包含临时信息，也可能包含不应长期保存的内容。Store 更适合存放经过业务判断、提取和整理的数据。

## 四、工作原理：从写入到跨线程读取

### 4.1 先理解三个关键概念

1. Namespace：命名空间

   负责组织数据，类似分层目录。例子：("user_1", "memories")。

2. Key：唯一键

   标识命名空间下的一条记录，例如 "food_pref_001"。

3. Value：记录内容

   一个可序列化的 Python 字典，例如 {"food_preference": "pizza"}。

完整的定位方式可以理解为：`(namespace, key) → value`; 这三个字段各司其职：Namespace 组织数据，Key 标识记录，Value 保存实际内容。

### 4.2 写入一条记忆

`store.put(namespace, memory_id, memory)`

### 4.3 读取记忆

```python
items = store.search(namespace)

for item in items:
    print(item.key) # 	记录键
    print(item.value) # 实际存储的字典
    print(item.namespace) # 所属命名空间
    print(item.created_at) # 创建时间
    print(item.updated_at) # 更新时间
```

### 4.4 为什么 Namespace 支持前缀匹配？

```bash
("alice", "memories")
("alice", "preferences")
("alice", "projects")
("bob", "memories")
```

- `store.search(("alice",))`: 可以匹配 Alice 下面多个子命名空间，而不仅仅是 ("alice", "memories")。
- `store.search(("alice", "memories"))`:仍然是前缀匹配，只是范围更窄。

* 两个工程细节：
  - limit 限制返回数量，超出的结果可能被静默截断。
  - 不同后端的默认排序可能不同。不能依赖某条记录永远是 items[-1]；如果顺序重要，应显式排序或使用有明确排序保证的查询。

## 五、代码解读：语义搜索与 LangGraph 集成

### 5.1 普通搜索与语义搜索有什么区别？

- 普通搜索解决的是：我想列出这个命名空间中的记录。
- 语义搜索解决的是：我想找出与当前问题含义相关的记录。

```python
from langchain.embeddings import init_embeddings
from langgraph.store.memory import InMemoryStore
# -------------------------------------------
store = InMemoryStore(
    index={
        "embed": init_embeddings(  # 将文本转换成向量的嵌入模型
            "openai:text-embedding-3-small"
        ),
        "dims": 1536, #	向量维度，必须与模型输出一致
        "fields": ["food_preference", "$"], # 默认参与索引的字段；"$" 表示整个值对象
    }
)
# -------------------------------------------
memories = store.search(
    namespace,
    query="What does the user like to eat?",
    limit=3,
)

```

### 5.2 index=False 是什么意思？

```python
# -- 仅索引指定字段 --------------------------
store.put(
    namespace,
    "food_001",
    {
        "food_preference": "I love Italian cuisine",
        "context": "Discussing dinner plans",
    },
    index=["food_preference"],
)

# -- 保存，但不参与向量索引 --------------------
store.put(
    namespace,
    "system_001",
    {"system_info": "Last updated: 2024-01-01"},
    index=False,  # 仍然可以通过键值读取或普通列表查询访问，但不会通过语义索引检索。
)
```

并非所有数据都需要向量化。

例如，用户偏好、自然语言知识可能适合语义索引；订单号、任务 ID、内部状态码则更适合精确查询。这样可以减少不必要的嵌入成本，并让检索策略更清晰。

### 5.3 将 Store 接入 LangGraph：完整关系

```python
from dataclasses import dataclass
from langgraph.checkpoint.memory import InMemorySaver

@dataclass
class Context:
    user_id: str

checkpointer = InMemorySaver()

builder = StateGraph(
    MessagesState,
    context_schema=Context, # 声明节点可接收的运行时上下文类型。
)

# ... add nodes and edges ...

graph = builder.compile(
    checkpointer=checkpointer, # 启用线程状态持久化。
    store=store, # 给 Graph 提供跨线程存储能力。
)
```

编译并不会自动产生长期记忆，也不会自动决定什么时候读取 Store。

```python
config = {
    "configurable": {
        "thread_id": "thread_001" # thread_id: 标识当前对话线程，供 Checkpointer 使用
    }
}

result = graph.invoke(
    {"messages": [{"role": "user", "content": "你好"}]},
    config,
    context=Context(user_id="user_001"), # user_id: 由应用传入的身份上下文，用于定位该用户的记忆
)
```

### 5.4 在 Node 中写入长期记忆

```python
async def update_memory(
    state: MessagesState,
    runtime: Runtime[Context],
):
    user_id = runtime.context.user_id

    namespace = (user_id, "memories")

    memory_id = str(uuid7())

    await runtime.store.aput(
        namespace,
        memory_id,
        {"memory": memory},
    )
```

有四个重要步骤：

1. 从 Runtime 读取当前执行的用户上下文。
2. 根据用户 ID 构造命名空间。
3. 生成本条记忆的键。
4. 通过异步 Store 接口写入字典。

### 5.5 在 Node 中读取记忆，并交给模型

```python
async def call_model(
    state: MessagesState,
    runtime: Runtime[Context],
):
    user_id = runtime.context.user_id
    namespace = (user_id, "memories")

    memories = await runtime.store.asearch(
        namespace,
        query=state["messages"][-1].content,
        limit=3,
    )

    info = "\n".join(item.value["memory"] for item in memories)

    # 将 info 放入模型调用的适当上下文
```

还要防止两个问题：

- 没有匹配结果时，memories 为空，应允许 Agent 正常回答，而不是报错。
- item.value["memory"] 假定每条记录都存在 memory 字段。如果不同类型的记忆混存，读取逻辑需要做类型校验，或将不同类型分到不同命名空间。

### 5.6 总结对话，提取长期记忆 -- 【有中间件】

通常是开发者设计规则，Agent/工作流决定何时触发，大模型负责从对话中提取和总结候选记忆，最后由程序写入 Store。

```python
async def summarize_memory(state, runtime):
    # 1. 获取当前用户的对话消息
    messages = state["messages"]

    # 2. 调用大模型，提取值得长期保存的信息
    memory = await extract_memories_with_llm(messages)

    # 3. 校验、去重或更新后写入 Store
    if memory:
        user_id = runtime.context.user_id

        await runtime.store.aput(
            (user_id, "memories"),
            "profile",
            memory,
        )
```

extract_memories_with_llm() 需要自行实现的模型调用逻辑，并不是 LangGraph 自带的函数。

开发者制定规则，大模型负责理解和提炼，工作流负责调度，Store 负责存储。

## 六、能力边界：Store 能做什么，不能做什么？

## 七、对比：不同 Store 后端怎么选？

InMemoryStore、PostgresStore、MongoDBStore、RedisStore 和 UpstashStore 等实现。

- 开发阶段：InMemoryStore
- 需要更高控制权：自定义 BaseStore

## 八、LangSmith / Agent Server：哪些地方存在绑定？

对于自主可控性，可以这样评估：

| 方案                                           | 控制权判断                                     |
| ---------------------------------------------- | ---------------------------------------------- |
| LangGraph + 自己的 FastAPI + 自托管 PostgreSQL | 较高：服务和数据后端都可以自己管理             |
| LangGraph + 自己管理的数据库适配器             | 较高：取决于适配器和依赖                       |
| Agent Server + 自己管理的持久化后端            | 中到较高：取决于服务部署、配置和后端支持       |
| LangSmith 托管服务及其默认基础设施             | 绑定较强：需要考虑平台依赖、数据迁移和退出成本 |

学习阶段先掌握 LangGraph 原生 Store 接口；生产架构优先明确数据归属和迁移路径，再决定是否采用 Agent Server 或 LangSmith 的托管能力。

## 九、进阶：如何实现自己的 Store？
