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

### 总结

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

## 三、处理数据

### 1. 使用 INSERT 语句

如何利用 Table 元数据生成 INSERT SQL，并把 Python 数据写入数据库。

- 完整生命周期

```bash
    Python代码
          │
          ▼
SQL表达式对象（Insert / Select / Update 对象）
          │
          ▼
Connection.execute(stmt)
          │
          ▼
SQLAlchemy内部自动 compile(stmt)     ←--- SQLAlchemy 内部自动调用
          │
          ▼
    Compiled 对象 (SQL字符串 + Bind Parameters)
          │
          ▼
DBAPI cursor.execute(sql, params)
          │
          ▼
      数据库执行 SQL
          │
          ▼
        事务(Transaction)
          │
          ├── commit()   → 永久保存
          └── rollback() → 撤销
```

- 学习重点（按优先级）
  1. 理解 insert() 创建的是 SQL 表达式对象，而不是立即执行 SQL。
  2. 掌握 Connection.execute() + commit() 的执行流程。
  3. 熟悉推荐的插入方式：insert(table) + execute(dict 或 list[dict])，让 SQLAlchemy 自动生成 VALUES。
  4. 会使用 result.inserted_primary_key 获取插入后的主键。
  5. 理解 RETURNING 的作用，以及它能避免额外的 SELECT 查询。返回当前插入的
  6. 了解 INSERT ... FROM SELECT 和标量子查询等高级用法即可，实际开发中更多由 ORM 或特定的数据迁移场景使用。

  ```python
      stmt = insert(user_table).values(name="Tom") # 生成 Insert对象，而不是 sql语句（例INSERT INTO ...）
      compiled = stmt.compile()   # 手动编译
      print(compiled) # 生成的 SQL 语句
      compiled.params # 生成的参数
  ```

- RETURNING ： 把当前这条 DML（INSERT / UPDATE / DELETE）影响到的记录直接返回。

  ```python
  # 单个插入
      stmt = insert(user_table).values(name="Tom").returning(user_table.c.id)
      # 或 --  最外层的小括号 () 在 Python 语法中被称为隐式行连接（Implicit Line Continuation）。
      # 它的核心作用是：告诉 Python 解释器，当前的语句还没有结束，即使换行了也不要报错，请继续读取下一行，直到遇到闭合的括号为止。
      # 使用 中括号 [] 或大括号 {}  --> 列表或字典
      stmt = (
          insert(user_table)
          .values(name="Alice")
          .returning(user_table.c.id, user_table.c.name)
       )
      # SQL 大概是： INSERT INTO user_account (name) VALUES ('Alice') RETURNING id, name;
      result = conn.execute(stmt)
      row = result.one() # 获取一行数据
      print(row) # (1, 'Alice')
      print(result.inserted_primary_key) # (1,)

  # 批量插入 -- 批量插入推荐一次传入 list[dict]，让 SQLAlchemy 使用底层数据库驱动的批量执行能力。

      stmt = (
          insert(user_table)
          .returning(user_table.c.id, user_table.c.name,user_table.c.full_name)
      )
      # stmt 中 VALUES 为什么可以省略？
      # 因为 SQLAlchemy 会根据 dict 中的键名，自动推导出 VALUES 应该有哪些列。
      result = conn.execute(
          stmt,
          [
              {"name": "Alice",full_name:"Alice Full Name"},
              {"name": "Bob",full_name:"Bob Full Name"},
              {"name": "Charlie",full_name:"Charlie Full Name"},
          ],
      )
  ```

- INSERT FROM SELECT

  ```python
    select_stmt = select(
        user_table.c.id,
        user_table.c.name + "@aol.com"
    )

    insert_stmt = insert(address_table).from_select(
        ["user_id", "email_address"],
        select_stmt,
    )
    # select_stmt：决定数据从哪里来（数据源）。
    # ["user_id","email_address"] 表示的是：SELECT 返回的数据，要插入目标表（address_table）的哪些列。
    # ⚠️注意：这里靠的是顺序匹配。不是名称匹配
  ```

### 2. 使用 SELECT 语句

- 整体知识结构

