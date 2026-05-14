# 数据库的本质: 本质其实就是一款基于网络通信的应用程序

数据库 = 持久化存储 + 查询系统 + 网络服务

本质上是：一个长期运行的服务端程序（daemon/service），属于用户态进程；

- 也就意味着数据库软件其实有很多很多
  1. 关系型数据库: MySQL、oracle、db2、access、sql server
  2. 非关系型数据库: redis、mongodb、memcache

## 一、数据库和网站：本质都是：客户端 <-> 服务端

- 网站：浏览器（客户端）- HTTP -> Nginx/Django/Flask（服务端）

- MySQL：mysql客户端 - MySQL协议/TCP -> MySQL Server（mysqld）

- 区别

  | 系统    | 协议      |
  | ------- | --------- |
  | 网站    | HTTP      |
  | MySQL   | MySQL协议 |
  | Redis   | RESP协议  |
  | MongoDB | Mongo协议 |

## 二、数据库最核心概念（一定先搞懂）

1. 数据库（database）：相当于：一个项目的数据集合【❗可以创建多个数据库】；
2. 表（table）：相当于 Excel 的一个 sheet；
3. 行（row）：一条数据（例：1 张三 18）；
4. 列（column）：字段（例：name、age、email）；
5. 主键（primary key）：唯一且非空，类似身份证号（比如：id）；

```bash
   Linux操作系统
       ↓
   MySQL Server（mysqld进程）
       ↓
   多个 Database（数据库）
       ↓
   多个 Table（表）
       ↓
   Row（行）
       ↓
   Column（列）
```

## 三、SQL 只是“命令语言”

其实：SQL 是语言，MySQL 是数据库软件

类似：Python 是语言，CPython 是解释器

SQL 多表查询 -- 真正开发天天用

比如：

```bash
select
    users.name,
    orders.price
from users
join orders
on users.id = orders.user_id;
```

## 四、数据库最核心不是“存数据”，而是：高效、安全、并发地管理数据

- 核心能力：

  | 能力     | 作用         |
  | -------- | ------------ |
  | 持久化   | 断电不丢     |
  | 查询优化 | 快速查找     |
  | 并发控制 | 多人同时操作 |
  | 事务     | 保证数据一致 |
  | 崩溃恢复 | 宕机恢复     |
  | 索引     | 加速查询     |
  | 锁机制   | 防止数据错乱 |
  | 日志     | redo/binlog  |
  | 权限系统 | 用户隔离     |

## 五、索引（重点） -- 决定：查询速度

比如：`select * from users where name='张三'`;

- 没索引：全表扫描 `SELECT * FROM users WHERE name='张三'`;
- 有索引：类似字典目录, 数据库直接定位, 速度快很多;

MySQL InnoDB 默认：B+Tree, 不是：Hash

## 六、事务 ： 一组SQL作为整体执行（数据库灵魂）

比如：张三转账给李四：

```bash
张三 -100
李四 +100
```

必须：

```bash
同时成功
或者同时失败
```

不能：

```bash
张三钱没了
李四没收到
```

## 七、存储引擎

| 引擎   | 特点               |
| ------ | ------------------ |
| InnoDB | 默认，支持事务     |
| MyISAM | 老引擎，不支持事务 |
| Memory | 内存表             |

- 现代MySQL几乎默认：InnoDB

  因为：
  - 支持事务
  - 支持行锁
  - 支持崩溃恢复
  - 支持MVCC

## 八、关系型数据库真正核心：关系

比如：

- 用户表: users
- 订单表: orders

订单里：user_id 关联用户。这叫：关系型数据库, MySQL 最核心思想。

## 九、数据库字段数据类型

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

## 十、MySQL 真正运行流程

MySQL Server 一个后台运行的数据服务，mysql 命令：是：连接数据库服务的客户端工具；

