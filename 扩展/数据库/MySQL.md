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

## 修改密码

### 已知道旧密码

1. 登录 MySQL `mysql -u root -p`输入旧密码。
2. 修改密码（MySQL 5.7+ / 8.x 推荐）: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewPassword123!';`
3. 刷新权限（通常可省略）: `FLUSH PRIVILEGES;`
4. 退出: `exit;`

- 修改普通用户密码
  1. `ALTER USER 'test'@'localhost'  IDENTIFIED BY '123456';`

- 查看有哪些用户：`SELECT user, host FROM mysql.user;`，结果类似：

  | user | host      |
  | ---- | --------- |
  | root | localhost |
  | test | %         |

- host 是什么意思？
  1. “root@localhost”：只能本机登录
  2. “root@%”：允许远程登录
  3. 所以：`'root'@'localhost'`和`'root'@'%'`是不同用户，修改密码时必须对应。

### 忘记 root 密码

核心原理:正常：MySQL 登录时会检查 mysql.user 权限表; 忘记密码时：让 MySQL “跳过权限表”,即可直接登录。

- Linux 重置 root 密码
  1. 停止 MySQL:
     - Ubuntu / Debian：`sudo systemctl stop mysql`
     - CentOS：`sudo systemctl stop mysqld`

  2. 跳过权限启动: `sudo mysqld_safe --skip-grant-tables &`

     | 参数                | 作用         |
     | ------------------- | ------------ |
     | mysqld_safe         | 安全启动     |
     | --skip-grant-tables | 跳过权限验证 |

  3. 无密码登录: `mysql -u root`
  4. 修改密码: MySQL 8：`ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewPassword123!';`
     - 如果报错：ALTER USER failed, 先：`FLUSH PRIVILEGES;`再执行。

  5. 重启 MySQL: 先关闭刚才临时进程。再正常启动：`sudo systemctl restart mysql`

### SQL 的换行本质

- SQL 语句：“换行、空格、缩进”大多数情况下都只是：“空白字符”，数据库解析器（Parser）会自动忽略。
- 真正结束 SQL 的是：“;” 分号。

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
