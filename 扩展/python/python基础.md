# python 基础

第三方库和工具，如 NumPy、Pandas、TensorFlow 和 PyTorch 等

- 类型工具：
  1. dataclass:主要用于简化类的创建;
  2. typing: 类型检查;
     - TypedDict
     - NamedTuple
  3. pydantic V2: (推荐用于 Python 3.11+) 处理复杂的数据验证;

| 排名       | 工具                        |   镜像体积     |   冷启动时间   |   构建时间   |
| ---------- | --------------------------- | -------------- | -------------- | ------------ |
| NO.1       | python -m venv + pip-tools  |   90∼150MB     |     1.8∼3.5s   |    <90s      |
| NO.2       | uv（Rust 版）               | 100∼180MB      |    1.2∼2.8s    |  <45s        |
| NO.3       | poetry                      |  450∼800MB     |    8∼15s       |     3∼7min   |
| NO.4       | pipenv                      |  600MB+        |     12s+       |      5min+   |
| 拉出去枪毙 | conda                       | 1.2∼3GB        |    25∼60s      |      8∼20min |

## 字符串

1. () 可以换行

   ```python
    name=("hello"+"world"
     +"!")
   ```

2. m.n 拼接符串：
   - m: 总宽度 -- 小数点占一位，小于总宽度不生效；
   - n: 小数位数（四舍五入）；

   ```python
     print("身高%7.2dcm" % 175.2252) # --> 身高 175.23cm
   ```

3. f_format 字符串格式化

   ```python
     name = "张三"
     height = 175.22
     money = 1000.123456
     print(f"{name},身高{height}cm,工资{money:10.2f}") #--> 张三,身高175.22cm,工资   1000.12
   ```

4. t_format 字符串格式化

## 输入 与 输出

```python
   print("hello world")
   name = input("请输入你的名字：") # input 阻塞程序运行，等待用户输入；返回字符串
   print(f"hello {name}；type {type(name)}")
```

## 数据类型

![python_数据类型](./img/python_数据类型.png)

1. None 是类型'NoneType’的字面量，用于表示: 空的、无意义的;
   - 函数中无返回值，返回 none。

### 循环

range(start, stop, step)
step：步长

### list 列表

列表的下标
[1，2，3，4，5]
正向下标：0 1 2 3 4；
反向下标：-5 -4 -3 -2 -1

1. 在 Python 中，如果将函数定义为 class(类)的成员，那么函数会称之为:方法

### tuple 元组

- 定义 1 个元素的元组
  t2 =('Hello',) 注意，必须带有逗号，否则不是元组类型;

  注意: 元组只有一个数据，这个数据后面要添加逗号；用来区分元组 与 运算等

  t = ((1,2),(3,4)) 元组嵌套元组
  t=(1,2,['a','b']) 元组嵌套列表,列表可以改变值；

### string 字符串

str = "hello world"
str2 = str.replace("l","L")
print(str) --> hello world # 字符串本身没改，
print(str2) --> heLLo worLd # 在原来的字符串的基础上，复制一份修改，返回新的；

str[0]="H" ❎：字符串不能改变值，会报错；

### 切片

序列：（有下标）列表、元组、字符串；

1. 列表切片：list[start:stop:step]
2. 元组切片：tuple[start:stop:step]
3. 字符串切片：str[start:stop:step]

### set 集合 -- 存储 "键"

不重复的元素，无序，无索引，无下标，无重复元素；

{1,2,3,"哈哈"，true}

- 空集合：my_set = set() 只能这么写，不能用 {}；

  原因：与字典共用"{}"符号，被字典占了；

### dict 字典 -- 存 “键值对”

- 键（key）：唯一、无序、无索引、无重复；
  1. 不可是数据容器（字符串除外）；一般为字符串、整数；

- 值 (value)：任意类型；

- 空字典：
  1. my_dict={}
  2. my_dict=dict()

### 通用

- len(容器)、max(容器)、min(容器)
- sorted(容器，reverse=True)：排序
- 相互转换：list(容器)、tuple(容器)、str(容器)、set(容器)

### 比较

- 字符串：转 ASCII 码比较；
- 汉字：转 UTF-8 或 GBK 码比较；

## 函数

1. 多返回值:

   ```python
     def get_info(name, age):
       return name, age

     name, age = get_info("张三", 18) # --> 自动拆包
     person = get_info("张三", 18)  # -->返回元组
   ```

