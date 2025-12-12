# LangChain V1.0

1. LangChain V1.0 vs LangGraph V1.0: 分工与定位

   - LangChain: 构建 AI 智能体的最快方式。提供标准的工具调用架构、供应商无关设计和可插拔的中间件系统，让开发者高效构建通用 Agent.
   - LangGraph: 一个底层运行时框架，专为需要长期运行、可控且高定制化的生产级智能体设计。
   - LangChain V1.0 的 Agent 是构建在 LangGraph 之上，以提供持久的执行、流、人机交互、持久性等。

2. DeepAgents V1.0:【做研究类的】 构建能够规划（planning）、使用子代理（subagent）并利用文件系统（file system）完成复杂任务的代理

3. 测试框架：

   - LangSmith: 大型语言模型的可观测性、评估与部署（分析用的）【真实项目不用】
   - LangGraph studio: 语言模型开发工具，基于 LangGraph 构建，提供模型开发、测试、部署等功能。

4. LangGraph CLI: 后端打包部署的工具
5. Agent Chat UI: 前端页面

## model

- 最好用模型对应的 api 接口（例：ChatDeepSeek、ChatOpenAI）：可以显示思考过程、细节等；

- 参数

  1. temperature: 采样温度，值越高越有创造性（按照官方文档来）
  2. max_retries: 最大重试次数。
  3. max_tokens: 要生成的最大 token 数。

- 速率限制：有些大模型不允许，单位时间内调用的次数太多；

  1. init_chat_model()：函数调用【独有速率限制参数】
  2. ChatDeepSeek（）、ChatOpenAI（）：类调用【没有速率限制参数】

## Message: 消息

- 组成部分

  1. role: system(系统消息)、user（用户输入）、assistant（模型输出）、tool(工具输出)
  2. content: 消息内容
  3. Metadata:（可选）额外信息，如：消息 ID、响应时间、token 消耗、消息标签等

- 全部响应： model.invoke(message: Message) -> Message
- 流式响应： model.stream(message: Message) -> Generator[Message, None, None]
- 批量响应： model.batch(messages: List[Message]) -> List[Message]

## Agent（智能体/代理）

- Agent 核心组件：模型（Model）、工具（Tool）、记忆（Memory）

  1. 模型（Model）： Agent 的“大脑”，负责推理和决策过程。
  2. 工具(Tool)： Agent 与外部交互的“能力扩展“，每个工具提供一个功能，如搜索、翻译、计算等。
  3. 记忆（Memory）： 为 Agent 提供上下文感知能力，使其能够记住之前的交互历史并基于上下文做出决策（分 短期记忆、长期记忆）。

     - 短期记忆： 维护当前对话的上下文，如当前任务、当前对话、当前工具调用结果等。
     - 长期记忆： 跨对话会话的知识持久化存储，如数据库、文件系统、知识库等。

- agent: model、tools、system_prompt、checkpoint、middleware

- 多 agent:2 种方式

  1. 集中式: user -> supervisor agent ->worker agent
  2. 轮换式: user -> agent1 --> user -->agent2

- 工作流程

  ![agents流程图](./img/operating_process/agents流程图.png)
  ![agents决策流程](./img/operating_process/agents决策流程.png)

### 1、核心入口:create_agent()统-Agent 构建流程

1. 底层封装 LangGraph 执行机制: create_agent()默认基于 LangGraph 引擊实现，将“模型调用一工具决策一工具执行一结果整合“的闭环流程封装为高阶接口，开发者无需关注底层的图执行逻辑，只需传入核心组件即可快速构建 Agent。这种设计不仅简化了代码，还提升了流程的稳定性和可扩展性，支持复杂的分支逻辑和循环执行。

2. 告别繁琐的提示词模板: 旧版本要要从 LanaChain Hub 导入大段的提示词模板，包含工具调用格式、对话历史注入等复杂配置，且模型容易出现格式输出错误。1.0 版本中，开发者只需传入简洁的 system_prompt(系统提示词)，LangChain 会自动结合工具信息、对话上下文生成完整的提示词，大幅降低了提示词设计的难度。

3. 兼容 Function Calling 标准: create_agent()原生支持 OpenAI 定义的 Function calling 格式，能够自动将工具信息转化为结构化的函数描述，传递给支持该格式的 LLM，在国内模型中，通义千问对这一特性的适配性最佳，这也是很多开发者选择其作为 LangChain 默认模型的重要原因。

### 多代理（多 Agent）

- supervisor agent 步骤:

  1. 创建 2 个 worker agent，有各自的 tools;
  2. 把这 2 个 agent 封装成 2 个新的 tool;
  3. 创建 supervisor agent，配置 tools，使用的就是 这 2 个 work agent 封装的 tool;

## 工具

## 记忆：短期记忆、长期记忆（持久化）

### checkpointer 检查点管理器

- checkpoint: 检查点，状态图的“总体状态”快照
- thread_id: 管理
- 作用: 管理记忆、时间旅行、人工干预（human-in-the-loop）、容错

## 时间旅行

## 结构化输出

1. pydantic(V2) 的 BaseModel
2. Dataclass
3. TypedDict

## 流式输出

## 中间件

## 运行时

## 人工干预（人在环上）

## 模型上下文协议 (MCP)

## RAG（检索增强生成）

- 语义搜索：

- 问题：1、大模型幻觉；2、上下文“长度”限制；3、模型“专业知识与时效性知识”不足
- 解决：

  1. 数据源
  2. 文档解析
  3. 文本分割
  4. 文本向量化
  5. 存向量库
  6. 检索
     - 相似度计算
     - 重排序
  7. RAG 系统评估
     - 文档检索评估
     - 文档生成评估
     - 评估工具：RAGAS、langSmith、LLM-AS-A-Judge
  8. RAG 系统优化
     - 文档检索过程优化
     - 上下文拼接策略优化
     - 生成策略优化

  - Graph RAG：基于知识图谱的新型检索方式
  - Agentic RAG：将 检索增强生成 与 agent 结合

### 语义搜索

- 从 PDF 到向量库(知识库)

  1. 文档解析：读取 PDF，按页面管理，Document,List[Document]
  2. 分割文本，文本段（chunk），Document,List[Document]
  3. 向量化：文本段<=>向量，需要嵌入模型来辅助；
  4. 向量库：把多个“文本段的向量”保存到向量库；

- 四种语义搜索方法
  1. （用文本）相似度查询
  2. （用文本）带分数的相似度查询
  3. （用向量）进行相似的查询；【查询先转向量，后查询】

## SQL

## 上下文工程

## 模型上下文协议（MCP）

## 防护措施

## langGraph

### 图

## deepAgent: planning(规划)、file system（文件系统）、subagent（子代理）

- 何时使用 Deep Agents：当您需要能够完成以下任务的代理时，请使用 Deep Agents：

  1. 处理需要规划和分解的复杂多步骤任务
  2. 通过文件系统工具管理大量上下文
  3. 将工作委托给专门的子代理以实现上下文隔离
  4. 在对话和线程中持久化内存

- 过程
  1. deepagent 内置工具：write_todos,to_do_list
  2. internet_search ... update to_do_list
  3. write_file ,写报告

## 部署
