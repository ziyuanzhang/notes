# Alembic

Alembic = SQLAlchemy 项目的数据库结构版本管理工具。

- 它解决的核心问题不是：“怎么操作数据库？”;
  而是：“我的 Python Model 发生变化以后，怎么让数据库结构跟着变化，而且这个变化可以被记录、回滚、多人协作、部署到生产环境？”

- ⚠️ Base.metadata.create_all() 有致命缺陷：只在表不存在时创建，修改已有表结构不会自动同步。
- ❗SQLAlchemy 负责“怎么访问数据库”，Alembic 负责“数据库结构怎么演进”。

1. SQLAlchemy Model: 是“设计图”，
2. Database(数据库): 是“现状”，
3. autogenerate: 是“根据设计图和现状生成施工方案”，
4. Migration: 描述“如何从旧结构变成新结构”
5. 人工 Review: 是“工程师审核施工方案”，
6. upgrade: 才是真正施工。

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

- 只要 Model 修改涉及数据库 schema，并且这个变化需要同步到数据库，就应该产生 migration。
- `alembic revision --autogenerate -m "xxxx"` 流程：

  ① 连接数据库 --> ② 读取数据库当前结构 --> ③ 读取 target_metadata --> ④ 比较两边 --> ⑤ 找出差异 --> ⑥ 生成 migration 文件

- `alembic revision --autogenerate -m "add email"` 🆚 `alembic revision -m "create user table"Alembic`
  两个都会根据：script.py.mako, 生成：versions/xxxx_create_user_table.py

  | 命令                                        | 作用                                    | 修改数据库？ |
  | ------------------------------------------- | --------------------------------------- | ------------ |
  | `alembic revision -m "xxxx"`                | 创建空 migration                        | ❌           |
  | `alembic revision --autogenerate -m "xxxx"` | ❗根据 Model/DB 差异生成 migration 草稿 | ❌           |
  | `alembic upgrade head`                      | 执行 migration                          | ✅           |
  | `alembic check`                             | 检查是否存在新的 migration 需求         | ❌           |

  revision = 写 migration 文件
  upgrade = 执行 migration
  check = 检查有没有 migration 漏掉

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

- revision 是开发人员“制作数据库变更说明书”；
- upgrade 是各个环境“执行这份说明书”。
- 开发、测试、生产都可能执行 upgrade，但每个环境应该连接自己的数据库。

### ❗ 重点行为

1. 改“表名、字段名”：会按照 删除 和 新增
2. 无法自动完成 数据迁移（例 数据合并），需要手动添加逻辑。
3. 表达式变更, 需要人工检查；
4. 多个ModelBase，会依次比较metadata，如果两个 metadata：不能有相同 schema + table否则会冲突。
5. include_name、include_object，用于过滤 Alembic 要比较的对象（例 数据库的表数量 > 当前程序用的表数量）。
6. 自定义类型

## 迁移命令 (真正修改数据库)

- 升级到当前最新版本: `alembic upgrade head`
- 回退到初始状态: `alembic downgrade base`

- 查看当前版本: `alembic current`
- 查看历史: `alembic history`
- 查看详细历史: `alembic history --verbose`
- 升级两个版本: `alembic upgrade +2`
- 回退一个版本: `alembic downgrade -1`
- 检测Model与数据库是否相同: `alembic check` (只检查，不生成 revision)
  1. CI/CD时，CI时 非常有用（例：忘记生成migration 就提交代码）

## 真实项目一般是这样的

⚠️ 生产环境不应该重新 revision --autogenerate。

```bash
          开发环境
              │
              ├── 修改 SQLAlchemy Model
              │        ↓
              ├── alembic revision --autogenerate -m 'xxxxx' # autogenerate 是帮你生成 migration的草稿，不是替你直接修改生产数据库。
              │        ↓
              ├── 人工检查 migration
              │        ↓
              ├──  Git commit
              │        ↓
              └── Git push
                       │
                       ↓
          ┌────────────┴──────────────┐
          ↓                           ↓
        测试环境                     正式环境
          │                           │
 alembic upgrade head           alembic upgrade head
          │                           │
          ↓                           ↓
      测试数据库                     生产数据库
```

开发

```bash
# 1. 修改 Model

# 2. 生成 migration
alembic revision --autogenerate -m "add user email"

# 3. 仔细检查
alembic/versions/xxxx_add_user_email.py

# 4. 确认 upgrade / downgrade 都合理

# 5. 开发数据库执行
alembic upgrade head

# 6. 测试

# 7. Git commit
git add .
git commit -m "add user email"
git push
```

生产

```bash
git pull / CI-CD
    ↓
alembic upgrade head
    ↓
生产数据库
```

## offline/online

Alembic 本身只会操作 env.py 配置所指向的数据库；
生产到底是 alembic upgrade head 直接执行，还是 --sql 生成 SQL 再由 DBA 执行，取决于公司的生产发布策略和数据库权限体系。

- env.py 为什么还要分 Online / Offline？

  ```bash
                   env.py
                     │
             is_offline_mode()
                  /       \
                /           \
           False             True
             ↓                 ↓
      online migration   offline migration
             ↓                 ↓
         connection          no connection
             ↓                 ↓
         DB execute         SQL output
  ```

- 完整 Alembic 思维模型

```bash
                    SQLAlchemy Model
                           │
                           │ 修改
                           ↓
              alembic revision --autogenerate
                           │
                           ↓
                  Migration Python
                           │
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
             Online                Offline
                │                     │
                │                     │
        alembic upgrade head   alembic upgrade head --sql
                │                     │
                ↓                     ↓
         连接真实数据库            不连接数据库
                │                     │
                ↓                     ↓
          执行 SQL                  生成 SQL
                │                     │
                ↓                     ↓
       alembic_version             .sql文件
```