```bash
SELECT
│
├── 1. 创建查询
│   ├── select()
│   ├── execute()
│   └── Result
│
├── 2. 查询什么 # ⑤ 混合查询 select(User.name,Address) ---> tuple(string, Address)
│   ├── Table # ① 查询整个表； Core： select(user_table) --> tuple
│   ├── ORM Entity # ③ 查询 ORM 实体； select(User) --> User对象
│   ├── Column #  ② 查询某几个列； Core： select(user_table.c.id, user_table.c.name) --->tuple
│   ├── Label #  ④ 查询 ORM 字段 select(User.name,User.fullname) --->tuple
│   └── Text
│
├── 3. 查询条件
│   ├── WHERE
│   ├── ORDER BY # 排序
│   ├── GROUP BY # 分组
│   ├── HAVING # 过滤
│   └── JOIN
│
├── 4. 高级查询
│   ├── Alias # 别名
│   ├── Subquery # 普通子查询 --> 返回临时表
│   ├── Scalar Subquery # 标量子查询 --> 返回单个值
│   ├── CTE # 子查询(公共表达式) 与 Subquery（普通子查询）功能几乎一样，大型 SQL 一般推荐 CTE，可读性更好
│   ├── UNION （集合操作）
│   ├── EXISTS # 判断"是否存在满足条件的记录"
│   ├── SQL Function （SQL 函数 - func）
│   ├── Window Function （窗口函数）
│   └── Table Function （表值函数）
```

- FROM、JOIN、join_from、select_from、ON：
  1. FROM: 从哪张表开始查询，`stmt = select(User.name)`SQLAlchemy 会自动推导 FROM为User；
  2. JOIN: 按照某个关联条件，把两张（或多张）表连接起来查询;
  3. ON: 按照 ON 条件建立关联；
     - 单个外键可以省略，
     - 多个外键需要指定；`stmt = (select(User, Order).join(Order,User.id == Order.buyer_id))`

  4. join_from(): 指定 JOIN 的起点，从哪张表开始，到哪张表结束；
     - join_from(): 则同时包含：FROM+JOIN;
     - `stmt = (select(User.name).select_from(Address))`

  5. select_from(): 只指定起始表，不会自动 JOIN; 只要 SELECT 中没有足够的信息确定表，就需要显式指定 FROM。
     - `stmt = (select(User.name).select_from(Address))` --> 报错⚠️
     - select_from() --> ROM;
     - join_from()-->FROM + JOIN

  | SQLAlchemy                                               | SQL 含义                                         |
  | -------------------------------------------------------- | ------------------------------------------------ |
  | `select(User)`                                           | `SELECT * FROM user_account`                     |
  | `select(User.name)`                                      | `SELECT name FROM user_account`（FROM 自动推导） |
  | `select(User).join(Address)`                             | `FROM user_account JOIN address`（ON 自动推导）  |
  | `select(User).join(Address, User.id == Address.user_id)` | `JOIN ... ON ...`（手动指定 ON）                 |

- JOIN 与 UNION: 把多个 SELECT 的结果，合并成一个结果集;
  1. JOIN —— 横向拼接（增加列）
  2. UNION —— 纵向拼接（增加行）
     - UNION 要求：① 列数一致, ② 列顺序一致, ③ 数据类型最好兼容

  3. UNION: 自动去重，UNION ALL: 不会去重
  4. INTERSECT: 求交集。
  5. EXCEPT: 求差集(第一组独有的行)。

  把多个 SELECT 的结果按照相同的列结构纵向合并，而不是像 JOIN 一样按关联关系横向拼接

  ```bash
    SELECT
         │
         ▼
    Select对象
         │
         ├──────── JOIN
         │
         ├──────── Subquery
         │
         ├──────── CTE
         │
         ├──────── EXISTS
         │
         └──────── UNION
  ```

- JOIN 与 EXISTS:
  1. JOIN 是为了"取关联数据"，返回匹配的数据行；
  2. EXISTS 是为了"判断关联数据是否存在"，只返回 TRUE/FALSE；
     - EXISTS 本质上就是"把一个 SELECT 子查询变成一个布尔条件"，供外层 WHERE 使用。

  ```bash
    select(...)
          │
          ▼
    where(...)
          │
          ▼
    subquery（子查询）
          │
          ▼
    exists()
          │
          ▼
    WHERE EXISTS(...)
  ```

### 3. 使用 UPDATE 和 DELETE 语句

- UPDATE 可以引用列：

  ```python
    stmt = (
      update(user_table)
      .where(user_table.c.name == "patrick")
      .values(fullname="Patrick")
    )
    # ---- 可拼接（数据库里执行） -------
    .values(
      fullname="Username: " + user_table.c.name
    )
  ```

- executemany 更新（批量更新）-- bindparam

  ```python
    stmt = (
        update(user_table)
        .where(user_table.c.name == bindparam("oldname"))
        .values(name=bindparam("newname"))
    )
    # -----------
    conn.execute(
        stmt,
        [{
              "oldname":"jack",
              "newname":"ed"
          },
          {
              "oldname":"wendy",
              "newname":"mary"
          }]
    )
  ```

