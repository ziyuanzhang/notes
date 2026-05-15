# ANSI SQL（标准SQL）中“通用”的核心内容

这些基本属于：几乎所有关系型数据库都支持

包括：

- MySQL
- PostgreSQL
- Oracle
- SQL Server
- SQLite
- DB2

等。

## 一、DDL（数据定义语言）-- 用于：定义数据库结构

| SQL标准语法       | 作用       | 通用性                  |
| ----------------- | ---------- | ----------------------- |
| `CREATE DATABASE` | 创建数据库 | ✅ 基本通用             |
| `CREATE TABLE`    | 创建表     | ✅                      |
| `ALTER TABLE`     | 修改表结构 | ✅                      |
| `DROP TABLE`      | 删除表     | ✅                      |
| `DROP DATABASE`   | 删除数据库 | ⚠️ 基本通用（部分差异） |
| `TRUNCATE TABLE`  | 清空表     | ✅ 基本通用             |

## DML（数据操作语言）-- 用于：操作数据

| SQL标准语法 | 作用     | 通用性          |
| ----------- | -------- | --------------- |
| `INSERT`    | 插入数据 | ✅              |
| `UPDATE`    | 修改数据 | ✅              |
| `DELETE`    | 删除数据 | ✅              |
| `SELECT`    | 查询数据 | ✅ 核心中的核心 |

## 三、WHERE 条件查询（核心）

| SQL标准语法 | 作用     | 通用性 |
| ----------- | -------- | ------ |
| `WHERE`     | 条件筛选 | ✅     |
| `AND`       | 且       | ✅     |
| `OR`        | 或       | ✅     |
| `NOT`       | 非       | ✅     |
| `IN`        | 在集合中 | ✅     |
| `BETWEEN`   | 范围查询 | ✅     |
| `LIKE`      | 模糊匹配 | ✅     |
| `IS NULL`   | 判断空值 | ✅     |

## 四、排序 / 分组 / 聚合（核心）

| SQL标准语法 | 作用       | 通用性 |
| ----------- | ---------- | ------ |
| `ORDER BY`  | 排序       | ✅     |
| `GROUP BY`  | 分组       | ✅     |
| `HAVING`    | 分组后过滤 | ✅     |
| `DISTINCT`  | 去重       | ✅     |

## 五、聚合函数（通用）

| 聚合函数  | 作用     | 通用性 |
| --------- | -------- | ------ |
| `COUNT()` | 统计数量 | ✅     |
| `SUM()`   | 求和     | ✅     |
| `AVG()`   | 平均值   | ✅     |
| `MAX()`   | 最大值   | ✅     |
| `MIN()`   | 最小值   | ✅     |

## 六、JOIN（关系型数据库灵魂） -- 这是 SQL 最核心能力之一

| JOIN类型     | 作用     | 通用性              |
| ------------ | -------- | ------------------- |
| `INNER JOIN` | 内连接   | ✅                  |
| `LEFT JOIN`  | 左连接   | ✅                  |
| `RIGHT JOIN` | 右连接   | ✅（SQLite较特殊）  |
| `FULL JOIN`  | 全连接   | ⚠️ 部分数据库不完整 |
| `ON`         | 关联条件 | ✅                  |

## 七、字段-约束（Constraint）-- 这些属于 ANSI SQL 核心

