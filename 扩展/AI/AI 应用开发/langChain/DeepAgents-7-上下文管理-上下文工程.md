# DeepAgents-7-上下文管理-上下文工程

## 一、Deep Agents 的五类上下文

Input Context：启动时给 Agent 什么指令、记忆和技能。
Runtime Context：每次执行任务时，向 Agent 的运行环境传入什么配置和依赖。
Context Compression：上下文过长时，如何压缩历史或把大内容转存到文件。
Context Isolation：如何让 Subagent 独立完成繁重工作，只向主 Agent 返回结果。
Long-term Memory：如何跨线程、跨对话持久保存需要长期使用的信息。

| 上下文类型          | 中文理解     | 主要职责                       | 作用范围                    |
| ------------------- | ------------ | ------------------------------ | --------------------------- |
| Input Context       | 输入上下文   | 启动时提供提示词、记忆、技能等 | 每次运行时构建              |
| Runtime Context     | 运行时上下文 | 传入用户元数据、密钥、连接等   | 单次运行，并传播给子 Agent  |
| Context Compression | 上下文压缩   | 卸载大内容、总结历史消息       | 上下文接近容量限制时        |
| Context Isolation   | 上下文隔离   | 将繁重工作交给独立的子 Agent   | 每个子 Agent 的独立执行过程 |
| Long-term Memory    | 长期记忆     | 跨线程保存可复用的信息         | 跨对话持久化                |

## 二、建立完整的层级关系

```bash
create_deep_agent(...)
        ↓
+--------------------------------------+
|         Deep Agent Harness           |
|                                      |
|  1. Input Context                    |
|     +-- System Prompt                |
|     +-- Memory (AGENTS.md)           |
|     +-- Skills                       |
|     +-- Tool Prompts                 |
|     +-- Middleware Prompts           |
|                                      |
|  2. Runtime Context                  |
|     +-- User ID / Role               |
|     +-- API Keys / Connections       |
|     +-- Feature Flags                |
|                                      |
|  3. State / Checkpoint               |
|     +-- Messages                     |
|     +-- Custom State                 |
|     +-- Thread Progress              |
|                                      |
|  4. Context Management               |
|     +-- Offloading                   |
|     +-- Summarization                |
|     +-- Context Isolation            |
|                                      |
|  5. Long-term Memory Backend         |
|     +-- CompositeBackend             |
|     +-- StoreBackend                 |
+--------------------------------------+
        |
        | agent.invoke(...) / ainvoke(...)
        ▼
+--------------------------------------+
|             Agent Runtime            |
|                                      |
|  Model <----> Tools                  |
|    |           |                     |
|    |           +--> Filesystem       |
|    |           +--> Database         |
|    |           +--> External APIs    |
|    |                                 |
|    +--> Context / Middleware         |
|    +--> State updates                |
|    +--> Subagent delegation           |
+--------------------------------------+
        |
        +------> Subagent A
        |          +-- 独立上下文
        |          +-- 独立工具调用
        |          +-- 返回精简结果
        |
        +------> Subagent B
                   +-- 独立上下文
                   +-- 独立工具调用
                   +-- 返回精简结果
```

- Deep Agent Harness：负责组装 Agent 的能力、指令和运行机制。
- Input Context：是 Agent 获得指令与背景知识的来源。
- Runtime Context：是一次运行过程中供工具、Middleware 等读取的配置。
- State：是 Agent 执行过程中可变的图状态，可参与 Checkpoint 持久化。
- Backend：决定虚拟文件系统中的内容如何读写和存储。
- Context Management：负责减少上下文负担，或将任务分离。
- Subagent：是主 Agent 委派工作的执行单元，拥有自己的上下文。

## 三、Input Context：启动时提供什么信息？

### 3.1 完整 System Prompt 组成部分

```bash
Complete System Prompt
|
+-- 1. Custom system_prompt
|
+-- 2. Base agent prompt
|
+-- 3. Memory prompt
|      +-- AGENTS.md
|      +-- Memory 使用说明
|
+-- 4. Skills prompt
|      +-- 技能位置
|      +-- 技能 frontmatter 信息
|      +-- 技能使用说明
|
+-- 5. Virtual filesystem prompt
|      +-- 文件读写工具说明
|      +-- execute 工具说明（适用时）
|
+-- 6. Subagent prompt
|      +-- task 工具使用说明
|
+-- 7. 自定义 Middleware prompts
|
+-- 8. Human-in-the-loop prompt（启用时）
```

## 四、Runtime Context：每次运行时传入什么配置？
