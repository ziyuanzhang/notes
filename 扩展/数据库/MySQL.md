# 数据库的本质: 本质其实就是一款基于网络通信的应用程序

- 也就意味着数据库软件其实有很多很多
  1. 关系型数据库: MySQL、oracle、db2、access、sql server
  2. 非关系型数据库: redis、mongodb、memcache

## 数据库最核心概念（一定先搞懂）

1. 数据库（database）：相当于：一个项目的数据集合【❗可以创建多个数据库】；
2. 表（table）：相当于 Excel 的一个 sheet；
3. 行（row）：一条数据（例：1 张三 18）；
4. 列（column）：字段（例：name、age、email）；
5. 主键（primary key）：唯一标识用户，类似身份证号（比如：id）；

```bash
   MySQL Server
       ↓
   Database（数据库）
       ↓
   Table（表）
       ↓
   Row（行）
```

## 实战演练（敲你的第一段代码）

⚠️ 铁律：MySQL 的每一条命令，最后都必须以英文分号 ; 结尾！

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

   提示 Database changed，说明你现在进入 school 这个文件夹了

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

## 数据类型

| 类型     | 用途   |
| -------- | ------ |
| int      | 整数   |
| bigint   | 大整数 |
| varchar  | 字符串 |
| text     | 长文本 |
| datetime | 时间   |
| decimal  | 金额   |

## 表关系（超级重要）-- 这是数据库核心

比如：

- 用户表: users
- 订单表: orders

订单里：user_id 关联用户。这叫：关系型数据库, MySQL 最核心思想。

## 索引（重点） -- 决定：查询速度

比如：`select * from users where name='张三'`;

- 没索引：全表扫描
- 有索引：类似字典目录，速度快很多。

## SQL 多表查询 -- 真正开发天天用

比如：

```bash
select
    users.name,
    orders.price
from users
join orders
on users.id = orders.user_id;
```

## 进阶神器（告别黑框框）

- 推荐工具（选一个下载安装即可）：
  1. DBeaver（强烈推荐，免费开源，支持中文）。
  2. Navicat（国内最出名，界面好看，但正版收费）。
  3. DataGrip（JetBrains出品，功能强大，适合专业开发者）。

- 如何使用图形化工具？

  打开这些软件，点击“新建连接” -> 选择 MySQL -> 输入 localhost (代表你自己的电脑) -> 输入账号 root -> 输入你设置的密码。
  连接成功后，你就可以像用 Excel 一样，用鼠标建表、修改数据了！

# ------------------

MySQL Server 是一个后台服务

你执行：mysql -u root -p

其实是：客户端 去连接 数据库服务端

本质类似：浏览器 请求 网站服务器

MySQL Server是：一个后台运行的数据服务
mysql 命令：是：连接数据库服务的客户端工具

所以：mysql -u root -p

本质：客户端 连接 数据库服务端，和：浏览器访问网站，本质很像。

# -----------

以后真实开发中怎么连接 MySQL

比如 Python：

import pymysql

连接：

conn = pymysql.connect(
host='127.0.0.1',
port=3306,
user='root',
password='123456',
database='test_db'
)

# -----

1. 安装前先更新软件源: `sudo apt update`
2. 安装 MySQL Server: `sudo apt install mysql-server`
3. 安装完成后，先查看服务状态（重要）: `systemctl status mysql`
   如果看到：`active (running)`, 说明：MySQL 已启动成功

# --------

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

# 登录 ---------

方式1（Ubuntu 常见）：

直接：sudo mysql
进入：mysql>

这是：Linux socket 登录，root 用户免密码。

方式2（传统密码登录）：mysql -u root -p ，然后输入密码。

退出 MySQL： exit;

# -------------

配置文件，通常：/etc/mysql/
数据文件，通常：/var/lib/mysql/
日志，通常：/var/log/mysql/

# -------------

中文乱码：必须用： utf8mb4