| 约束                          | SQL标准通用性    | 作用                   | 常见写法                                          | 常见用途           | 特点 / 注意事项                                                     |
| ----------------------------- | ---------------- | ---------------------- | ------------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `PRIMARY KEY`                 | ✅ 标准SQL       | 主键，唯一标识一条数据 | `id BIGINT PRIMARY KEY`                           | 用户ID、订单ID     | 自动包含：`UNIQUE + NOT NULL`；一个表只能有一个主键；自动创建索引。 |
| `NOT NULL`                    | ✅ 标准SQL       | 非空，字段不能为空     | `name VARCHAR(50) NOT NULL`                       | 用户名、密码       | 真实开发大量使用，减少 `NULL` 带来的逻辑复杂度。                    |
| `UNIQUE`                      | ✅ 标准SQL       | 唯一，字段值不能重复   | `email VARCHAR(100) UNIQUE`                       | 邮箱、手机号       | 自动创建唯一索引；一个表可以有多个 `UNIQUE`。                       |
| `DEFAULT`                     | ✅ 标准SQL       | 设置默认值             | `status INT DEFAULT 1`                            | 状态字段、时间字段 | 插入数据时未传值，则自动使用默认值。                                |
| `FOREIGN KEY`                 | ✅ 标准SQL       | 外键，建立表关系       | `FOREIGN KEY(user_id) REFERENCES users(id)`       | 用户-订单关系      | 保证引用数据存在；大型互联网项目很多使用“逻辑外键”代替。            |
| `CHECK`                       | ✅ 标准SQL       | 限制字段满足条件       | `CHECK(age >= 0)`                                 | 年龄、分数校验     | MySQL 8+ 才较完整支持；老版本基本无效。                             |
| `AUTO_INCREMENT`              | ❌ MySQL方言     | 自动生成递增ID         | `id BIGINT AUTO_INCREMENT`                        | 主键ID             | MySQL特有；PostgreSQL 使用 `SERIAL/IDENTITY`。                      |
| `ON UPDATE CURRENT_TIMESTAMP` | ❌ MySQL方言     | 更新时自动刷新时间     | `updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP` | 更新时间字段       | MySQL常用特性；很多数据库需用触发器实现。                           |
| `UNSIGNED`                    | ❌ MySQL方言     | 无符号整数（不能为负） | `age INT UNSIGNED`                                | 年龄、库存         | PostgreSQL 不支持。                                                 |
| `INDEX`                       | ⚠️ 非严格约束    | 加速查询               | `INDEX idx_name(name)`                            | 查询优化           | 严格说不是约束，而是索引机制。                                      |
| `AUTO_INCREMENT PRIMARY KEY`  | ❌ MySQL常见组合 | 自增主键               | `id BIGINT PRIMARY KEY AUTO_INCREMENT`            | 主键ID             | MySQL 最经典主键写法。                                              |
| `UNIQUE NOT NULL`             | ✅ 通用组合      | 唯一且不能为空         | `email VARCHAR(100) UNIQUE NOT NULL`              | 邮箱、账号         | 非常常见的组合约束。                                                |
| `DEFAULT CURRENT_TIMESTAMP`   | ⚠️ 基本通用      | 默认当前时间           | `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`   | 创建时间           | 各数据库写法略有差异。                                              |
| `PRIMARY KEY AUTO_INCREMENT`  | ❌ MySQL方言组合 | 主键+自增              | `id INT PRIMARY KEY AUTO_INCREMENT`               | 主键               | PostgreSQL / Oracle 写法不同。                                      |

## 八、事务（Transaction）-- 事务也是 SQL 标准重要部分

| SQL标准语法                   | 作用     | 通用性 |
| ----------------------------- | -------- | ------ |
| `BEGIN` / `START TRANSACTION` | 开启事务 | ✅     |
| `COMMIT`                      | 提交事务 | ✅     |
| `ROLLBACK`                    | 回滚事务 | ✅     |

## 九、子查询（Subquery）

| SQL标准语法   | 作用       | 通用性 |
| ------------- | ---------- | ------ |
| 子查询        | SQL嵌套SQL | ✅     |
| `EXISTS`      | 存在判断   | ✅     |
| `ANY` / `ALL` | 条件比较   | ✅     |

## 十、视图（View）

| SQL标准语法   | 作用     | 通用性 |
| ------------- | -------- | ------ |
| `CREATE VIEW` | 创建视图 | ✅     |
| `DROP VIEW`   | 删除视图 | ✅     |

## 十一、索引（Index）

索引属于：“基本通用”, 但：实现差异非常大

| SQL语法        | 作用     | 通用性          |
| -------------- | -------- | --------------- |
| `CREATE INDEX` | 创建索引 | ✅              |
| `DROP INDEX`   | 删除索引 | ⚠️ 语法差异较大 |

## 十二、字段-数据类型

- 数值类型
  1. int: 整数；
  2. bigint: 大整数；
  3. tinyint: ⚠️ 占用1字节（常用于表示状态（如0/1）、性别、是否删除等只有几个选项的字段）；
  4. smallint: 占用2字节（数量不大的计数）；
  5. float、double: ❌ 有精度问题；
  6. decimal:金融专用 --不会产生精度丢失；

  | 类型        | 字节 | 范围（有符号） | 通用性    | 常见用途       |
  | ----------- | ---: | -------------- | --------- | -------------- |
  | tinyint     |    1 | -128 ~ 127     | ⚠️ 半通用 | 状态位、布尔   |
  | smallint    |    2 | -32768 ~ 32767 | ✅        | 小计数         |
  | int/integer |    4 | ±21亿          | ✅        | 主流整数       |
  | bigint      |    8 | 极大整数       | ✅        | 用户ID、订单ID |

  | 类型            | 是否精确 | 是否推荐存钱 |
  | --------------- | -------- | ------------ |
  | float           | ❌       | ❌           |
  | double          | ❌       | ❌           |
  | decimal/numeric | ✅       | ✅           |

