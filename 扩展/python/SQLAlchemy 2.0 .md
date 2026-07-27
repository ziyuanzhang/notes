# SQLAlchemy 2.0

## 一、 Core 和 ORM 的本质区别

1. Core 直接操作 SQL；
2. ORM 先操作 Python 对象，再由 flush() 自动转换成 SQL，最终仍然是调用 Connection.execute() 去执行。
   - ORM = Session（对象管理） + Flush（生成 SQL） + Connection.execute（真正执行 SQL） + Commit（提交事务）。

- Core（Connection.execute）

```bash

# Core（Connection.execute）
execute()
    │
    ▼
数据库立即执行 SQL
    │
    ▼
数据进入数据库事务
    │
    ├── commit() → 永久保存
    └── rollback() → 撤销修改
```

- ORM（Session.add）

```bash
# ORM（Session.add）

session.add()
    │
    ▼
仅放入 Session 内存（Identity Map）
    │
    ▼
flush()
    │
    ▼
数据库执行 SQL（execute）
    │
    ▼
数据进入数据库事务
    │
    ▼
commit()
```

### SQLAlchemy 完整执行流程（Core）

```bash
程序开始
    │
    ▼
Engine（连接池）
    │
    ▼
获取 Connection
(engine.connect())
    │
    ▼
BEGIN（implicit）
（第一次 execute() 时自动开始事务）
    │
    ▼
Connection.execute(sql)
    │
    ├── ① SQLAlchemy 解析 SQL
    │
    ├── ② 绑定参数（:id → ? / %s）
    │
    ├── ③ 调用 DBAPI
    │       cursor.execute(...)
    │
    ├── ④ SQL 发送到数据库服务器
    │
    ├── ⑤ 数据库真正执行 SQL
    │       （INSERT / UPDATE / DELETE / SELECT）
    │
    ├── ⑥ 如果是查询
    │       数据库返回结果集(ResultSet)
    │
    ├── ⑦ SQLAlchemy 包装成
    │       Result / CursorResult
    │
    └── ⑧ 如果是修改数据
    │       修改已经发生
    │       但仅存在于当前事务(Transaction)
    │
    ▼
继续执行更多 SQL（可多次 execute）
    │
    ├───────────────┐
    │               │
    ▼               ▼
commit()        rollback()
    │               │
    ▼               ▼
数据库确认修改     数据库撤销当前事务所有修改
永久保存数据       （数据库恢复到事务开始前）
    │               │
    └──────┬────────┘
           │
           ▼
Connection.close()
（连接归还连接池）
```

### ORM 完整执行流程

ORM 多了一层 Session 内存管理。

```bash
程序开始
    │
    ▼
Engine
    │
    ▼
Session(engine)
    │
    ▼
Identity Map（Session 内存）
    │
    ▼
session.add(user)
    │
    ├── User对象加入 Session
    ├── 标记为 New
    └── 此时没有发送 SQL
    │
    ▼
session.flush()
（commit 前通常自动调用）
    │
    ├── Session 检查所有对象变化
    │
    ├── 生成 INSERT / UPDATE / DELETE SQL
    │
    ├── 获取 Connection
    │
    ├── BEGIN（implicit）
    │
    ├── Connection.execute(...)
    │
    ├── SQL 真正发送到数据库
    │
    └── 数据进入当前事务
    │
    ▼
session.commit()
    │
    ├── 若尚未 flush
    │       自动 flush()
    │
    ├── Connection.commit()
    │
    └── 数据永久保存
    │
    ▼
Session.close()

```

### execute() 内部到底发生了什么？

```bash
Connection.execute()
        │
        ▼
① 检查是否已有事务
        │
        ├── 没有
        │      │
        │      ▼
        │   BEGIN（implicit）
        │
        └── 已有事务
               │
               ▼
② SQLAlchemy 编译 SQL
        │
        ▼
③ 绑定参数
        │
        ▼
④ 调用 DBAPI
        │
        ▼
cursor.execute(...)
        │
        ▼
⑤ 数据库收到 SQL
        │
        ▼
⑥ 数据库执行 SQL
        │
        ├── SELECT
        │       │
        │       ▼
        │   返回 ResultSet
        │
        ├── INSERT
        │
        ├── UPDATE
        │
        └── DELETE
        │
        ▼
⑦ SQLAlchemy 包装结果
        │
        ▼
Result / CursorResult
        │
        ▼
返回给 Python
```

⚠️ 注意：execute() 到这里就结束了，它绝不会自动调用 commit()。

### commit() 内部做了什么？

它只是告诉数据库：当前事务中的所有修改 ---> 正式生效

```bash
Connection.commit()
        │
        ▼
DBAPI.commit()
        │
        ▼
数据库 COMMIT
        │
        ├── Undo Log 清理（或标记）
        ├── MVCC 新版本变为可见
        ├── WAL / Redo Log 保证持久化
        └── 事务结束
        │
        ▼
其他事务现在可以看到这些修改
```

