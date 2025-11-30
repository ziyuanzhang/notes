# LangChain V1.0

1. LangChain V1.0 vs LangGraph V1.0: 分工与定位

   - LangChain: 构建 AI 智能体的最快方式。提供标准的工具调用架构、供应商无关设计和可插拔的中间件系统，让开发者高效构建通用 Agent.
   - LangGraph: 一个底层运行时框架，专为需要长期运行、可控且高定制化的生产级智能体设计。
   - LangChain V1.0 的 Agent 是构建在 LangGraph 之上，以提供持久的执行、流、人机交互、持久性等。

2. DeepAgents V1.0: 在 LangChain 的基础上进一步封装出来模版，暂时不可用（未来）； LangGraph --> LangChain --> DeepAgents
3. 测试框架：

   - LangSmith: 大型语言模型的可观测性、评估与部署（分析用的）【真实项目不用】
   - LangGraph studio: 语言模型开发工具，基于 LangGraph 构建，提供模型开发、测试、部署等功能。

4. LangGraph CLI: 后端打包部署的工具
5. Agent Chat UI: 前端页面

## 1、核心入口:create_agent()统-Agent 构建流程

1. 底层封装 LangGraph 执行机制: create_agent()默认基于 LangGraph 引擊实现，将“模型调用一工具决策一工具执行一结果整合“的闭环流程封装为高阶接口，开发者无需关注底层的图执行逻辑，只需传入核心组件即可快速构建 Agent。这种设计不仅简化了代码，还提升了流程的稳定性和可扩展性，支持复杂的分支逻辑和循环执行。

2. 告别繁琐的提示词模板: 旧版本要要从 LanaChain Hub 导入大段的提示词模板，包含工具调用格式、对话历史注入等复杂配置，且模型容易出现格式输出错误。1.0 版本中，开发者只需传入简洁的 system_prompt(系统提示词)，LangChain 会自动结合工具信息、对话上下文生成完整的提示词，大幅降低了提示词设计的难度。

3. 兼容 Function Calling 标准: create_agent()原生支持 OpenAI 定义的 Function calling 格式，能够自动将工具信息转化为结构化的函数描述，传递给支持该格式的 LLM，在国内模型中，通义千问对这一特性的适配性最佳，这也是很多开发者选择其作为 LangChain 默认模型的重要原因。

## Agent（智能体/代理）

Agent 的核心价值在于其三重核心能力:动态任务路由、生态化工具集成和全周期记忆管理

- Agent 核心组件：模型（Model）、工具（Tool）、记忆（Memory）、执行协调器（AgentExecutor）

  1. 模型（Model）： Agent 的“大脑”，负责推理和决策过程。
  2. 工具(Tool)： Agent 与外部交互的“能力扩展“，每个工具提供一个功能，如搜索、翻译、计算等。
  3. 记忆（Memory）： 为 Agent 提供上下文感知能力，使其能够记住之前的交互历史并基于上下文做出决策（分 短期记忆、长期记忆）。

     - 短期记忆： 维护当前对话的上下文，如当前任务、当前对话、当前工具调用结果等。
     - 长期记忆： 跨对话会话的知识持久化存储，如数据库、文件系统、知识库等。

  4. AgentExecutor：扮演”执行协调器“的关键角色，负责迭代运行代理直至满足停止条件。

- Agent 的工作流程与决策循环：输入解析--》LLM 推理--》工具调用--》观察与选代--》结果整合

## model

- 最好用模型对应的 api 接口（例：ChatDeepSeek、ChatOpenAI）：可以显示思考过程、细节等；

- 参数

  1. temperature: 采样温度，值越高越有创造性（按照官方文档来）
  2. max_retries: 最大重试次数。
  3. max_tokens: 要生成的最大 token 数。

- 速率限制：有些大模型不允许，单位时间内调用的次数太多；

  1. init_chat_model()：函数调用【独有速率限制参数】
  2. ChatDeepSeek（）、ChatOpenAI（）：类调用【没有速率限制参数】

- 模型格式化输出: 用 pydantic 的 BaseModel【langGraph 用】

  1. with_structured_output()： 默认的格式化输出，国外模型大部分支持，国内模型大部分不支持；
  2. 支出其他方式格式化输出：例: SimpleJsonOutputParser()

## 工具

### 聊天模型与 agent 是 2 个东西

聊天模型 与 模型是 2 个东西

ReAct-agent：
中间件

BaseModel: 结构化输出用
