# langChain-1-结构图

## 一、总体分层（Detailed）

```bash
┌──────────────────────────────────────────────────────┐
│                  应用 / 产品层                         │
│  Agent Gateway / Workflow / API / Replay / Audit     │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Agent & Control 层                       │
│  LangGraph / DeepAgents / Custom Policy              │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│          行为编排 / 能力聚合层                          │
│  Agents / Chains / Tool Routing / Memory             │
│  （langchain facade）                                 │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              协议 & 抽象内核（CORE）                    │
│  Messages / Runnables / Tools / Outputs / Tracing    │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│          外部能力 / 运行环境                            │
│  LLM / MCP / DB / FS / Search / Queue                │
└──────────────────────────────────────────────────────┘
```

## 二、langchain-core（详细到子模块）

📌 核心铁律：

- 所有上层组件
- 只通过这些抽象通信

```bash
langchain_core
├── messages
│   ├── BaseMessage
│   │   ├── content
│   │   ├── additional_kwargs
│   │   └── response_metadata
│   │
│   ├── HumanMessage
│   ├── SystemMessage
│   ├── AIMessage
│   │   ├── tool_calls: list[ToolCall]
│   │   └── usage_metadata
│   │
│   ├── ToolMessage
│   │   ├── tool_call_id
│   │   └── content
│   │
│   └── ToolCall
│       ├── id
│       ├── name
│       └── args
│
├── runnables （LCEL 的“真身”）LCEL 没被废，只是不再当概念宣传
│   ├── Runnable (Protocol)
│   │   ├── invoke()
│   │   ├── ainvoke()
│   │   ├── stream()
│   │   └── astream()
│   │
│   ├── RunnableSequence      (A | B | C)
│   ├── RunnableParallel      ({a: A, b: B})
│   ├── RunnableLambda        (fn)
│   ├── RunnablePassthrough
│   └── RunnableConfig
│       ├── tags
│       ├── metadata
│       └── callbacks
│
├── tools   不负责“调用”, 只描述：我能干什么、参数是什么
│   ├── BaseTool
│   │   ├── name
│   │   ├── description
│   │   ├── args_schema
│   │   └── invoke()
│   │
│   ├── tool decorator
│   └── StructuredTool
│
├── output_parsers
│   ├── BaseOutputParser
│   ├── StrOutputParser
│   ├── JsonOutputParser
│   └── PydanticOutputParser
│
├── prompts
│   ├── BasePromptTemplate
│   ├── ChatPromptTemplate
│   └── MessagesPlaceholder
│
├── callbacks
│   ├── BaseCallbackHandler
│   ├── on_llm_start / end
│   ├── on_tool_start / end
│   └── on_chain_start / end
│
└── tracers
    ├── Run
    ├── Trace
    └── Span
```

## 三、langchain（Facade 层）展开

📌 关键认知

- agents ≠ Agent
- agents = Runnable 组合模板
- 真正的 Agent 控制流在 LangGraph

```bash
langchain
├── chat_models
│   ├── ChatOpenAI
│   ├── ChatAnthropic
│   └── ChatGoogle
│       └── implements Runnable
│
├── tools
│   ├── Tool
│   └── from_function
│
├── agents
│   ├── AgentExecutor
│   ├── OpenAIFunctionsAgent
│   ├── ReActAgent
│   └── ToolCallingAgent
│
├── chains
│   ├── LLMChain
│   └── SequentialChain
│
├── memory
│   ├── ConversationBufferMemory
│   └── BaseMemory
│
└── output_parsers
    └── (re-export from core)
```

## 四、模型适配层（chat_models 独立包）

```bash
langchain-openai
├── ChatOpenAI
│   ├── invoke(messages)
│   └── return AIMessage
│
langchain-anthropic
├── ChatAnthropic
│
langchain-vllm
├── ChatVLLM
```

统一接口：

```css
List[BaseMessage] → AIMessage
```

## 五、langchain-text-splitters（独立工具链）

- ❌ 不参与 Agent
- ❌ 不参与 Message 流

```bash
langchain_text_splitters
├── TextSplitter
│   ├── split_text()
│   └── split_documents()
│
├── RecursiveCharacterTextSplitter
├── TokenTextSplitter
└── MarkdownTextSplitter
```

## 六、langchain-mcp-adapters（协议桥）

```bash
langchain_mcp_adapters
├── MCPClient
├── MCPToolAdapter
│   ├── MCP spec → args_schema
│   ├── invoke() → MCP call
│   └── return ToolMessage
│
└── MCPToolRegistry
```

依赖关系：

```bash
MCP Tool
   ↓
BaseTool
   ↓
Runnable
```

## 七、LangGraph（控制流引擎 · 详细）

📌 LangGraph 的真实角色

- 把 Runnable
- 变成 可回放、可分叉、可审计的 Agent

```bash
langgraph
├── StateGraph
│   ├── add_node(name, Runnable)
│   ├── add_edge(a, b)
│   ├── add_conditional_edges()
│   └── compile()
│
├── State
│   ├── messages: list[BaseMessage]
│   ├── context
│   └── scratchpad
│
├── Node
│   └── Runnable
│
├── Checkpoint
│   ├── MemorySaver
│   └── SQLiteSaver
│
└── Replay
    └── re-run Runnable with state
```

## 八、DeepAgents（组织层）

```bash
deepagents
├── AgentRole
│   ├── system_prompt
│   └── tools
│
├── Planner
├── Executor
├── Critic
│
└── DeepAgent
    └── built on LangGraph
```

## 九、运行时「真实数据流」全展开

```bash
HumanMessage
   ↓
ChatModel.invoke(messages)
   ↓
AIMessage(tool_calls)
   ↓
ToolCall
   ↓
BaseTool.invoke(args)
   ↓
ToolMessage
   ↓
StateGraph.update(messages)
   ↓
Next Node (Runnable)
```

## 十、终极依赖规则（一句话版）

```bash
langchain-core = 语言
langchain      = 方言
LangGraph      = 语法树
Agent          = 约定
```