## 命名约束的重要性

数据库 Schema 必须具有稳定、可预测、可迁移的结构。

数据库里的 Foreign Key、Unique、Check、Index、Primary Key 等约束，最好不要让数据库随机命名，而应该由 SQLAlchemy 统一按照规则自动命名。

```python
# ===== models/base.py： =======================================================================
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase


NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(
        naming_convention=NAMING_CONVENTION
    )
# ====== 然后 Alembic：=============================================================================
from app.models.base import Base

target_metadata = Base.metadata
```

Model → Metadata → naming_convention → target_metadata → autogenerate → Migration → upgrade → 生产部署 → Offline SQL。
① Model: 定义的是：我希望数据库长什么样。
② Base.metadata: 保存的是：SQLAlchemy 对数据库结构的描述。
③ target_metadata: 告诉 Alembic：拿这个作为目标结构。
④ revision --autogenerate: 数据库当前结构 VS Base.metadata目标结构 --> diff --> 生成 migration
⑤ naming_convention: 负责：让数据库对象的名字稳定、统一、跨数据库更可控。
⑥ upgrade: 负责：真正执行 migration。
⑦ downgrade: 负责：执行回滚 migration。

## SQLite 和其他数据库的“批量”迁移

SQLite 不擅长 ALTER TABLE(SQLite对传统 ALTER TABLE 的支持非常有限)，所以 Alembic 必要时会采用“新建表 → 搬数据 → 删除旧表 → 重命名新表”的方式完成迁移。

```bash
                    Alembic Migration
                           │
                           ↓
                 修改数据库表结构
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
          PostgreSQL                  SQLite
          MySQL 等                     │
              │                        │
              ↓                        ↓
       ALTER TABLE              ALTER 能力有限
                                       │
                                       ↓
                              batch_alter_table()
                                       │
                                       ↓
                                Reflection
                                       │
                                       ↓
                                  读取旧表
                                       │
                                       ↓
                                创建临时表
                                       │
                                       ↓
                                INSERT SELECT
                                       │
                                       ↓
                                  删除旧表
                                       │
                                       ↓
                              临时表 → 原表名
```

Batch Migration = batch_alter_table() + Reflection + Move & Copy

Foreign Key + CHECK Constraint + Naming Convention

## merge 多个分支

| 现象                          | 含义                              | 通常怎么做             |
| ----------------------------- | --------------------------------- | ---------------------- |
| 一个 head                     | 正常单链                          | `upgrade head`         |
| 两个 head                     | migration 分叉                    | 检查是否应该 merge     |
| Git merge 后出现两个 head     | 常见团队协作情况                  | 通常 `alembic merge`   |
| 想升级所有 head               | 有意保留多个分支                  | `upgrade heads`        |
| 长期独立 migration 分支       | 有意维护多个 lineage              | `branch_labels`        |
| 多个独立 migration 根         | 模块化/复杂项目                   | multiple bases         |
| 一个 branch 依赖另一个 branch | 跨 lineage 依赖                   | `depends_on`           |
| `revision` 报 multiple heads  | Alembic 不知道新 migration 接哪条 | 指定 `--head` 或 merge |

从“单人开发” --> “多人团队 + 复杂项目”的 Alembic

如果两个 migration 没有结构冲突，通常：`alembic merge 003 004 -m "merge migration branches"`

```bash

                 ┌── migration B ──→ migration D ──┐
base → migration A                                 → merge
                 └── migration C ──→ migration E ──┘

# --------------------------------------------------------------
                       Alembic Migration
                              │
                              ↓
                         DAG 有向无环图
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
          Branch            Merge        Multiple Bases
             │                │                │
             ↓                ↓                ↓
       多个 head          合并多个 head      多个 root
             │                                 │
             ↓                                 ↓
       branch_labels                       version_locations
             │
             ↓
      branchname@head
             │
             ↓
        指定分支操作


Multiple Bases
      │
      ↓
不同 migration lineage
      │
      ↓
需要跨 lineage 依赖
      │
      ↓
  depends_on

# --------------------------------------------------------------

                                 SQLAlchemy Model
                                        │
                                        │ 修改
                                        ↓
                           alembic revision --autogenerate
                                        │
                                        ↓
                                 产生 migration
                                        ↓
                                 检查 down_revision
                                        │
                  ┌─────────────────────┴────────────────────────────┐
                  │                                                  │
                  │                                      ┌───────────┴─────────────┐
                  │                                      ↓                         ↓
                  │                                  feature/A                 feature/B
                正常单链                                  │                         │
                  │                                      │           分叉           │
                  ↓                                      ↓                         ↓
            down_revision                            migration A               migration B
                  │                                      │                         │
                  │                                      └───────────┬─────────────┘
                  │                                                  ↓
                  │                                              Git merge
                  │                                                  │
                  │                                                  ↓
                  │                                             多个 heads
                  │                                                  │
                  │                                                  ↓
                  │                                           判断是否需要merge
                  │                                                  │
                  │                                                  ↓
                  │                                   ┌──────────────┴──────────────┐
                  │                                   ↓                             ↓
                  │                                 merge                       有意保留分支
                  │                                   │                             │
                  │                                   ↓                        branch_labels
                  │                               mergepoint（汇合点,唯一head）   multiple bases
                  │                                                                 │
                  │                                                             depends_on
                  └─────────────────────┬───────────────────────────────────────────┘
                                        ↓
                                 Migration DAG
                                        │
                                        ↓
                                 alembic upgrade
                                        │
                                        ↓
                                   数据库结构
```

branch point: 分叉的位置。
head: 每条 migration 路径最末端的 revision。
merge point: 把多个 head 再汇合。
升级所有 heads: `alembic upgrade heads`, 和`alembic upgrade head`有区别。
