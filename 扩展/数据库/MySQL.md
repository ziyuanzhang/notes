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

## 修改密码、忘记密码

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

## 操作数据库 -- 演练

⚠️ 铁律：MySQL 的每一条命令，最后都必须以英文分号 ; 结尾

- 数据库
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

  4. 删除数据库(⚠️ 非常危险)

     ```SQL
     drop database test_db;
     ```

     提示 Database changed，说明你现在进入 school 这个数据库（文件夹）了

- 表
  1. 创建表（不写，引擎默认是InnoDB）

     我们来建一个叫 student（学生）的表，包含三个列：学号(id)、姓名(name)、年龄(age)。

     ```SQL
     CREATE TABLE student (
        id INT,
        name VARCHAR(20),
        age INT
     ) engine=InnoDB;
     ```

     解释：INT 代表整数，VARCHAR(20) 代表最长20个字符的文字

  2. 查看有哪些表

     ```SQL
     SHOW TABLES;
     ```

  3. 查看表结构

     ```SQL
     DESC student;
     ```

  4. 删除表

     ```SQL
       drop table users;
     ```

  5. 修改表
     1. 修改表名：alter tab1e 表名 rename 新表名;
     2. 增加字段：alter table 表名 add 字段名 字段类型(宽度)约束条件;
        - alter table 表名 add 字段名 字段类型(宽度)约東条件 first;
        - alter table 表名 add 字段名 字段类型(宽度)约束条件 after 字段名;
     3. 删除字段：alter table 表名 drop 字段名;
     4. 修改字段
        - alter table 表名 modify 字段名 字段类型(宽度)约東条件;
        - alter table 表名 change 旧字段名 新字段名 字段类型(宽度)约東条件;
     5. 复制表：不能复制主键外键索引
        - create table表名select\*from 表;

- 数据
  1. 插入数据（增）

     我们把“学号1，张三，18岁”录进去：

     ```SQL
     INSERT INTO student (id, name, age) VALUES (1, '张三', 18),(2,'李四',20);
     ```

     再录入一个李四：

     ```SQL
     INSERT INTO student (id, name, age) VALUES (2, '李四', 19);
     ```

  2. 查询数据（查）

     把学生表里的所有数据拿出来看看（`*` 代表所有列）：

     ```SQL
     SELECT * FROM student;
     ```

     此时你会看到一个漂亮的表格，里面有张三和李四。
     - 如果我只想找18岁的人呢？

     ```SQL
     SELECT * FROM student WHERE age = 18;
     SELECT * FROM student WHERE age > 18;
     ```

  3. 修改数据（改）

     张三过生日了，变成 19 岁了：

     ```SQL
     UPDATE student SET age = 19 WHERE name = '张三';
     ```

     ⚠️警告：千万别漏掉 WHERE 条件，否则全班同学都会变成19岁！

  4. 删除数据（删）

     李四退学了，要把他的数据删掉：

     ```SQL
     DELETE FROM student WHERE name = '李四';
     ```

     ⚠️警告：同样不能漏掉 WHERE，否则表里的数据就全清空了！

  5. 必须重点理解：where❗

## 连接demo (真实开发用：连接池)

比如 Python：

```python
  import pymysql
  conn = pymysql.connect(
    host='127.0.0.1',
    port=3306,
    user='root',
    password='123456',
    database='test_db' # 指定库
    charset='utf8mb4' # 指定编码
    autocommit=True # 自动提交,不需要conn.commit()
  )
  # currsor = conn.cursor() # #括号内不加参数的话 那么查询出来的数据是元组的形式 数据不够明确 容易混乱
  cursor = conn.cursor(cursor=pymysql.cursors.Dictcursor) # 典形式返回数据 数据有具体的描述信息 更加的合理方便
  sql='select *from user'
  affect_rows = cursor.execute(sq1) # 返回值是当前sq]语句执行的受影响的行数
  # -------------------------------
  cursor.fetchone() # 只能结果的一条
  cursor.fetcha11() # 拿所有
  cursor.fetchmany(n)#指定获取几条
  # 上述三个方法在读取数据的时候有一个类似于文件指针的特点

  cursor.scro11(1,'relative') # 相对于光标所在的当前位置往后移动
  cursor.scro11(1,'absolute') # 相对于数据开头往后移动

  # -----------------------------------
  # sql注入
  sql="select *from user where username='%s' andpassword='%s'"%(username ,password) # 不要自己拼接
  sq1 ="select * from user where username=%s and password=%s"
  execute(sq1,(username,password)) # 只能识别%s
  # -- 增 --------------------------------
  # sql =insert into user(name,password) values(%s, %s)
  # rows = cursor.execute(sql,('jackson',123))
  # rows2 = cursor.execute(sql,[('jackson',123),('xxx',254),('yyy',567)]) # 插入多条数据
  # print (rows)
  # conn.commit()#确认
  # -- 改 --------------------------------
  # sql =update user setname="jasonNBwhere id=1rows = cursor.execute(sql)
  # print (rows)
  # conn.commit()#确认
  # -- 删 --------------------------------
  # sql ='delete from user where id=1
  # rows = cursor.execute(sql)
  # print(rows)
  # conn.commit()#确认
```

## 配置文件 -- 常见配置 及 修改

| 配置                          | 作用         |
| ----------------------------- | ------------ |
| port=3306                     | 端口         |
| bind-address                  | 监听IP       |
| max_connections               | 最大连接数   |
| character-set-server=utf8mb4  | 字符集       |
| default_authentication_plugin | 默认认证插件 |
| slow_query_log=1              | 慢SQL日志    |
| log-error                     | 错误日志     |

- 配置文件修改
  1. 编辑配置文件：sudo vim /etc/my.cnf 或者 sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
  2. 在 [mysqld] 下添加：

     ```bash
        [mysqld]
        skip-grant-tables
     ```

  3. 重启数据库：sudo service mysql restart

- MySQL 启动本质
  1. mysqld 进程启动
  2. → 读取配置文件
  3. → 初始化存储引擎
  4. → 初始化网络
  5. → 初始化权限系统
  6. → 开始监听3306
