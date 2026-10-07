# DeepAgents-3-模型配置

❗Deep Agents 对模型的核心要求是: 必须支持 Tool Calling

- Provider Profile 有两个层级：
  1. Provider 级别 (提供商)
  2. Model 级别 (具体模型)
  3. 最后2个合并

- 运行时动态切换模型

```python
    @wrap_model_call
    def configurable_model(request, handler):
        model_name = request.runtime.context.model
        model = init_chat_model(model_name)
        return handler(
            request.override(model=model) # Middleware 可以在某一次 Model Call 前修改 request，从而让这一次调用使用不同 Model。
        )

    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": "帮我分析 Redis Cluster"
                }
            ]
        },
        context=Context(
            model="openai:gpt-5.5"
        ),
    )

    Runtime Context
          │
          ↓
    model = "openai:gpt-5.5"
          │
          ↓
    init_chat_model()
          │
          ↓
    得到具体 Model
          │
          ↓
    request.override(model=model)
          │
          ↓
    这一次调用使用这个 Model
# 运行--------------------------
                    Deep Agents
                         │
                         ↓
              create_deep_agent(...)
                         │
                         ↓
                       Agent
                         │
                         │ 组装完成
                         ↓
               agent.invoke() / agent.ainvoke()
                         │
                         ↓
                  ┌──────────────┐
                  │ Agent Runtime│
                  └──────┬───────┘
                         │
              ┌──────────┼──────────┐
              ↓          ↓          ↓
            State     Context    Middleware
                         │          │
                         │          ↓
                         │     修改/增强 Request
                         │          │
                         └──────┬───┘
                                ↓
                         Model Request
                                │
                                ↓
                         Chat Model
                                │
                 ┌──────────────┴──────────────┐
                 ↓                             ↓
              普通回答                       Tool Call
                 │                             │
                 ↓                             ↓
             返回结果                    Agent Runtime
                                               │
                                               ↓
                                          执行 Tool
                                               │
                                               ↓
                                          Tool Result
                                               │
                                               ↓
                                      更新 State/Messages (写回当前执行状态 / 消息)
                                               │
                                               ↓
                                          再次调用 Model
                                               │
                              ┌────────────────┴─────────────┐
                              ↓                              ↓
                         普通回答                        Tool Call
                              │                              │
                              ↓                              └──→ ...
                           结束
# ----------------------------------------------------------
Runtime
┌─────────────────────────────┐
│ State                       │
│ Runtime Context             │
│ Config                      │
│ Execution / Middleware      │
│ Tool execution              │
└─────────────────────────────┘
```

- create_deep_agent() 是“造一个 Agent”；
- agent.invoke() / ainvoke() 是“启动一次 Agent Runtime 执行”；
- Runtime 驱动 Model ↔ Tool ↔ State 的循环，直到满足终止条件。
- LLM 只是其中负责“推理/决定下一步”的一环，并不直接执行 Tool。
