# LangChain2

## 1. 介绍

## 2. 各类模型接入 LangChain 流程

- Message: 消息

  1. role: system(系统消息)、user（用户输入）、assistant（模型输出）
  2. content: 消息内容
  3. Metadata:（可选）额外信息，如：消息 ID、响应时间、token 消耗、消息标签等

- 全部响应： model.invoke(message: Message) -> Message
- 流式响应： model.stream(message: Message) -> Generator[Message, None, None]
- 批量响应： model.batch(messages: List[Message]) -> List[Message]

## 3. 模型调用、记忆管理与工具调用流程

## 4. LangChain.0 Agent 开发流程

## 5. LangChain.0 Agent 部署与上线流程

## 6. LangChain Agent 中间件入门介绍

## RAG：公开课

- 问题：

  1. 大模型幻觉 -- 知识库
  2. 上下文“长度”限制
  3. 模型“专业知识与时效性知识”不足

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
