# LlamaIndex

指南+官网的示例 + api 参考

[知乎](https://www.zhihu.com/people/he-zhi-dong-87/columns)

## RAG 的 5 个阶段

1. 加载：这指的是将数据从其存储位置（无论是文本文件、PDF、其他网站、数据库还是 API）导入到您的工作流程中。
2. 索引：这意味着创建一种数据结构，以便查询数据。对于 LLM（语言学习模型）而言，这几乎总是意味着创建 vector embeddings 数据含义的数值表示，以及其他多种元数据策略，以便轻松准确地找到与上下文相关的数据。
3. 存储：一旦数据被索引，您几乎总是希望存储索引以及其他元数据，以避免重新索引。
4. 检索：对于任何给定的索引策略，您可以使用 LLM 和 LlamaIndex 数据结构进行查询，包括子查询、多步骤查询和混合策略。
5. 评估：任何流程的关键步骤之一就是检查其相对于其他策略的有效性，或者在进行更改时进行评估。评估提供客观的衡量标准，用于衡量您对查询的响应的准确性、可靠性和速度。

## 一个高级的 LlamaIndex 开发流应该是这样的

1. 阶段 0: 治理与策略

   - 权限 / Policy / Prompt 管理

2. 阶段 1: 数据摄入与索引 (Ingestion & Indexing)

   ```bash
      数据源
      --> 校验 & 清洗
      --> 加载 (Documents)
      --> 摄入管道 (IngestionPipeline)
         |--> Node 建模 (语义节点/层次结构)
              【包含chunk_size、overlap、parent/child、section/heading、page/table/code_block等】
         |--> 切分 (Chunking)--【语义单元建模】
         |--> 元数据提取 (Metadata Enrichment)
             【Filter / Context / Trace--可观测&debug】
         └──> 嵌入 (Embedding Model)
      --> 去重 & 版本控制 (Dedup / Versioning)
      --> 索引构建 (Index) (Vector / Keyword / Graph)
      --> 持久化存储 (Storage) (VectorDB + DocStore)
   ```

3. 阶段 2: 高级查询流程 (Advanced Querying)

   ```bash
      用户输入
      --> 会话上下文 (Conversation Context)
      --> 查询变换 (Query Transformation) (改写/分解问题)
      --> 路由/Agent (Router/Agent) (决策：查库 vs 调工具)----【Control Plane】
      --> 检索 (Retrieval)
         |-->Dense + Sparse + Graph ==> 混合检索
         └──>Fallback Path(失败处理)
      --> 节点后处理 (Node Post-processor)
         |--> 重排序 (Re-ranking) (Cohere/BGE)
         |--> 过滤 (Filtering) (元数据过滤)
         └──> 上下文压缩/选择（Context Compression / Selection）
      --> 响应合成 (Response Synthesis) (Tree Summarize / Compact)
      --> 结构化输出 (Structured Output) (Pydantic)
   ```

4. 阶段 3: 运维与迭代 (Ops & Iteration)

   ```bash
      --> 可观测性 (Observability) 【Trace追踪 + Metrics指标 + Cost成本】
      --> 评估反馈 (Evaluation -- 对检索和生成的质量打分)【评估结果 → 调整 chunk / embedding / index】
      --> 部署 (Deployment) --【API / Service Layer (RAG / Agent / Tool)】
   ```

## LlamaIndex + LangGraph 的 Agent 级架构图

## RAG 性能指标全流程优化

| 目标              | 具体含义                                   | 优化手段                                         |
| ----------------- | ------------------------------------------ | ------------------------------------------------ |
| 召回率(Recall)    | 把知识库里所有相关内容尽可能“捞出来”       | 提升 Embedding 质量、Hybrid 检索、Chunk 切分策略 |
| 精确率(Precision) | 把无关文档剔除，只返回有用文档             | Metadata 过滤、Re-ranking 重排                   |
| 响应时延(Latency) | 用户从提问到返回答案的时间                 | 索引优化、缓存机制、检索并发、减少无效重排       |
| 上下文窗口利用率  | LLM 能用的 tokens 里，放尽可能多的有用信息 | 文档摘要、裁剪无用内容                           |

### 全流程优化步骤

#### 1. Embedding 层优化

| 动作                          | 代码/操作                               | 目的                 |
| ----------------------------- | --------------------------------------- | -------------------- |
| 选择适合场景的 Embedding 模型 | 例: bge-large-en,text-embedding-3-large | 提升语义匹配能力     |
| Embedding 向量归一化          | normalize_L2()                          | 保证相似度计算不失真 |
| Embedding 微调(高级)          | 用业务 Q&A 做 SFT                       | 更贴合业务语义       |

#### 2. 文档 Chunk 切分策略

| 动作                          | 代码/操作                                | 目的                         |
| ----------------------------- | ---------------------------------------- | ---------------------------- |
| Chunk 大小设为 300-500 tokens | LangChain RecursiveCharacterTextSplitter | 粒度刚好，不碎片也不丢上下文 |
| Overlap 设为 20%-30%          | chunk overlap 参数                       | 保持语义连贯，减少“漏召”     |

```python
   ## python复制编辑
   from langchain.text splitter import RecursivecharacterTextSplitter
   text_splitter = RecursivecharacterTextSplitter(
      chunk_size=400,
      chunk_overlap=100,
   )
   docs = text_splitter.split_documents(raw_documents)
```

#### 3. 检索 Top K 值调优

| 动作                  | 代码/操作                 | 目的             |
| --------------------- | ------------------------- | ---------------- |
| TopK=5-10(基础场景)   | 检索调用时设定 top_k 参数 | 兼顾效率与全面性 |
| 复杂问答场景 TopK=20+ | 动态调整 K 值             | 确保召回全面     |

#### 4. Hybrid 检索(向量+BM25)

| 动作             | 代码/操作                   | 目的                 |
| ---------------- | --------------------------- | -------------------- |
| 向量检索匹配语义 | Faiss/PGVector              | 召回“意思相关”的文档 |
| BM25 关键词检索  | Elasticsearch BM25          | 弥补向量检索“漏召”   |
| 两者结合权重加权 | LangChain EnsembleRetriever | 双保险召回更全面     |

```python
# python复制编辑
from langchain.retrievers import EnsembleRetriever
hybrid_retriever=EnsembleRetriever(
   retrievers=[vector_retriever,bm25_retriever],
   weights=[0.6，0.4]
)
```

#### 5. Metadata 过滤(减少噪音)

| 动作                               | 代码/操作                                                           | 目的             |
| ---------------------------------- | ------------------------------------------------------------------- | ---------------- |
| 给文档打标签(产品分类、地域、时间) | 写入 metadata 字段                                                  | 召回时做精确过滤 |
| 检索时加 Filter 条件               | vectorstore.similarity_search(query,filter={"category":"productA"}) | 提升召回精准度   |

#### 6. Re-ranking 重排

| 动作                        | 代码/操作             | 目的                 |
| --------------------------- | --------------------- | -------------------- |
| 简单得分重排                | 相似度排序            | 低成本提效           |
| 使用 Cross-Encoder 模型重排 | bge-reranker-large    | 大幅提升相关性排序   |
| LLM 重排(复杂场景)          | LLM prompt 做二次排序 | 对复杂问题更智能排序 |

#### 7. 查询改写(Query Rewrite)

| 动作                         | 代码/操作                  | 目的       |
| ---------------------------- | -------------------------- | ---------- |
| 使用 Prompt 模板扩充用户提问 | LLM 自动改写问题           | 提升命中率 |
| 典型问题优化模板             | 退款、安装方法、售后政策等 | 低成本优化 |

```python
   # python复制编辑
   rewrite_prompt =f"将用户问题改写为更详细的检索査询:'{user_query}'"
   new_query =llm_chain.run(rewrite_prompt)
```

#### 8. Latency 优化(响应时延)

| 动作               | 代码/操作                  | 目的             |
| ------------------ | -------------------------- | ---------------- |
| 向量库建立高效索引 | Faiss IVF+PQ 或 HNSW       | 提高检索速度     |
| 缓存热门 Query     | Redis /Vercel Edge Caching | 降低重复查询耗时 |
| 并发检索(异步)     | Async 调用 Retriever       | 多检索源加速     |

#### 9. Context Window 管理

| 动作                     | 代码/操作                 | 目的                 |
| ------------------------ | ------------------------- | -------------------- |
| 文档摘要压缩             | 使用 LLM 生成摘要         | 节省 token 窗口      |
| 动态裁剪无关段落         | 只保留与 Query 相关的内容 | 提高有效信息密度     |
| LLM 用 8K/16K 上下文模型 | GPT-4 Turbo/Claude3       | 让模型能“看"更多文档 |

#### 10. 总结

```markdown
# markdown 复制编辑

1.  召回全面性 → Embedding、chunk、Hybrid 检索、Query 改写
2.  精准性 → Metadata 过滤、Re-ranking 重排
3.  响应时延 → 索引优化、缓存、并发检索
4.  有效上下文利用率 → 文档摘要、裁剪、扩窗口模型
```

## LlamaIndex--阅读

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
