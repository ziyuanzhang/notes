# DeepAgents-5.1-上下文管理-tools

- Skills: 面向特定任务的操作流程，按需读取(告诉Agent怎么做)。

- Memory: 持久上下文(启动时加载)
  1. 保存项目规范、架构约定、用户偏好等相对持久的信息。
  2. 例: 项目约定，通过 AGENTS.md 等文件提供。

- Tools: 供Agent 调用的程序化操作，
- Backend: 管理文件访问，
- Permissions: 决定哪些操作被允许，
- Sandbox: 提供受隔离的执行环境，
- Runtime: 驱动整个任务循环。

❗Skill 是可按需加载的任务知识与工作流程，不是一个独立的 Agent，也不是一个 Tool。

## 一个 Skill 的基本结构如下

```bash
  ---
  name: langgraph-docs
  description: >
    Use this skill for requests related to LangGraph
    in order to fetch relevant documentation and provide
    accurate, up-to-date guidance.
  ---

  # langgraph-docs

  ## Instructions

  1. Fetch the documentation index.
  2. Select relevant documentation.
  3. Fetch and synthesize the sources.
  4. Include source links in the answer.
```

| 字段          | 是否必需 | 用途                             |
| ------------- | -------- | -------------------------------- |
| name          | 是       | 技能名称，必须匹配父目录名       |
| description   | 是       | 说明技能用途及触发场景           |
| license       | 否       | 许可证信息                       |
| compatibility | 否       | 环境要求，例如网络访问、系统依赖 |
| metadata      | 否       | 自定义元数据                     |
| allowed-tools | 否       | 实验性的预批准工具列表           |

- 发现阶段模型主要看到的是技能的 name 和 description
- 建议把 SKILL.md 的正文控制在 5000 Token 以下，并将详细参考资料拆到 references/ 等文件中。
- Deep Agents 的文件发现还有单独的文件大小限制：超过 10 MB 的技能文件会被跳过。

## skills/ 存文件，FilesystemBackend 读文件，SkillsMiddleware 管理技能加载

## Skills 的目录结构与配置

```bash
  my-project/
  ├── skills/
  │   ├── langgraph-docs/
  │   │   ├── SKILL.md   # 技能名称、触发条件、操作指令
  │   │   └── references/  # 需要时再读取的辅助知识和详细参考资料
  │   │       └── api-patterns.md
  │   └── pdf-processing/
  │       ├── SKILL.md
  │       ├── scripts/  # 可以被执行的脚本
  │       │   └── extract.py
  │       └── assets/  # 模板、图片、Schema 等静态资源
  │           └── template.json
```

❗ 不是每个 Skill 都需要这三个子目录。最简单的 Skill 只需要一个 SKILL.md。

```python
  from deepagents import create_deep_agent
  from deepagents.middleware import SkillsMiddleware
  from deepagents.backends.filesystem import FilesystemBackend
  from langchain.tools import tool

  @tool
  def list_issues(team: str) -> str:
      """List open issues for a Linear team."""
      return f"{team}-101: Login page times out"

  @tool
  def create_issue(team: str, title: str) -> str:
      """Create a Linear issue and return its ID."""
      return f"{team}-102: {title}"

  backend = FilesystemBackend(
      root_dir="./my-project", # 指定文件系统的根目录。
      virtual_mode=True,
  )
  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      backend=backend,  # backend-1
      skills=["./my-project/skills/"], # skills 指向的是包含多个技能目录的上级目录，而不是直接指向某个 SKILL.md 所在的技能目录.
      middleware=[
          SkillsMiddleware(
              backend=backend, # backend-2, 让 SkillsMiddleware 通过这个后端访问文件
              sources=["/skills/"], # 指定从哪个虚拟路径发现技能。
              tools=[list_issues, create_issue], # Skill 可以绑定工具，但不等于工具
          ),
      ],
  )
```

## 加载过程: 渐进式披露

1. 启动时加载:(发现技能) 读取每个 SKILL.md 的 frontmatter，提取 name 和 description，注入 System Prompt。
2. 任务匹配时:(读取技能) Agent 决定使用某个 Skill 后，通过 read_file 读取它的完整 SKILL.md。
3. 按需发生:(读取资源) 模型根据技能说明，进一步读取 references/、scripts/、assets/ 等资源。

- 一个技能加载机制，分为三个信息逐步展开的阶段；
- SkillsMiddleware 负责: 技能发现 与 指令加载，后续操作由 Agent 的执行循环继续推进。

## Skill 的高级能力：工具、权限、子 Agent 与多来源

### 1. Skill 可以绑定工具，但不等于工具

- 当工具仅通过 SkillsMiddleware(tools=...) 提供时：
  1. Agent 尚未读取对应 Skill：这些技能工具不可用，调用会失败。
  2. Agent 读取了 Skill：对应工具才会变得可用。
  3. 如果后续对话摘要丢掉了技能读取记录，工具可能再次不可用，需要重新读取或固定该技能。

- 三种工具暴露方式

  | 配置方式                                | 读取 Skill 前      | 读取 Skill 后 |
  | --------------------------------------- | ------------------ | ------------- |
  | 只通过 SkillsMiddleware(tools=...) 提供 | 隐藏、不可调用     | 可用          |
  | 提供给 Agent 的工具列表，并启用延迟加载 | 可通过工具搜索发现 | 可用          |
  | 直接提供给 Agent 的普通工具列表         | 始终可见           | 始终可见      |

- 工程上的选择：
  - 通用工具：直接提供给 Agent。
  - 低频、专用工具：可以考虑延迟加载。
  - 只应在特定流程中开放的工具：可以考虑通过 Skill 门控。

### 2. 动态工具解析：resolve_skill_tools

MCP 根据用户信息 动态返回 工具列表；
❗解析函数应当保持快速，因为它可能在模型调用前以及技能工具调用前反复运行；如果使用异步解析函数，则应使用 Agent 的异步执行方法，例如 ainvoke()。

### 3. 多个 Skill 来源与覆盖顺序: 后面的来源覆盖前面的来源

### 4. 子 Agent 不一定继承主 Agent 的所有技能