用户执行：`mysql -u root -p`，其实是：客户端 去连接 数据库服务端，和：浏览器 访问 网站，本质很像。
（`mysql客户端进程 - TCP/socket -> mysqld服务端进程`）

- MySQL内部：数据库执行链路

  ```bash
    SQL
     ↓
    解析器（Parser）
     ↓
    优化器（Optimizer）
     ↓
    执行器（Executor）
     ↓
    存储引擎（InnoDB）
     ↓
    磁盘
  ```

### 安装

1. 安装前先更新软件源: `sudo apt update`
2. 安装 MySQL Server: `sudo apt install mysql-server`
3. 安装完成后，先查看服务状态（重要）: `systemctl status mysql`
   如果看到：`active (running)`, 说明：MySQL 已启动成功

- 配置文件，通常：/etc/mysql/
- 数据文件，通常：/var/lib/mysql/
- 日志，通常：/var/log/mysql/

### 命令

1. 启动 MySQL 服务：`sudo systemctl start mysql`
2. 停止 MySQL 服务：`sudo systemctl stop mysql`
3. 重启 MySQL 服务：`sudo systemctl restart mysql`
4. 配置 MySQL 服务开机启动：`sudo systemctl enable mysql`
5. 配置 MySQL 服务开机不启动：`sudo systemctl disable mysql`
6. 卸载 MySQL 服务：`sudo apt remove mysql-server`
7. 首次安全初始化（非常重要）, 执行：`sudo mysql_secure_installation`
   这是：MySQL 官方安全初始化脚本, 它会帮你：
   - 设置 root 密码
   - 删除匿名用户
   - 禁止远程 root
   - 删除测试库

### 登录

1. 方式1（Ubuntu 常见）：
   - 直接：sudo mysql，
   - 进入：mysql>

   这是：Linux socket 登录，root 用户免密码。

2. 方式2（传统密码登录）：mysql -u root -p ，然后输入密码。

### 退出 -- MySQL： exit

### 操作数据库-演练 ⚠️ 铁律：MySQL 的每一条命令，最后都必须以英文分号 ; 结尾

1. 创建数据库（数据库，可以创建多个数据库）

   在 mysql> 后面输入：

   ```SQL
   CREATE DATABASE school;
   ```

   按下回车，意思是：创建一个叫 school 的数据库

2. 查看数据库 (查看一下是不是创建成功了)

   ```SQL
   SHOW DATABASES;
   ```

   你会看到一列数据库的名字，里面有你的 school

3. 使用数据库

   ```SQL
   USE school;
   ```

   提示 Database changed，说明你现在进入 school 这个数据库（文件夹）了

4. 创建表

   我们来建一个叫 student（学生）的表，包含三个列：学号(id)、姓名(name)、年龄(age)。

   ```SQL
   CREATE TABLE student (
      id INT,
      name VARCHAR(20),
      age INT
   );
   ```

   解释：INT 代表整数，VARCHAR(20) 代表最长20个字符的文字

5. 查看有哪些表

   ```SQL
   SHOW TABLES;
   ```

6. 查看表结构

   ```SQL
   DESC student;
   ```

7. 插入数据（增）

   我们把“学号1，张三，18岁”录进去：

   ```SQL
   INSERT INTO student (id, name, age) VALUES (1, '张三', 18);
   ```

   再录入一个李四：

   ```SQL
   INSERT INTO student (id, name, age) VALUES (2, '李四', 19);
   ```

8. 查询数据（查）

   把学生表里的所有数据拿出来看看（`*` 代表所有列）：

   ```SQL
   SELECT * FROM student;
   ```

   此时你会看到一个漂亮的表格，里面有张三和李四。
   - 如果我只想找18岁的人呢？

   ```SQL
   SELECT * FROM student WHERE age = 18;
   ```

9. 修改数据（改）

   张三过生日了，变成 19 岁了：

   ```SQL
   UPDATE student SET age = 19 WHERE name = '张三';
   ```

   ⚠️警告：千万别漏掉 WHERE 条件，否则全班同学都会变成19岁！

