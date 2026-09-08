# Alembic

Alembic = SQLAlchemy 项目的数据库结构版本管理工具。

- 它解决的核心问题不是：“怎么操作数据库？”;
  而是：“我的 Python Model 发生变化以后，怎么让数据库结构跟着变化，而且这个变化可以被记录、回滚、多人协作、部署到生产环境？”

- ⚠️ Base.metadata.create_all() 有致命缺陷：只在表不存在时创建，修改已有表结构不会自动同步。
- ❗SQLAlchemy 负责“怎么访问数据库”，Alembic 负责“数据库结构怎么演进”。

## 结构

```bash
yourproject/
│
├── alembic.ini
├── pyproject.toml
│
├── alembic/
│   ├── env.py
│   ├── README
│   ├── script.py.mako
│   │
│   └── versions/
│       ├── 3512b954_add_account.py
│       ├── 2b1ae634_add_order_id.py
│       └── 3adcc9a_rename_username.py
│
└── app/
    ├── models/
    ├── api/
    ├── services/
    └── main.py
```

- alembic.ini: Alembic 的配置入口。

- env.py: 是 Alembic 的核心运行脚本。
- versions/: 保存所有 Migration，数据库 Schema 的历史记录。
- script.py.mako: Migration 文件模板。

- 每个 Migration 都有一个 revision

- 最核心的概念: Revision 链表
  1. revision: 当前版本
  2. down_revision: 上一个版本

## 创建 Alembic 环境: `alembic init alembic`
