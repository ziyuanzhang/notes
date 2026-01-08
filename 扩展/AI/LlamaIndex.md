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
   retrievers=[vector retriever,bm25_retriever],
   weights=[0.6，0.4]
)
```

### 5. Metadata 过滤(减少噪音)

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
