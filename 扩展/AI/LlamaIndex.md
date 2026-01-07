# LlamaIndex

指南+官网的示例 + api 参考

## RAG 的 5 个阶段

1. 加载：这指的是将数据从其存储位置（无论是文本文件、PDF、其他网站、数据库还是 API）导入到您的工作流程中。
2. 索引：这意味着创建一种数据结构，以便查询数据。对于 LLM（语言学习模型）而言，这几乎总是意味着创建 vector embeddings 数据含义的数值表示，以及其他多种元数据策略，以便轻松准确地找到与上下文相关的数据。
3. 存储：一旦数据被索引，您几乎总是希望存储索引以及其他元数据，以避免重新索引。
4. 查询：对于任何给定的索引策略，您可以使用 LLM 和 LlamaIndex 数据结构进行查询，包括子查询、多步骤查询和混合策略。
5. 评估：任何流程的关键步骤之一就是检查其相对于其他策略的有效性，或者在进行更改时进行评估。评估提供客观的衡量标准，用于衡量您对查询的响应的准确性、可靠性和速度。

## 一个高级的 LlamaIndex 开发流应该是这样的

0. 阶段 0: 治理与策略

   - 权限 / Policy / Prompt 管理

1. 阶段 1: 数据摄入与索引 (Ingestion & Indexing)

   ```bash
      数据源 (LlamaHub)
      --> 加载 (Documents)
      --> 摄入管道 (IngestionPipeline)
         |--> Node 建模 (Semantic / Hierarchical)
         |--> 切分 (Chunking)----【语义单元建模】
         |--> 元数据提取 (Metadata Enrichment) (Filter / Context / Trace)
         └──> 嵌入 (Embedding Model)
      --> 去重 & 版本控制 (Dedup / Versioning)
      --> 索引构建 (Indexing) (Vector / Keyword / Graph)
      --> 持久化存储 (Storage) (Vector DB + DocStore)
   ```

2. 阶段 2: 高级查询流程 (Advanced Querying)

   ```bash
      用户输入
      --> 会话上下文 (Conversation Context)
      --> 查询变换 (Query Transformation) (改写/分解问题)
      --> 路由/Agent (Router/Agent) (决策：查库 vs 调工具)----【Control Plane】
      --> 检索 (Retrieval) (Dense + Sparse 混合检索)
      --> 节点后处理 (Node Post-processor)
         |--> 重排序 (Re-ranking) (Cohere/BGE)
         |--> 过滤 (Filtering) (元数据过滤)
         └──> 上下文压缩/选择（Context Compression / Selection）
      --> 响应合成 (Response Synthesis) (Tree Summarize / Compact)
      --> 结构化输出 (Structured Output) (Pydantic)
   ```

3. 阶段 3: 运维与迭代 (Ops & Iteration)

   ```bash
      --> 可观测性 (Observability) (Arize Phoenix / LangSmith 追踪 Trace)----【Trace + Metrics + Cost】
      --> 评估 (Evaluation) (对检索和生成的质量打分)（评估结果 → 调整 chunk / embedding / index）
      --> 部署 (Deployment) (LlamaDeploy / Docker / FastAPI)-----【API / Service Layer (RAG / Agent / Tool)】
   ```

## LlamaIndex + LangGraph 的 Agent 级架构图
