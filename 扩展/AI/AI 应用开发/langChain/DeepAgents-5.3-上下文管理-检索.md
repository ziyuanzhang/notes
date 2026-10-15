# DeepAgents-5.3-上下文管理-检索 Retrieval

- Knowledge Base（知识库）：知识存在哪里。
- Retrieval（检索）：如何找到相关知识。
- RAG（检索增强生成）：如何把检索到的知识交给 LLM，让它基于这些知识生成答案。
- Agentic RAG（智能体检索增强生成）：让 Agent 自己决定什么时候检索、检索什么，以及是否需要再次检索。
- Hybrid RAG（混合式 RAG）：在检索、生成过程中加入查询优化、结果校验、答案纠错等环节。

向量数据库只是某些检索方案使用的存储与搜索组件。你可以使用 SQL 查询关系型数据库，也可以调用企业 API，或者从已有文档系统中搜索。

## 一、 建立 Retrieval 的层级关系

```bash
AI 应用
|
+-- LLM
|   |
|   +-- 根据上下文生成答案
|   +-- 不能无限读取知识
|   +-- 训练知识不会自动同步业务数据
|
+-- 外部知识访问能力
    |
    +-- Knowledge Base（知识库）
    |   |
    |   +-- PDF / Word / Markdown
    |   +-- PostgreSQL / MySQL
    |   +-- CRM / 内部文档系统
    |   +-- Web API / MCP 服务
    |
    +-- Retrieval（检索能力）
    |   |
    |   +-- Document Loaders
    |   +-- Text Splitters
    |   +-- Embedding Models
    |   +-- Vector Stores
    |   +-- Retrievers
    |
    +-- RAG（检索增强生成）
        |
        +-- 2-Step RAG
        |   +-- 应用先检索
        |   +-- LLM 再生成
        |
        +-- Agentic RAG
        |   +-- Agent 决定是否检索
        |   +-- Agent 调用工具获取信息
        |
        +-- Hybrid RAG
            +-- 查询优化
            +-- 检索结果校验
            +-- 答案质量校验
            +-- 必要时重新检索或生成
```

## 二、Retrieval Pipeline：检索流水线

```bash
# =================== A. 离线 / 数据更新阶段：建立索引 ===================
原始文件 (Google Drive、Slack、Notion、PDF、数据库等)
   ↓
Document Loader(文档加载器) 加载原始数据，统一为 Document 对象
   ↓
Document
   ↓
Text Splitter(文本切分器) 将大文档切分成可独立检索的小块-Chunks
   ↓
Chunks
   ↓
Embedding Model(嵌入模型) 将文本转换成向量
   ↓
Vector Store(向量存储) 保存向量、文本和元数据，提供相似度检索

# =================== B. 在线 / 用户提问阶段：执行检索 ===================
用户问题
   ↓
Query Embedding 将问题转换成向量
   ↓
Retriever(检索器) 根据向量检索相关文档
   ↓
相关 Chunks
   ↓
  LLM 使用用户问题与检索结果生成答案
   ↓
最终答案
```

## 三、三种 RAG 架构：2-Step、Agentic、Hybrid

1. 固定流程优先 - 2-Step RAG
   - 用户提问 → 检索 → LLM 回答。
   - 适合：企业知识库、技术文档问答、固定 FAQ。
   - 优点：容易调试、容易测试、调用次数可控。

2. 自主决定工具调用: Agentic RAG
   - 用户提问 → Agent 判断 → 按需调用工具 → 继续推理。
   - 适合：需要查多个系统、跨来源研究、复杂任务。
   - 优点：灵活。代价：路径、耗时和成本更难预测。

3. 有质量控制的检索生成: Hybrid RAG
   - 问题优化 → 检索 → 校验 → 生成 → 答案评估。
   - 适合：企业级问答、复杂文档分析、需要验证证据的场景。
   - 优点：可以主动发现并处理部分检索和生成问题。代价：架构复杂度更高。

### 3.1 2-Step RAG：先检索，再生成

```bash
用户提问
   ↓
应用程序 / 固定工作流
   ↓
Retriever 检索相关文档
   ↓
获得 Top-K 个文档片段
   ↓
将问题 + 文档片段交给 LLM
   ↓
LLM 生成答案
   ↓
返回用户
```

### 3.2 Agentic RAG：让 Agent 决定何时检索

### 3.3 Hybrid RAG：在检索与生成之间加入质量控制

Hybrid Search（混合检索）: 通常指结合关键词检索和向量检索；
Hybrid RAG（混合式 RAG）: 主要指带有中间验证与纠错步骤的 RAG 架构。

```bash
用户问题
   ↓
查询增强 / 问题改写
   ↓
检索相关文档
   ↓
检索结果校验
   |
   +-- 资料不足 --> 改写问题 --> 再次检索
   |
   +-- 资料足够
          ↓
        LLM 生成答案
          ↓
        答案质量校验
          |
          +-- 质量不合格
          |      ↓
          |   判断是否允许重试
          |      |
          |      +-- 允许 --> 重新检索或重新生成
          |      +-- 不允许 --> 返回最佳可用结果
          |
          +-- 质量合格 --> 返回答案
```
