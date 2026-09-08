# Alembic

Alembic = SQLAlchemy 项目的数据库结构版本管理工具。

- 它解决的核心问题不是：“怎么操作数据库？”;
  而是：“我的 Python Model 发生变化以后，怎么让数据库结构跟着变化，而且这个变化可以被记录、回滚、多人协作、部署到生产环境？”

- ⚠️ Base.metadata.create_all() 有致命缺陷：只在表不存在时创建，修改已有表结构不会自动同步。
- ❗SQLAlchemy 负责“怎么访问数据库”，Alembic 负责“数据库结构怎么演进”。

SQLAlchemy Model: 描述“当前期望的结构”
Migration: 描述“如何从旧结构变成新结构”
Database: 真实结构

## 结构

```bash
your project/
│
├── alembic.ini # Alembic 的配置入口。
├── pyproject.toml
│
├── alembic/
│   ├── env.py  # 是 Alembic 的核心运行脚本。
│   ├── README
│   ├── script.py.mako # Migration 文件模板。
│   │
│   └── versions/ # 保存所有 Migration，数据库 Schema 的历史记录。
│       ├── 3512b954_add_account.py # 每个 Migration 都有一个 revision
│       ├── 2b1ae634_add_order_id.py
│       └── 3adcc9a_rename_username.py
│
└── app/
    ├── models/
    ├── api/
    ├── services/
    └── main.py
```

| 操作                      | 开发   | 测试   | 生产   |
| ------------------------- | ------ | ------ | ------ |
| 修改 Model                | ✅     | ❌     | ❌     |
| `revision --autogenerate` | ✅     | 通常❌ | ❌     |
| 检查 migration            | ✅     | 可测试 | ❌     |
| Git 提交 migration        | ✅     | ❌     | ❌     |
| `upgrade head`            | ✅     | ✅     | ✅     |
| 修改对应数据库            | 开发库 | 测试库 | 生产库 |

## 创建 Alembic 环境: `alembic init alembic`

## 创建 Migration ❗最核心的概念

- `alembic revision --autogenerate -m "add email"` 🆚 `alembic revision -m "create user table"Alembic`

  两个都会根据：script.py.mako, 生成：versions/xxxx_create_user_table.py
  1. `alembic revision --autogenerate -m "add email"` ：会自动填充（不可靠，❗需要检查）
  2. `alembic revision -m "create user table"` ：只有模版，需要手动填充

- 生成 migration文件大致：

```python
from alembic import op
import sqlalchemy as sa

revision = "1975ea83b712" # 当前版本
down_revision = None # 上一个版本

def upgrade(): # 数据库往前升级
    op.create_table( # ❗不要盲目相信 autogenerate。
        "account",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("description", sa.Unicode(200)),
    )

def downgrade(): # 数据库往后退
    op.drop_table("account")
```

❗ 代码版本 + Migration 文件 = 数据库 Schema 的可重复演进过程。

## 迁移命令

- 升级到当前最新版本: `alembic upgrade head`
- 回退到初始状态: `alembic downgrade base`

- 查看当前版本: `alembic current`
- 查看历史: `alembic history`
- 查看详细历史: `alembic history --verbose`
- 升级两个版本: `alembic upgrade +2`
- 回退一个版本: `alembic downgrade -1`

## 真实项目一般是这样的

⚠️ 生产环境不应该重新 revision --autogenerate。

```bash
                 开发环境
                    │
             修改 SQLAlchemy Model
                    │
                    ↓
       alembic revision --autogenerate -m 'xxxxx' # autogenerate 是帮你生成 migration，不是替你直接修改生产数据库。
                    │
                    ↓
             检查 migration
                    │
                    ↓
               Git commit
                    │
                    ↓
                Git push
                    │
                    ↓
              ┌─────┴─────┐
              ↓           ↓
           测试环境      正式环境
              │           │
       upgrade head   upgrade head
              │           │
              ↓           ↓
          测试数据库    生产数据库
```
