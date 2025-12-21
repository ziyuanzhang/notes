# langChain-V1.x-3-学习路径

## 第一阶段：基础知识 ==============================================

## 01 Hello LangChain - 第一次 LLM 调用

init_chat_model、invoke 方法、环境配置

- 模型调用：有 2 中形式

  1. 模型对应的 api 接口（例：ChatDeepSeek、ChatOpenAI）：可以显示思考过程、细节等；
  2. init_chat_model：函数调用【独有速率限制参数 -— 单位时间内调用次数】

  ```python
    model = init_chat_model(
        "provider:model_name",  # 提供商:模型名称
        api_key="your-api-key",  # API 密钥（可选，可从环境变量读取）
        temperature=0.7,         # 温度参数（可选）
        max_tokens=1000,         # 最大 token 数（可选）

        # **kwargs         # 其他模型特定参数
        stream=False,   # 是否流式输出（可选）
        cache=False,        # 是否缓存结果（可选）
        metadata=None,  # 元数据（可选）
    )
  ```

  | 参数           | 类型    | 说明                                                                                          | 默认值     |
  | -------------- | ------- | --------------------------------------------------------------------------------------------- | ---------- |
  | `model`        | `str`   | **必需**。格式为 `"provider:model_name"`，如 `"groq:llama-3.3-70b-versatile"`                 | 无         |
  | `api_key`      | `str`   | API 密钥。如果不提供，会从环境变量中读取（如 `GROQ_API_KEY`）                                 | `None`     |
  | `temperature`  | `float` | 控制输出随机性。范围 0.0-2.0。<br>- `0.0`：最确定性<br>- `1.0`：默认，平衡<br>- `2.0`：最随机 | `1.0`      |
  | `max_tokens`   | `int`   | 限制模型输出的最大 token 数量                                                                 | 模型默认值 |
  | `timeout`      | `int`   | 模型调用 超时时间（秒）                                                                       | 默认 60s   |
  | `max_retries`  | `int`   | 模型调用失败 最大重试次数                                                                     | 0          |
  | `model_kwargs` | `dict`  | 传递给底层模型的额外参数                                                                      | `{}`       |

- invoke 方法

  ```code
    你的输入 → invoke() → LLM 模型 → 响应 → 返回给你
  ```

- 调用：invoke、stream、batch
- 工具调用：bind_tools
- 结构化输出：structured_outputs
- 高级：
  1. 多模态
  2. 推理（）
  3. 提示词缓存（模型自带）
  4. 速率限制
  5. 日志概率
  6. token 用量
  7. 调用时配置

## 02 Prompt Templates - 提示词模板

文本模板、对话模板、变量替换、LCEL

- 文本模板

  ```python
    from langchain_core.prompts import PromptTemplate
    template = PromptTemplate.from_template(
        "将以下文本翻译成{language}：\n{text}"
    )
    prompt_str = template.format(language="中文", text="I love programming.")
    response = model.invoke(prompt_str)
  ```

- 对话模板

  ```python
    # 原始模板
    template = ChatPromptTemplate.from_messages([
        ("system", "你是{role}，目标用户是{audience}"),
        ("user", "{task}")
    ])
    # 部分填充
    customer_support_template = template.partial(
        role="客服专员",
        audience="普通用户"
    )
    # 现在只需要提供 task
    messages = customer_support_template.format_messages(
        task="解释退款政策"
    )
    response = model.invoke(messages)
  ```

  | 特性     | PromptTemplate | ChatPromptTemplate       |
  | -------- | -------------- | ------------------------ |
  | 输出格式 | 纯文本字符串   | 消息列表                 |
  | 角色支持 | ❌ 无          | ✅ system/user/assistant |
  | 对话历史 | ❌ 不支持      | ✅ 支持                  |
  | 适用场景 | 简单提示       | 聊天、对话、多轮交互     |

- LCEL 链式调用 (不推荐)

  LCEL = LangChain Expression Language

  ```bash
    输入 → 模板 → 模型 → 输出
  ```

## 03 Messages - 消息类型与对话历史

HumanMessage、AIMessage、SystemMessage、对话历史

| 角色      | 字典格式                                  | 对象格式             | 用途     |
| --------- | ----------------------------------------- | -------------------- | -------- |
| System    | `{"role": "system", "content": "..."}`    | `SystemMessage(...)` | 系统提示 |
| User      | `{"role": "user", "content": "..."}`      | `HumanMessage(...)`  | 用户输入 |
| Assistant | `{"role": "assistant", "content": "..."}` | `AIMessage(...)`     | AI 回复  |

