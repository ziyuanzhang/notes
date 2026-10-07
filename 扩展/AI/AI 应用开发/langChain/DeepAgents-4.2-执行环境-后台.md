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
 # ======= 简化 =======================================================================
 Agent 想操作文件
      ↓
 filesystem tools
      ↓
 Backend
      ↓
 具体存储介质
# -------------------------------------------
 LLM
 │ tool call
 ↓
read_file("/workspace/a.py")
 │
 ↓
Filesystem Middleware
 │
 ↓
Backend.read("/workspace/a.py")
 │
 ├── StateBackend --> LangGraph State
 │
 ├── FilesystemBackend  --> 本地磁盘
 │
 ├── StoreBackend --> LangGraph Store
 │
 └── CustomBackend --> 自定义存储介质(S3 / OSS / DB / NAS ...)
```

## Filesystem Tools 是什么？

| Tool         | 作用            |
| ------------ | --------------- |
| `ls`         | 查看目录        |
| `read_file`  | 读取文件        |
| `write_file` | 创建/写入文件   |
| `edit_file`  | 修改文件        |
| `delete`     | 删除            |
| `glob`       | 按模式搜索文件  |
| `grep`       | 搜索文件内容    |
| `execute`    | 执行 Shell 命令 |

## Backend 到底是什么?

文件系统工具背后的“文件操作适配器”。

- Backend作用: 把“文件操作”和“文件存储”解耦。