2. 传参：

   `def user_info(name, age, gender):`
   - 按顺序：user_info("小明",20,"男")
   - 关键字参数：user_info("小明",age=20,gender="男") ; # 顺序传参写前面，剩余的 关键字参数 可乱序；
   - 缺省参数（默认参数）：放最后；
   - 不定长参数：`*args`(元组接收)、`**kwargs`(字典接收)
     放 缺省参数前面；

     ```python
       def user_info(name, age, *args , grade="二年级"):     # 一般不这么写
           print(name, age, args, grade)

      user_info("小明", 20, "男", "娃娃","玩具", grade="三年级") # ✅ （一般不这么写）
      user_info("小明", 20, "男", "娃娃","玩具","三年级") # ❎
      # ==========================================================================
      def func(name, age, *args, **kwargs):
          print(name, age)

          for arg in args:
               print(arg)

          for key in kwargs:
              print(key, kwargs[key])

      func("小明", 20, "男", "娃娃","玩具", grade="三年级",address="北京")
     ```

3. 定义
   - def 关键字
   - lambda 匿名函数

## 文件 -- 打开 --> 读/写 --> 关闭

1. open(name,mode,encoding)
   - name：文件名；
   - mode：打开模式(只读-r、写入-w、追加-a 等)；
   - encoding：编码格式；

2. 用 with 语句打开文件，会自动关闭文件：

   ```python
      with open(name,node) as f:
         f.readlines()
   ```

3. 写 模式

   mode="w"时：文件不存在则自动新建；存在则清空，写心的；

   ```python
      f= open(name,mode,encoding)
      f.write("hello world")
      f.flush() # 刷新缓冲区: 写在缓存区，刷新后，才会写入文件；
      f.close() # 原因：CPU执行快，硬盘是低速设备，为了避免低速设备拉慢程序执行，将数据写入（内存的）缓存区，等缓存区满了，或者缓存区数据写入完毕，才会将数据写入硬盘；
               # close之前会自动 flush()
   ```

4. 二进制 处理 非文本文件
   - mode="rb" 读取二进制文件；
   - mode="wb" 写入二进制文件；

## 异常

```python
try:
   1+1
except Exception as e:
   print("有问题：",e)
else:
   print("没有异常")
finally:
   print("不管有没有异常，都会执行")

```

## 模块：就是一个一个的 python 文件

1. 导入

   模块在使用前需要先导入 导入的语法如下，

   `[from 模块名] import [模块 | 类|变量 | 函数 |*][as 别名]`常用的组合形式如:
   - import 模块名
   - from 模块名 import 类、变量、方法等
   - from 模块名 import \*
   - import 模块名 as 别名
   - from 模块名 import 功能名 as 别名

2. `__name__`: 内置变量
   - 如果本文件被直接执行，则内置变量`__name__`会被赋值为:`"__main__"`;
   - 如果本文件被 import 或 from 导入，则内置变量`__name__`会被赋值为:`文件名称`;

   ```python
       if __name__ == "__main__":
           print("程序被直接执行")
   ```

3. `__all__`： 内置变量

   `__all__` 变量可以 控制`import * `的时候哪些功能可以被导入

   ```python
       __all__ = ["add","sub"]
   ```

## package(包)：一个包是一个文件夹，里面可以有多个模块，一个模块是一个 python 文件

包含一个`__init__.py`文件，`__init__.py`文件可以不写内容，也可以写内容，内容可以执行一些初始化操作；

1. 导入
   - import 包名.模块名: 包名.模块名.目标
   - from 包名 import \*: 模块名.目标

     **注**：必须在`__init__.py`文件中添加`__all__=[xx,yy,...]`，控制允许导入的模块列表；

   - from 包名 import 模块名: 模块名.目标

2. 安装第三方包：pip install 包名(uv pip install 包名)

   在 Python 程序的生态中，有许多非常多的第三方包(非 Pvthon 官方)，可以极大的帮助我们提高开发效率，如:
   - 科学计算中常用的: numpy 包
   - 数据分析中常用的: pandas 包
   - 大数据计算中常用的: pyspark、apache-flink 包
   - 图形可视化常用的: matplotlib、pyecharts
   - 人工智能常用的: tensorflow
   - 等

## 本地调试环境：uv cloud