- 对话历史 -- 本质是 列表
- 组成部分: SystemMessage、HumanMessage、ToolMessage、AIMessage

  1. role: system(系统消息)、user（用户输入）、assistant（模型输出）、tool(工具输出)
  2. content: 消息内容
  3. Metadata:（可选）额外信息，如：消息 ID、响应时间、token 消耗、消息标签等

- 消息解析

  1. SystemMessage、HumanMessage: Content
  2. AIMessage 的 additional_kwargs

     - 属性

       1. tool_calls(list): 与该消息关联的工具调用；
       2. invalid_tool_calls(list): 与该消息关联的解析错误的工具调用；
       3. usage_metadata(typedict): 包会该消息的使用元数据，例如 token 使用情况；
       4. content_blocks(list): 消息中标准的、结构化的 ContentBlock 字典;

     - 方法 pretty_repr ->str: 返回该消息更易读的的可视化呈现形式;

  3. ToolMessage 的 additional_kwargs

     - 属性
       1. results(list): 工具的执行结果，列表内容由所定义工具而定;
       2. tool_call_id(str): 该消息消息所响应的工具调用唯一标识;
       3. status(Literal['success','error']): 工具调用的结果状态;
       4. artifact(Any): 工具执行过程中产生的非传输内容，与工具定义时 content_and_artifact 参数关联；
     - 方法 coerce_args -> dict: 强制将模型参数转换为正确类型

## 04 Custom Tools - 自定义工具

@tool 装饰器、参数类型、docstring 重要性

- | 必需项         | 说明                                  |
  | -------------- | ------------------------------------- |
  | `@tool` 装饰器 | 声明这是一个工具                      |
  | **docstring**  | AI 读这个来理解工具用途 ⚠️ 非常重要！ |
  | 类型注解       | 参数和返回值的类型                    |
  | 返回 `str`     | 工具应该返回字符串（AI 最容易理解）   |

- 定义工具三类方式：

  1. @tool 装饰器定义
  2. 继承 BaseTool 类定义，必须重写`_run`函数
  3. 从 MCP 服务器获得

  **注意：** 同步工具，智能体同步调用，异步工具，智能体异步调用

- demo

```python
  @tool(name:str, description:str,response_format:["content", "content_and_artifact"])
  def tool_name(arg1: str, arg2: int) -> str:
      """
      提示词：工具的简短描述（AI 读这个！）

      Args:
          param: 参数说明
          num_results: 返回结果数量，默认 3

      Returns:
          返回值说明
      """
     print("参数：", arg1, arg2)
     return "返回值"
```

- 调用

  1. 直接调用（测试用）

     ```python
       # 使用 .invoke() 方法
       result = get_weather.invoke({"city": "北京"})
       print(result)  # "晴天，温度 15°C"
     ```

  2. 绑定到模型（让 AI 调用）

  ```python
      model = init_chat_model("groq:llama-3.3-70b-versatile")
      model_with_tools = model.bind_tools([get_weather])
      response = model_with_tools.invoke("北京天气如何？")
  ```

## 05 Simple Agent - create_agent 入门

create_agent 创建 Agent、配置选项

```python
  agent =  create_agent(
      model: model,  # 必须
      tools: List[tool], # 必须

      # **kwargs # 其他 (可选)
      system_message: str=None, #系统提示词(可选)
      interrupt_before: list[str]=None, # 在某些工具钱暂停（人机协作）(可选)
      interrupt_after: list[str]=None, #在某些工具后暂停（人机协作）(可选)
      debug: bool=False, # 调试模式(可选)
    )
```

- Agent 核心组件：模型（Model）、工具（Tool）、记忆（Memory）

  1. 模型（Model）： Agent 的“大脑”，负责推理和决策过程。
  2. 工具(Tool)： Agent 与外部交互的“能力扩展“，每个工具提供一个功能，如搜索、翻译、计算等。
  3. 记忆（Memory）： 为 Agent 提供上下文感知能力，使其能够记住之前的交互历史并基于上下文做出决策（分 短期记忆、长期记忆）。

     - 短期记忆： 维护当前对话的上下文，如当前任务、当前对话、当前工具调用结果等。
     - 长期记忆： 跨对话会话的知识持久化存储，如数据库、文件系统、知识库等。

- 调用：invoke、stream 调用、异步调用

## 06 Agent Loop - Agent 执行循环

执行循环、消息历史、流式输出

- 请求-->模型-->推理-->行动（调工具）-->（模型）观察（结果）-->输出

- 默认的 Agent 是 reAct 流程：推理 + 行动 + 观察（循环）

  1. 推理（Reason）
  2. 行动（Action）
  3. 观察（Observation）

- 工作流程

  ![agents流程图](./img/operating_process/agents流程图.png)
  ![agents决策流程](./img/operating_process/agents决策流程.png)

