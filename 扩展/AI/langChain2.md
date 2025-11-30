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
