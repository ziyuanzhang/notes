# 数据库的本质: 本质其实就是一款基于网络通信的应用程序

- 也就意味着数据库软件其实有很多很多
  1. 关系型数据库: MySQL、oracle、db2、access、sql server
  2. 非关系型数据库: redis、mongodb、memcache

## 概念

- 库：文件夹
- 表：文件
- 记录：文件内一行行的数据
- 表头：
- 字段：
- 索引：

## 实战演练（敲你的第一段代码）

⚠️ 铁律：MySQL 的每一条命令，最后都必须以英文分号 ; 结尾！

1. 创建你的第一个“文件夹”（数据库，可以创建多个数据库）

   在 mysql> 后面输入：

   ```SQL
   CREATE DATABASE school;
   ```

   按下回车，意思是：创建一个叫 school 的数据库
   - 查看一下是不是创建成功了：

   ```SQL
   SHOW DATABASES;
   ```

   你会看到一列数据库的名字，里面有你的 school

2. 用这个“文件夹”（用这个 库）

   ```SQL
   USE school;
   ```

   提示 Database changed，说明你现在进入 school 这个文件夹了

3. 创建一张“表”（数据表）

   我们来建一个叫 student（学生）的表，包含三个列：学号(id)、姓名(name)、年龄(age)。

   ```SQL
   CREATE TABLE student (
      id INT,
      name VARCHAR(20),
      age INT
   );
   ```

   解释：INT 代表整数，VARCHAR(20) 代表最长20个字符的文字
   - 查看表是否建好了：

   ```SQL
   SHOW TABLES;
   ```

4. 往表里录入数据（增）

   我们把“学号1，张三，18岁”录进去：

   ```SQL
   INSERT INTO student (id, name, age) VALUES (1, '张三', 18);
   ```

   再录入一个李四：

   ```SQL
   INSERT INTO student (id, name, age) VALUES (2, '李四', 19);
   ```

5. 查看表里的数据（查）

   把学生表里的所有数据拿出来看看（`*` 代表所有列）：

   ```SQL
   SELECT * FROM student;
   ```

   此时你会看到一个漂亮的表格，里面有张三和李四。
   - 如果我只想找18岁的人呢？

   ```SQL
   SELECT * FROM student WHERE age = 18;
   ```

6. 修改数据（改）

   张三过生日了，变成 19 岁了：

   ```SQL
   UPDATE student SET age = 19 WHERE name = '张三';
   ```

   ⚠️警告：千万别漏掉 WHERE 条件，否则全班同学都会变成19岁！

7. 删除数据（删）

   李四退学了，要把他的数据删掉：

   ```SQL
   DELETE FROM student WHERE name = '李四';
   ```

   ⚠️警告：同样不能漏掉 WHERE，否则表里的数据就全清空了！

## 进阶神器（告别黑框框）

- 推荐工具（选一个下载安装即可）：
  1. DBeaver（强烈推荐，免费开源，支持中文）。
  2. Navicat（国内最出名，界面好看，但正版收费）。
  3. DataGrip（JetBrains出品，功能强大，适合专业开发者）。

- 如何使用图形化工具？

  打开这些软件，点击“新建连接” -> 选择 MySQL -> 输入 localhost (代表你自己的电脑) -> 输入账号 root -> 输入你设置的密码。
  连接成功后，你就可以像用 Excel 一样，用鼠标建表、修改数据了！
