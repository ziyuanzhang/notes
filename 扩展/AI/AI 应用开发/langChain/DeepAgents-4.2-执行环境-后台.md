# DeepAgents-4.2-执行环境-后台

Backend 不是 Agent 的“工具”，而是 Agent 文件系统工具背后的“存储/执行实现”。

```bash
                                Deep Agent
                                    │
                              Agent Runtime
                        ┌───────────┴───────────┐
                        ▼                       ▼
              Execution Environment            。。。。
                        │
             ┌──────────┼───────────┐
             ▼          ▼           ▼
       localShell   Filesystem    Sandbox
                        │
                        ▼
              Filesystem Middleware
                        │ 提供
                        ▼
        ┌───────────────┴───────────────┐
        │       filesystem tools        │
        │                               │
        │ ls / read_file / write_file   │
        │ edit / delete / glob / grep   │
        └───────────────┬───────────────┘
                        │ 操作通过 Backend 执行
                        ▼
                     Backend (Filesystem Tools 操作的实际数据层适配器)
                        │
       ┌────────────────┼─────────────────┐
       ↓                ↓                 ↓
 StateBackend     FilesystemBackend   StoreBackend
       ↓                ↓                 ↓
 LangGraph State   本地真实磁盘       LangGraph Store


 # Backend 不是“Filesystem Middleware 的下一层运行环境”
 # 也就是说：read_file() 并不直接决定“去哪里读文件”，而是通过 Backend 抽象决定数据落在哪里。
```
