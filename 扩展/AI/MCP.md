# MCP

- MCP 体系主要由三部分组成:

1. MCP Host (主机/客户端): 发起请求的 AI 应用程序(例如:Claude Desktop 客户端、Cursor 编辑器)。
2. MCP Server (服务器): 拥有数据的“管家”。它连接着你的本地文件、数据库或 API，并把这些数据翻译成 MCP 协议懂的格式。
3. MCP Client (连接层): 维持 Host 和 Server 之间通信的桥梁(通常集成在 Host 内部)。

- 一句话总结: MCP 就是让 AI 连接万物的通用标准接口。
- MCP 的出现，标志着 A1 从“聊天机器人“向“全能助手(Agent)“进化的关键一步。