- 字符串类型
  1. varchar: 字符串
  2. text: 长文本
  3. char: 定长字符串
  4. blob: 二进制大对象

  | 类型    | 通用性 | 特点   | 适合       |
  | ------- | ------ | ------ | ---------- |
  | char    | ✅     | 定长   | 固定长度   |
  | varchar | ✅     | 变长   | 普通字符串 |
  | text    | ✅     | 长文本 | 文章内容   |
  | blob    | ✅     | 二进制 | 文件       |

- 日期和时间类型
  1. datetime: ⚠️ 时间
  2. TIMESTAMP: 时间戳类型（存储的是UTC时间，读取时会根据客户端的时区进行转换，非常适合记录跨时区的操作时间）
  3. DATE：只存储日期（YYYY-MM-DD）
  4. TIME: 只存储时间（hh:mm:ss）

  | 类型      | 是否通用          | 含义      |
  | --------- | ----------------- | --------- |
  | date      | ✅                | 日期      |
  | time      | ✅                | 时间      |
  | datetime  | ⚠️ MySQL 风格明显 | 日期+时间 |
  | timestamp | ✅                | 时间戳    |

- 其他特殊类型
  1. enum: 枚举类型
  2. SET (集合): 多选
  3. JSON: 现代数据库（如MySQL 5.7+）原生支持 JSON 格式，可以高效地存储和查询结构化的非关系型数据。
  4. BOOL / BOOLEAN: 布尔类型，本质上是 TINYINT(1) 的别名，用0表示假，非0表示真。

  | 大类     | 通用性                | 说明                |
  | -------- | --------------------- | ------------------- |
  | 布尔     | ⚠️ 基本都有           | 但实现方式不同      |
  | JSON     | ✅ 现代数据库普遍支持 | PostgreSQL 最强     |
  | 枚举     | ⚠️ 部分数据库支持     | MySQL/PostgreSQL 有 |
  | 集合 SET | ❌ 基本 MySQL 独有    | 很少见              |

## ## 十三、真实建表（现代规范）

```SQL
CREATE TABLE student (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    age INT,
    email VARCHAR(100) UNIQUE,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

1. 表名定义: CREATE TABLE student: 指示数据库创建一个名为 student 的新表。
2. 字段定义: 这部分在括号 () 内，定义了表的每一列及其属性：
   - `id BIGINT PRIMARY KEY AUTO_INCREMENT`
     1. `id`：字段名。
     2. `BIGINT`：数据类型为大整数，能存储非常大的数字。
     3. `PRIMARY KEY`：设为主键，意味着该字段的值必须唯一且不能为空，是每条记录的唯一标识。❗一个表只能有一个主键。
     4. `AUTO_INCREMENT`：设置为自增。插入新数据时，如果未指定 `id` 值，数据库会自动生成一个比上一条记录大 1 的数字（通常从 1 开始）。

   - `name VARCHAR(50) NOT NULL`
     1. `name`：字段名。
     2. `VARCHAR(50)`：数据类型为字符型，最多存储 50 个字符。
     3. `NOT NULL`：设置为非空约束。插入数据时，这个字段必须有值，不能留空。

   - `age INT`：没有额外约束，因此该字段允许为 `NULL`。
     1. `age`：字段名。
     2. `INT`：数据类型为整数。
   - `email VARCHAR(100) UNIQUE`：
     1. `UNIQUE`：唯一约束。不允许重复邮箱。
     2. `UNIQUE` 与 `PRIMARY KEY` 不同：一个表只能有一个主键，但可有多个唯一键。

   - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
     1. `created_at`：字段名，通常用于记录数据的创建时间。
     2. `DATETIME`：数据类型为日期和时间。
     3. `DEFAULT`: 设置默认值。插入数据时如果没传值，则使用默认值。能减少应用层判断逻辑
     4. `DEFAULT CURRENT_TIMESTAMP`：设置默认值为当前时间。当插入一条新记录且未指定 `created_at` 的值时，数据库会自动填入当前系统时间。

   - `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
   - `deleted_at DATETIME NULL`:软删除时间,不是真删，而是记录删除时间。现代系统大量使用“软删除”。便于恢复数据和审计。

3. 表级选项: 这部分在括号 () 之外，用于定义整个表的属性：
   ENGINE=InnoDB: 指定表的存储引擎为 InnoDB。这是 MySQL 的默认引擎，也是目前最推荐的引擎，因为它支持事务处理、行级锁和外键，能保证数据的安全性和高并发性能。
   DEFAULT CHARSET=utf8mb4: 指定表的默认字符集为 utf8mb4。这是真正的 UTF-8 编码，能够兼容所有 Unicode 字符，包括 emoji 表情符号（如 😊）。如果只使用 utf8 (实际上是 utf8mb3)，则无法存储 emoji。

⚠️ MySQL 的 utf8 不是完整 UTF-8; 它最多：3字节, 不能存：emoji; 中文乱码：必须用： utf8mb4