10. 删除数据（删）

    李四退学了，要把他的数据删掉：

    ```SQL
    DELETE FROM student WHERE name = '李四';
    ```

    ⚠️警告：同样不能漏掉 WHERE，否则表里的数据就全清空了！

11. 必须重点理解：where❗
12. 删除表

    ```SQL
      drop table users;
    ```

13. 删除数据库(⚠️ 非常危险)

    ```SQL
    drop database test_db;
    ```

### 真实建表（现代规范）

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
     3. `PRIMARY KEY`：设为主键，意味着该字段的值必须唯一且不能为空，是每条记录的唯一标识。
     4. `AUTO_INCREMENT`：设置为自增。插入新数据时，如果未指定 `id` 值，数据库会自动生成一个比上一条记录大 1 的数字（通常从 1 开始）。

   - `name VARCHAR(50) NOT NULL`
     1. `name`：字段名。
     2. `VARCHAR(50)`：数据类型为字符型，最多存储 50 个字符。
     3. `NOT NULL`：设置为非空约束。插入数据时，这个字段必须有值，不能留空。

   - `age INT`没有额外约束，因此该字段允许为 `NULL`。
     1. `age`：字段名。
     2. `INT`：数据类型为整数。

   - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
     1. `created_at`：字段名，通常用于记录数据的创建时间。
     2. `DATETIME`：数据类型为日期和时间。
     3. `DEFAULT CURRENT_TIMESTAMP`：设置默认值为当前时间。当插入一条新记录且未指定 `created_at` 的值时，数据库会自动填入当前系统时间。

3. 表级选项: 这部分在括号 () 之外，用于定义整个表的属性：
   ENGINE=InnoDB: 指定表的存储引擎为 InnoDB。这是 MySQL 的默认引擎，也是目前最推荐的引擎，因为它支持事务处理、行级锁和外键，能保证数据的安全性和高并发性能。
   DEFAULT CHARSET=utf8mb4: 指定表的默认字符集为 utf8mb4。这是真正的 UTF-8 编码，能够兼容所有 Unicode 字符，包括 emoji 表情符号（如 😊）。如果只使用 utf8 (实际上是 utf8mb3)，则无法存储 emoji。

⚠️ MySQL 的 utf8 不是完整 UTF-8; 它最多：3字节, 不能存：emoji; 中文乱码：必须用： utf8mb4

### --- 连接demo --真实开发用：连接池------

比如 Python：

```python
  import pymysql
  conn = pymysql.connect(
    host='127.0.0.1',
    port=3306,
    user='root',
    password='123456',
    database='test_db'
  )
```

## 十一、ORM (Object Relational Mapping): 对象关系映射

真实开发很少手写SQL。更多是：ORM

例如：Python：user.name, 自动变：SELECT name FROM users;

常见 ORM

| 语言    | ORM                    |
| ------- | ---------------------- |
| Python  | SQLAlchemy、Django ORM |
| Java    | MyBatis、Hibernate     |
| Go      | GORM                   |
| Node.js | Prisma、TypeORM        |

## 真正开发中的完整架构

```bash
   浏览器
      ↓
   Nginx
      ↓
   Python/Java/Go 服务
      ↓
   Redis（缓存）
      ↓
   MySQL（持久化）
```

## 进阶神器（告别黑框框）

- 推荐工具（选一个下载安装即可）：
  1. DBeaver（强烈推荐，免费开源，支持中文）。
  2. Navicat（国内最出名，界面好看，但正版收费）。
  3. DataGrip（JetBrains出品，功能强大，适合专业开发者）。

- 如何使用图形化工具？

  打开这些软件，点击“新建连接” -> 选择 MySQL -> 输入 localhost (代表你自己的电脑) -> 输入账号 root -> 输入你设置的密码。
  连接成功后，你就可以像用 Excel 一样，用鼠标建表、修改数据了！
