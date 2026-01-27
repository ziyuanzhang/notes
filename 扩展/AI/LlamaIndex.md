# LlamaIndex

[知乎](https://www.zhihu.com/people/he-zhi-dong-87/columns)

## llama-index 包含了

- llama-index-core
- llama-index-llms-openai
- llama-index-embeddings-openai
- llama-index-program-openai
- llama-index-question-gen-openai
- llama-index-agent-openai
- llama-index-readers-file
- llama-index-multi-modal-llms-openai

## LlamaIndex--阅读

指南+官网的示例 + api 参考

### 示例

将这些概念按照 LlamaIndex 开发 LLM 应用的逻辑流程（从数据准备到应用构建，再到优化）进行分类排序，可以更清晰地理解它们之间的关系。

以下是按流程分类排序的结果：

1. 了解与资源 (Ecosystem & Resources)

   在开始构建之前，了解生态系统和可用资源。
   - 探索 LlamaIndex (Explore LlamaIndex)
   - 手册 (Handbook/Docs)
   - Llama Hub (组件库，查找现成的数据加载器和工具)
   - Llama 数据集 (Llama Datasets)
   - 使用案例 (Use Cases)

2. 数据摄取与加载 (Data Ingestion & Loading)

   将外部数据引入系统。
   - 摄取 (Ingestion)
   - 数据连接器 (Data Connectors)
   - 多模态 (Multi-modal) - 处理图像/音频等多类型数据

3. 数据转换与索引 (Transformation & Indexing)

   对数据进行清洗、切分、嵌入并存储，构建知识库。
   - 转换 (Transformations)
   - 节点解析器和文本分割器 (Node Parsers / Text Splitters)
   - 元数据提取器 (Metadata Extractor)
   - LLM (大语言模型，用于处理和生成)
   - 嵌入 (Embeddings) - 将文本转为向量
   - 向量存储 (Vector Store)
   - 文档存储 (Doc Store)
   - 对象存储 (Object Store)
   - 属性图 (Property Graph) - 高级结构化索引
   - 托管索引 (Managed Index)
   - 多租户 (Multi-tenancy) - 数据隔离策略

4. 检索与查询处理 (Retrieval & Querying)

   从索引中查找相关信息并进行处理。
   - 检索器 (Retrievers) - 根据 Query 找数据
   - 节点后处理器 (Node Post-processors) - 对检索结果重排序或过滤
   - 查询转换 (Query Transformations) - 改写用户问题
   - 查询管道 (Query Pipeline) - 编排查询流程
   - 响应合成器 (Response Synthesizer) - 结合上下文生成答案
   - 输出解析器 (Output Parsers) - 格式化 LLM 的输出
   - Prompt (提示词)
   - 查询引擎 (Query Engine) - 封装了检索和生成的端到端接口

5. 高级应用与 Agent (Agents & Application Layer)

   构建具备记忆、交互能力和复杂逻辑的应用。
   - 聊天引擎 (Chat Engine) - 支持上下文对话
   - 记忆 (Memory)
   - 工具 (Tools) - 赋予 LLM 调用外部能力
   - Agent (智能体) - 自主决策和执行
   - 工作流 (Workflows) - 事件驱动的复杂流程编排

6. 评估、优化与运维 (Evaluation, Optimization & Ops)

   监控应用表现，微调模型，提升效果。
   - 评估 (Evaluations)
   - 微调 (Fine-tuning)
   - 参数优化器 (Param Optimizer)
   - 可观测性 (Observability) - 调试和追踪
   - 定制 (Customization)
   - 低层级 (Low-level) - 底层 API 控制

流程总结图解：

数据源 (连接器) -> 处理 (解析/嵌入) -> 存储 (向量库) -> 检索 (检索器) -> 生成 (查询/聊天引擎) -> 智能体 (Agent/工具) -> 优化 (评估/微调)

### api

以下是按流程逻辑分类的排序：

1. 资源与扩展包 (Resources & Ecosystem)

   在开始构建前，利用现有的资源加速开发。
   - Llama Packs (预构建的模块包)
   - Llama 数据集 (Llama Datasets - 用于基准测试的数据)

2. 数据摄取与处理 (Data Ingestion & Processing)

   将原始数据读入并切分成系统可理解的单元。
   - 摄取 (Ingestion)
   - 阅读器 (Readers) - 即数据加载器
   - 节点解析器 & 文本分割器 (Node Parsers & Text Splitters) - 将文档切分为节点
   - 元数据提取器 (Metadata Extractors) - 自动为节点增加上下文标签
   - Schema (数据结构定义)

3. 模型、索引与存储 (Models, Indexing & Storage)

   核心模型层，以及将处理后的数据转化为向量/图并存储。
   - LLMs (大语言模型)
   - 多模态 LLMs (Multi-modal LLMs)
   - 嵌入 (Embeddings) - 稠密向量
   - 稀疏嵌入 (Sparse Embeddings) - 关键词向量
   - 索引 (Indices) - 组织数据结构
   - 图 RAG (Graph RAG) - 基于知识图谱的索引/检索
   - 存储 (Storage) - 底层存储接口
   - 对象存储 (Object Stores)

4. 检索与查询逻辑 (Retrieval & Query Logic)

   从索引中提取信息，并处理成最终答案。
   - 检索器 (Retrievers) - 从索引中查找相关节点
   - 选择器 (Selectors) - 路由逻辑，决定使用哪个索引或工具
   - 节点后处理器 (Node Postprocessors) - 对检索结果重排序或过滤
   - 响应合成器 (Response Synthesizers) - 将上下文和 Prompt 结合生成回答
   - 提示 (Prompts)
   - 问题生成器 (Question Generators) - 用于将复杂问题拆解
   - 程序 (Programs) - 用于结构化数据提取
   - 输出解析器 (Output Parsers) - 规范化 LLM 输出
   - 查询流水线 (Query Pipelines) - 模块化的查询编排
   - 查询引擎 (Query Engines) - 封装好的问答接口

5. 智能体与高级交互 (Agents & Interaction)

   构建具备记忆、工具使用和复杂工作流的 AI 应用。
   - 聊天引擎 (Chat Engines) - 多轮对话封装
   - 记忆 (Memory) - 对话历史管理
   - 工具 (Tools) - 函数调用能力
   - 代理 (Agents) - 自主决策核心
   - 工作流 (Workflows) - 事件驱动的复杂流程控制

6. 部署、监控与评估 (Deployment, Ops & Eval)

   应用上线后的架构、监控和优化。
   - Llama Deploy (或 LlamaDeploy) - 微服务化部署框架
   - 消息队列 (Message Queues) - 处理部署中的异步通信
   - 仪器 (Instrumentation) - 埋点与可观测性
   - 回调 (Callbacks) - 事件触发与日志记录
   - 评估 (Evaluation) - 测试回答质量和检索效果