### rollback() 内部做了什么？

```bash
Connection.rollback()
        │
        ▼
DBAPI.rollback()
        │
        ▼
数据库回滚事务
        │
        ├── 撤销 INSERT
        ├── 撤销 UPDATE
        ├── 撤销 DELETE
        └── 恢复事务开始前的数据
        │
        ▼
事务结束
```

## 二、MetaData：数据库元数据

1. Metadata（元数据）：描述数据库的数据；
   - 不是用户数据。
   - 不是表里的数据。
   - 而是：描述数据库结构的数据。

2. SQLAlchemy 里的：metadata = MetaData()
   - 不是创建数据库。
   - 而是：创建一个"数据库结构说明书"。

3. MetaData 本质就是：一个保存 Table 的集合。

   可以理解成：`metadata.tables`

   其实像：

   ```python
   {
       "user_account": user_table,
       "address": address_table
   }
   ```

4. Table 就是数据库中的一个表。
   - 数据库：`user_account`, Python：`user_table = Table(...)`;
   - user_table: 不是数据。不是查询。它只是：user_account 表的 Python 对象。以后所有 SQL：select(user_table) 都是根据这个对象生成。

5. Column 就是字段。

   user_table.c.name: Table 里面维护了：columns, 简称：".c"

6. 为什么 MetaData.create_all() 能建表？
   - 所有 Table 都放进了：metadata；
   - SQLAlchemy 做三件事：① 遍历所有 Table --> ② 生成 CREATE TABLE --> ③ 发给数据库
   - (MetaData --> Table --> Column --> CREATE TABLE --> 数据库)
   - 它还会：
     1. 自动判断是否存在
     2. 自动处理外键顺序
     3. 自动开启事务

7. ORM 只是帮你自动生成了 Table。
   - ORM --> Mapped --> mapped_column --> Column --> Table --> MetaData
   - 例如：

   ```python

     class User(Base):
         __tablename__ = "user_account"

         id = mapped_column(primary_key=True)

         name = mapped_column(String(30))
   ```

   实际上 SQLAlchemy 在后台偷偷生成：

   ```python
   user_table = Table(
       "user_account",
       Base.metadata,
       Column("id", Integer, primary_key=True),
       Column("name", String(30))
   )
   ```

   User.**table** 真的存在：Table(...)

8. DeclarativeBase 是什么？

   ```python
      class Base(DeclarativeBase):
        pass
   ```

   它实际上做了两件事情：

   ```bash
   Base
    ├── metadata # 保存所有 Table。
    └── registry # 保存所有 ORM 类。
   ```

   - 因此：Base.metadata 就是：MetaData()
   - 所以：Base.metadata.create_all(engine)和：metadata.create_all(engine)本质一样。

### Core 与 ORM 的关系（整章核心）

### Core 与 ORM 的关系

```bash
                    SQLAlchemy
                        │
        ┌───────────────┴───────────────┐
        │                               │
      Core                             ORM
        │                               │
        │                               │
    MetaData                      DeclarativeBase
        │                               │
        ▼                               ▼
     Table <──────────────────────── 映射类(User)
        │                               │
        ▼                               ▼
     Column                      mapped_column
        │                               │
        └───────────────┬───────────────┘
                        ▼
                  SQL Expression
                        │
                        ▼
                     SQL 语句
                        │
                        ▼
                      数据库
```

关键理解：

- Core：直接编写 Table、Column 等元数据对象。
- ORM：编写 User、Address 等 Python 类，由 SQLAlchemy 自动生成对应的 Table。
- 二者底层完全一致：ORM 并没有绕开 Table，而是在其之上增加了对象映射能力。

###

```bash
                Database Schema（数据库结构）
                           │
                           ▼
                     MetaData（元数据）
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
    Core 手动定义                        ORM 自动生成
        │                                     │
     Table()                           class User(Base)
        │                                     │
     Column()                         mapped_column()
        │                                     │
   PrimaryKey                        Mapped[int]
   ForeignKey                        relationship()
        │                                     │
        └──────────────────┬──────────────────┘
                           ▼
                    Table 对象（统一底层）
                           │
                           ▼
               create_all() / drop_all()
                           │
                           ▼
                     生成 DDL（CREATE TABLE）
                           │
                           ▼
                          数据库

另外，如果数据库已经存在，也可以通过 Reflection（`autoload_with=engine`）从数据库反向生成 `Table` 对象，而不必手工定义。
```

一句话总结

- SQLAlchemy 的一切操作都建立在“元数据（MetaData）”之上。
- Core 需要手工创建 Table 和 Column；
- ORM 通过声明式类自动生成这些对象。无论使用哪种方式，最终都会得到相同的 Table 元数据，再由它生成 SQL、创建表、执行查询和维护对象映射。
