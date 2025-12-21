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

- create_agent 创建 Agent、配置选项

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

## 06 Agent Loop - Agent 执行循环

执行循环、消息历史、流式输出

- 请求-->模型-->推理-->行动（调工具）-->（模型）观察（结果）-->输出

- 默认的 Agent 是 reAct 流程：推理 + 行动 + 观察（循环）

  1. 推理（Reason）
  2. 行动（Action）
  3. 观察（Observation）

- workflow：固定步骤 step1--》step2--》Step3-->step4

## 第二阶段：实战技能 ==============================================

## 07 Memory Basics - 内存基础

- InMemorySaver、会话管理

## 08 Context Management - 上下文管理

- 消息修剪、上下文窗口

## 09 Checkpointing - 状态持久化

- SQLite 持久化、状态恢复

## 10 Middleware Basics - 中间件基础

- 自定义中间件、钩子函数

## 11 Structured Output - 结构化输出

- Pydantic 模型、输出解析

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

- Supervisor 模式、协作调度

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
