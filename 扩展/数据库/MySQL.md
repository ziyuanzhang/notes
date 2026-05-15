# MySQL

MySQL Server 一个后台运行的数据服务；

## 真正运行流程

mysql 命令是：连接数据库服务的客户端工具
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

## 安装

1. 安装前先更新软件源: `sudo apt update`
2. 安装 MySQL Server: `sudo apt install mysql-server`
3. 安装完成后，先查看服务状态（重要）: `systemctl status mysql`
   如果看到：`active (running)`, 说明：MySQL 已启动成功

- 配置文件，通常：/etc/mysql/
- 数据文件，通常：/var/lib/mysql/
- 日志，通常：/var/log/mysql/

## 命令

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

## 登录

1. 方式1（Ubuntu 常见）：
   - 直接：sudo mysql，
   - 进入：mysql>

   这是：Linux socket 登录，root 用户免密码。

2. 方式2（传统密码登录）：mysql -u root -p ，然后输入密码。

## 退出 -- MySQL： exit

## 操作数据库-演练 ⚠️ 铁律：MySQL 的每一条命令，最后都必须以英文分号 ; 结尾

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

## 连接demo (真实开发用：连接池)

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