- 单表 与 “MySQL多表” 的更新和删除

  ```bash
    # 一个表  （推荐写法）
    .values(fullname="Tom")

    # 多个表（MySQL 特有）  （必须写法）
    .values({
        user_table.c.fullname: "Tom",
        address_table.c.email_address: "abc@qq.com"
    })

  ```

  字典不是 MySQL 专用，而是 SQLAlchemy 为了解决"多表更新时列属于哪个表"的问题。
  普通 UPDATE（包括 MySQL）依然推荐使用 .values(fullname="Tom")，只有 MySQL 多表 UPDATE 才必须使用字典指定每个列对应的表。

- rowcount（重点）

  ```python
   # 执行 UPDATE、DELETE 后：
    result = conn.execute(stmt)
    print(result.rowcount) # -->3  不是：修改了3行；而是：匹配到了3行; ⚠️如果返回0，则没有匹配到任何行，ORM 就知道：提交失败。
  ```

- UPDATE RETURNING 与 DELETE RETURNING --> 返回匹配行的指定key

  ```python
  stmt = (
      update(user_table)
      .where(user_table.c.name=="patrick")
      .values(fullname="Patrick")
      .returning(
          user_table.c.id,
          user_table.c.name
      )
  )
  ```

  ```bash
                      UPDATE / DELETE
                             │
            ┌────────────────┼────────────────┐
            │                │                │
        update()         delete()        returning()
            │                │                │
        where()          where()        返回匹配行
            │
        values()
            │
            ├── 普通赋值
            ├── 列表达式
            ├── 子查询（相关更新）
            ├── UPDATE ... FROM（跨表更新）
            ├── MySQL 多表 UPDATE
            └── ordered_values()（MySQL 特有）

  执行：
  Connection.execute()
          │
          ▼
  CursorResult
          │
          ├── rowcount（WHERE 匹配的行数）
          └── 返回 RETURNING 的结果集（若使用）
  ```

## 四、使用 ORM 进行数据操作

ORM 管对象, Core 管 SQL

- ORM 不直接操作 SQL，而是操作 Python 对象；
- Session 负责跟踪对象变化，在合适的时候统一转换成 SQL。

- 整个生命周期只有下面几个状态。

  ```bash
    创建对象
       │
       ▼
    Transient（瞬态）
       │ add()
       ▼
    Pending（挂起）
       │ flush
       ▼
    Persistent（持久）
       │ delete
       ▼
    Deleted（删除）
       │ close
       ▼
    Detached（分离）
  ```

- ORM（Session）知识结构（推荐牢记）

  ```bash
           创建对象
              │
              ▼
      Transient（瞬态）
              │
        session.add()
              │
              ▼
       Pending（挂起）
              │
           flush()
              │
              ▼
   INSERT / UPDATE / DELETE
              │
              ▼
        Persistent（持久）
        │             │
        │修改属性      │delete()
        │             │
        ▼             ▼
    Dirty（脏对象）  Deleted（待删除）
        │             │
        └─── flush ───┘
              │
           commit() --提交事务
              │
              ▼
          数据永久保存
              │
           rollback() --回滚事务
              │
              ▼
       对象恢复数据库状态
              │
        session.close() --关闭会话
              │
              ▼
        Detached（分离）
  ```

- Autoflush（自动刷新）：

  `session.execute(select(...))` 执行顺序：SELECT/DELETE --> Autoflush --> UPDATE --> SELECT/DELETE

- Identity Map：Session 使用 Identity Map 模式，确保内存中每个数据库主键只对应一个 Python 对象实

- ORM 的“工作单元模式”会追踪所有类型的待同步更改
  1. `session.new`:所有待插入的新对象。
  2. session.dirty：所有待更新的已存在对象。
  3. 待删除队列：所有待删除的对象。

- `session.close()`会做三件事：
  1. 回滚未提交事务（如果存在）。
  2. 释放数据库连接回连接池。
  3. 将所有对象从 Session 中移除，进入 Detached（分离） 状态。
     - 此时 操作对象属性，不会报错，因为对象只是普通python对象；只是不会同步数据库。

1. ORM 操作的是 Python 对象，不是 SQL。 对象创建后先处于 Transient 状态，加入 Session 后变为 Pending。
2. Session 使用 Unit of Work（工作单元）模式，负责跟踪对象变化，统一生成 SQL。
3. flush() 才是真正发送 INSERT/UPDATE/DELETE 到数据库，但事务仍未提交。
4. commit() = flush() + COMMIT，使事务永久生效。
5. Session 通过 Identity Map 保证同一个主键在一个 Session 中只有一个 Python 对象实例。
6. 修改对象属性会自动变成 UPDATE，session.delete() 会自动变成 DELETE，开发者通常无需手写这些 SQL。
7. rollback() 会同时回滚事务并让对象恢复与数据库一致；close() 会释放连接并让对象进入 Detached 状态。
