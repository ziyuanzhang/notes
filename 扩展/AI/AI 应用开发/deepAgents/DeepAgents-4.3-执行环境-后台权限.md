# DeepAgents-4.3-执行环境-后台权限

Permission = 能不能操作
Backend = 怎么操作 / 存在哪里

```bash
                         Agent Runtime
                              │
                              ▼
                             LLM
                              │
                              ▼
                       Filesystem Tool
                              │
                              ▼
                        Policy Wrapper
                        （策略包装层）
                              │
                              ▼
                         Permission
                         （权限控制）
                              │
                              ▼
                   FilesystemPermission
                       （文件权限规则）
                              │
                       ┌──────┴──────┐
                       ▼             ▼
                     允许           拒绝
                       │             │
                       ▼             ▼
                    Backend      返回拒绝结果
                       │
                       ▼
                    文件写入
```

## Permissions

- 主要解决三个问题：
  1. 操作权限： 可以读，不能写；或者读写都不允许。
  2. 路径权限： 可以操作 /workspace/，但不能操作 /secrets/。
  3. 人工审批： 对某些写操作先暂停，等待人类批准。

- Permissions 管哪些工具？

  | 操作类型 | 涵盖的内置工具                | 典型用途             |
  | -------- | ----------------------------- | -------------------- |
  | read     | ls、read_file、glob、grep     | 浏览、搜索、读取文件 |
  | write    | write_file、edit_file、delete | 创建、修改、删除文件 |

- 第一个匹配的规则决定结果；如果没有任何规则匹配，则默认允许。
- 先检查例外，再检查一般规则，最后兜底。

## 边界

1. delete 删除目录时更严格;
   - 删除目录时会检查目标目录及其所有后代路径的 write 权限。只要有一个后代路径被禁止，整个目录删除操作就会被拒绝，而不是只删除允许删除的部分。

2. CompositeBackend 与 Sandbox 的限制;
   - 如果 CompositeBackend 的默认后端是 Sandbox，权限规则必须限定在已知的路由前缀内。

3. 父 Agent 与子 Agent 的权限关系;
   - 默认情况下，子 Agent 继承父 Agent 的权限。
   - 如果在子 Agent 的定义中单独设置 permissions，则会完全替换父 Agent 的规则，而不是在父规则上追加几条。

## 为什么配置了 Permissions，系统仍然可能不安全？

permissions 只作用于以下内置文件工具：ls、read_file、glob、grep、write_file、edit_file、delete

它不会自动保护自定义工具、MCP 工具，也不适用于能够任意执行命令的 Sandbox 后端。

## demo

```python
from deepagents import FilesystemPermission, create_deep_agent

permissions = [
    # 禁止读取或修改敏感文件
    FilesystemPermission(
        operations=["read", "write"],
        paths=["/workspace/.env"],
        mode="deny",
    ),

    # 允许工作区内其他文件
    FilesystemPermission(
        operations=["read", "write"], # 限制什么操作,;["read"]、["write"] 或二者同时指定。
        paths=["/workspace/**"], # 限制哪些路径; 使用 Glob 模式，例如 /workspace/**、/workspace/.env。
        mode="allow", # 匹配后如何处理; allow 允许、deny 拒绝、interrupt 暂停并请求人工审批。
    ),

    # 拒绝其他路径
    FilesystemPermission(
        operations=["read", "write"],
        paths=["/**"],
        mode="deny",
    ),
]

agent = create_deep_agent(
    model=model,
    backend=backend,
    permissions=permissions,
)
```