- workflow：固定步骤 step1--》step2--》Step3-->step4

## 第二阶段：实战技能 ==============================================

## 07 Memory Basics - 内存基础

- InMemorySaver、会话管理

## 08 Context Management - 上下文管理

- 消息修剪、上下文窗口

## 09 Checkpointing - 状态持久化

SQLite 持久化、状态恢复

- checkpoint: 检查点，状态图的“总体状态”快照
- thread_id: 管理
- 作用: 管理记忆、时间旅行、人工干预（human-in-the-loop）、容错

## 10 Middleware Basics - 中间件基础

自定义中间件、钩子函数

- 中间件的主要作用

  1. 行为记录：通过日志记录、分析和调试跟踪 Agent 行为；
  2. 格式约束：转换提示、工县选择和输出格式；
  3. 逻辑控制：增加了重试、后备和提前终止逻辑；
  4. 资源限制：应用速率限制、保护栏和个人身份识别检测；

**注意：** middleware 参数传入一个列表，可以传入多个中间件；当同一位置有多个中间件时，会按照列表中的先后顺序触发；

- 分类：预构建中间件 和 自定义中间件

  1. 预构建中间件（Built-in Middleware）：

     - Summarization: 触发时自动总结对话列表记录;
     - Human-in-the-loop: 暂停执行以供人工批准或修改工具调用;
     - To-do list: 为代理提供复杂多步骤任务的任务规划和跟踪能力;
     - Model call limit: 限制模型调用次数，以防止过高成本;

  2. 自定义中间件（Custom Middleware）：

     - 节点型钩子:

       1. before_agent: Agent 开始前(每次查询一次);
       2. before_model: 每次模型调用前
       3. after_model: 每次模型响应后
       4. after_agent: 代理 完成后(每次调用一次)

     - 环绕型钩子:
       1. wrap_model_call: 国绕每次模型调用
       2. wrap_tool_call: 用绕每次工具调阳

## 11 Structured Output - 结构化输出

Pydantic 模型、输出解析

- ToolStrategy[StructuredResponseT]：使用工具调用进行结构化输出
- ProviderStrategy[StructuredResponseT]：使用提供商原生结构化输出
- type[StructuredResponseT]：架构类型 - 根据模型能力自动选择最佳策略
- None：无结构化输出
- 联合类型：多个架构选项

* 定义结构化输出格式的架构
  1. Pydantic (V2) 的 BaseModel
  2. Dataclass (数据类)
  3. TypedDict：类型化字典类
  4. JSON Schema：带有 JSON 模式规范的字典
  5. 联合类型：多个架构选项

## 12 Validation Retry - 验证与重试

- 验证失败处理、重试机制

## 13 RAG Basics - RAG 基础

- 文档加载、分块、向量存储、检索

## 14 RAG Advanced - RAG 进阶

- 混合搜索、重排序、高级检索

## 15 Tools and Agents - 工具与智能体进阶

- 高级工具定义 - 使用 Pydantic 进行参数验证
- 异步工具 - 处理 IO 密集型任务
- 工具组合 - 构建复杂的工具链
- Agent 高级配置 - 自定义行为和错误处理
- 生产级实践 - 监控、日志、错误恢复

## 第三阶段：高级主题 ==============================================

## 16 LangGraph Basics - 状态图基础

- StateGraph、节点、边、检查点

## 17 Multi-Agent - 多智能体系统

Supervisor 模式、协作调度

- 多 agent:2 种方式

  1. 集中式: user -> supervisor agent ->worker agent
  2. 轮换式: user -> agent1 --> user -->agent2

- supervisor agent 步骤:

  1. 创建 2 个 worker agent，有各自的 tools;
  2. 把这 2 个 agent 封装成 2 个新的 tool;
  3. 创建 supervisor agent，配置 tools，使用的就是 这 2 个 work agent 封装的 tool;

## 18 Conditional Routing - 条件路由

- 动态分支、决策树

## 19 Image Input - 图像输入处理

- 视觉理解、图像分析

## 20 File Handling - 文件处理

- 文档加载、多格式支持

## 21 Mixed Modality - 混合模态

- 文本+图像+数据综合处理

## 22 LangSmith Integration - 监控集成

- 追踪、监控、性能分析

## 23 Error Handling - 错误处理

- 重试、降级、容错机制

## 第四阶段：综合项目 ==============================================

## 01 RAG System - 检索增强生成系统

- 向量存储、检索增强生成、引用追踪

## 02 Multi-Agent Support - 多智能体客服系统

- 多 Agent 协作、意图识别、路由分发

## 03 Research Assistant - 智能研究助手

- 多阶段工作流、报告生成、引用管理
