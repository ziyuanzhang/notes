# Python 语法与运行机制知识体系（完整融合修订版）

> 整合来源：`python语法-1-基础.md`、`python语法-2-进阶.md`、`python语法-2.1-异步.md`、`python语法-3-高级.md`\
> 目标：把零散笔记整理成一份可持续维护的 Python
> 学习与查阅文档。按"运行机制 → 语言基础 → 程序组织 → 面向对象与对象协议
> → 迭代与函数增强 → 文件与异常 → 标准库 → 网络与并发 → I/O 模型"组织。
>
> 修订说明：以四份原始笔记为依据重新审查。重复内容合并，低频内容压缩为速查表；保留有学习价值的知识点与关键代码。补回原整合版遗漏的进程队列、管道、线程队列、任务完成确认、常用标准库实践和网络客户端内容，并修正原笔记中不严谨的表述。标注为"了解"的内容不要求初学阶段深入掌握。

------------------------------------------------------------------------

## 目录

1.  [Python 全局认知与运行流程](#1-python-全局认知与运行流程)
2.  [变量、对象与内存模型](#2-变量对象与内存模型)
3.  [数据类型与数据结构](#3-数据类型与数据结构)
4.  [运算符、表达式与流程控制](#4-运算符表达式与流程控制)
5.  [函数](#5-函数)
6.  [命名空间、作用域与闭包](#6-命名空间作用域与闭包)
7.  [模块、包与项目组织](#7-模块包与项目组织)
8.  [面向对象编程](#8-面向对象编程)
9.  [迭代器、生成器与推导式](#9-迭代器生成器与推导式)
10. [装饰器与属性管理](#10-装饰器与属性管理)
11. [赋值、浅拷贝与深拷贝](#11-赋值浅拷贝与深拷贝)
12. [文件与资源管理](#12-文件与资源管理)
13. [异常处理](#13-异常处理)
14. [常用标准库与第三方库](#14-常用标准库与第三方库)
15. [网络编程基础](#15-网络编程基础)
16. [并发编程：进程、线程、协程](#16-并发编程进程线程协程)
17. [asyncio 异步编程](#17-asyncio-异步编程)
18. [I/O 模型与高性能网络基础](#18-io-模型与高性能网络基础)
19. [核心概念对照表](#19-核心概念对照表)
20. [原笔记关键错误与修正清单](#20-原笔记关键错误与修正清单)
21. [建议学习顺序](#21-建议学习顺序)
22. [并发通信：Queue、Pipe 与任务协作](#22-并发通信queuepipe-与任务协作)
23. [常用标准库实用速查](#23-常用标准库实用速查)
24. [网络工具与 HTTP 客户端选择](#24-网络工具与-http-客户端选择)
25. [补充概念与内容取舍](#25-补充概念与内容取舍)

------------------------------------------------------------------------

# 1. Python 全局认知与运行流程

## 1.1 Python 是什么

Python 是一种高级、动态类型、强类型、通常通过解释器运行的编程语言。

-   **动态类型**：变量名本身不需要预先声明类型；运行时，名字绑定到具体对象。
-   **强类型**：不同类型之间不会随意进行不合理的隐式转换，例如 `"1" + 1`
    会报错。
-   **解释器实现**：常见实现是 CPython，但 Python 语言不等于
    CPython。还有 PyPy、Jython 等实现。
-   **编译与执行并存**：CPython 会先把源代码编译成字节码，再由 Python
    虚拟机执行；所以简单称为"纯解释执行"并不准确。

## 1.2 从启动解释器到执行 `.py` 文件

以 CPython 执行 `python main.py` 为例：

``` text
操作系统启动 Python 解释器进程
        ↓
初始化解释器运行环境、内建对象和模块系统
        ↓
读取 main.py 源文件字节
        ↓
识别源文件编码并解码为文本
        ↓
词法分析：识别关键字、标识符、字面量、运算符等
        ↓
语法分析：构建 AST（抽象语法树）
        ↓
编译：生成代码对象 / 字节码
        ↓
Python 虚拟机执行字节码
        ↓
运行期间调用对象、函数、模块及底层 C 实现
```

补充：

1.  `.py` 文件是源代码文件；`.pyc`
    是字节码缓存文件，不是必须手动生成或分发的程序文件。
2.  Python 3 默认源码编码是
    UTF-8。只有需要使用其他编码时，才通常需要在文件开头声明编码。
3.  词法分析、语法分析、编译等是解释器内部阶段；日常开发一般不需要手动执行。
4.  运行过程中，解释器还会处理异常、对象生命周期、模块导入、垃圾回收等工作。

## 1.3 变量、对象与垃圾回收的基本模型

Python 更准确的理解方式是：

> **对象存储数据；名字通过命名空间绑定到对象。**

``` python
x = 10
y = x
z = x

del x
del y
print(z)  # 10

z = 123
```

`x = 10` 并不是在变量 `x`
里面开辟一个固定类型的"盒子"，而是让当前作用域中的名字 `x`
绑定到整数对象 `10`。

-   `id(obj)`：返回对象身份标识。在 CPython
    中通常与内存地址相关，但语言层面不应把它直接等同于内存地址。
-   `type(obj)`：查看对象类型。
-   `obj`：对象本身。
-   `is`：比较两个引用是否指向同一个对象。
-   `==`：比较两个对象的值是否相等。

``` python
a = [1, 2]
b = a
c = [1, 2]

print(a is b)  # True
print(a == c)  # True
print(a is c)  # False
```

垃圾回收不是简单地"回收没有变量名的值"。CPython
主要使用**引用计数**管理对象，并配合**循环垃圾回收器**处理部分循环引用。对象只要仍被其他对象、容器、栈帧等引用，就可能继续存活。

## 1.4 常量

Python 没有强制常量的专用语法。通常用全大写变量名表达约定：

``` python
MAX_RETRIES = 3
DATABASE_URL = "sqlite:///app.db"
```

这是开发约定，不会阻止代码重新赋值。

------------------------------------------------------------------------

# 2. 变量、对象与内存模型

## 2.1 可变对象与不可变对象

  ---------------------------------------------------------------------------------------------------------------
  类型                    常见类型                                               特征
  ----------------------- ------------------------------------------------------ --------------------------------
  不可变对象              `int`、`float`、`bool`、`str`、`bytes`、通常意义上的   对象创建后，其内容不能原地修改
                          `tuple`                                                

  可变对象                `list`、`dict`、`set`、多数自定义实例                  可以在原对象上修改内容
  ---------------------------------------------------------------------------------------------------------------

``` python
x = 10
old_id = id(x)
x = 20
print(id(x) == old_id)  # 通常为 False：名字重新绑定到另一个整数对象

items = [1, 2]
old_id = id(items)
items.append(3)
print(id(items) == old_id)  # True：列表对象原地修改
```

注意：

-   不可变对象不是"变量不能重新赋值"，而是**对象内容不能原地改变**。
-   元组的外层结构不可变，但如果元组中包含列表等可变对象，内部对象仍可以修改。

``` python
t = (1, [2, 3])
t[1].append(4)  # 合法
# t[0] = 9      # 不合法
```

## 2.2 真值判断

以下对象在布尔上下文中通常为假：

-   `False`
-   `None`
-   数值零：`0`、`0.0` 等
-   空序列：`""`、`[]`、`()`
-   空集合：`set()`
-   空字典：`{}`

其他大多数对象为真。

``` python
if not items:
    print("列表为空")
```

## 2.3 对象身份、缓存与复用（CPython 实现细节）

理解对象身份时，必须区分三个概念：

  概念       含义                           常用判断
  ---------- ------------------------------ ----------
  值相等     两个对象内容是否相等           `a == b`
  对象身份   是否为同一个对象               `a is b`
  对象标识   对象存活期间用于标识身份的值   `id(a)`

**不要用 `is` 判断普通数值或字符串是否相等。** `is`
主要用于判断身份，最典型的是 `x is None`。

``` python
a = [1, 2]
b = [1, 2]
c = a

a == b  # True：值相等
a is b  # False：不是同一个列表对象
a is c  # True：两个名字引用同一个对象
```

### 为什么有时两个独立赋值的对象 `is` 为 True？

CPython
为了性能和内存效率，可能复用某些对象，或在编译阶段合并常量。这些行为大多属于**实现优化**，不能作为业务逻辑的依据。

  -----------------------------------------------------------------------------------------------------------------------
  现象                                  说明                                       是否可依赖
  ------------------------------------- ------------------------------------------ --------------------------------------
  小整数缓存                            CPython 通常缓存 `-5` 到 `256` 的整数对象  否，属于实现细节

  字符串驻留                            某些字符串会被 intern；也可用              自动驻留策略不可依赖
                                        `sys.intern()` 显式驻留                    

  字面量常量合并                        编译器可能合并相同常量或相邻字符串字面量   不应依赖身份

  常量折叠                              编译器可能预先计算常量表达式               结果语义可依赖，具体优化方式不可依赖

  空元组复用                            CPython 常复用空元组                       不应依赖身份

  空 `frozenset`                        实现可能复用，也可能不复用                 不可依赖

  `None`、`True`、`False`、`Ellipsis`   语言内建的单例对象                         可以用 `is` 判断
  -----------------------------------------------------------------------------------------------------------------------

``` python
# 推荐：判断值用 ==
x == 100

# 推荐：判断单例用 is
if result is None:
    ...

# 显式驻留字符串
import sys
a = sys.intern("some_identifier")
b = sys.intern("some_identifier")
assert a is b
```

注意：

-   `id(obj)` 不是通用的内存地址
    API。语言保证对象存活期间身份标识稳定；CPython
    中通常与内存地址相关。
-   `is`
    的结果可能受解释器实现、版本、编译上下文影响。不要根据某次运行的
    `is True` 推导语言规则。
-   `a = 1 + 2` 的结果是
    `3`。编译器可能提前折叠常量表达式，但不改变表达式语义。
-   Python 语言规范不承诺小整数缓存的具体范围；`-5` 到 `256` 是 CPython
    常见实现行为，而不是跨实现保证。

### 其他容易混淆的"共享"

对象复用与程序主动共享状态不是一回事：

1.  **默认参数共享**：默认值在函数定义时求值一次，见「5.5
    默认参数的陷阱」。
2.  **类属性共享**：类属性由类对象持有，实例通常通过类查找访问；可变类属性被原地修改时，实例会观察到变化。
3.  **闭包共享变量**：闭包捕获外层作用域中的变量绑定，不是简单复制当时的值；见「6.4
    闭包」。
4.  **赋值共享引用**：`b = a` 不复制对象，只增加一个名字绑定；见「11.1
    赋值不是拷贝」。

## 2.4 解包赋值

``` python
a, b, c = [10, 20, 30]

first, *middle, last = [1, 2, 3, 4, 5]
# first = 1
# middle = [2, 3, 4]
# last = 5
```

字典直接解包时，默认解包的是 **key**：

``` python
data = {"name": "Tom", "age": 18}
name, age = data
```

`_`
常被用作"我不关心这个值"的占位名字，但它仍然是普通变量名，并非语言保留字。

------------------------------------------------------------------------

# 3. 数据类型与数据结构

## 3.1 内置类型总览

  ------------------------------------------------------------------------------------------
  类别              类型                        主要用途                 可变性
  ----------------- --------------------------- ------------------------ -------------------
  数值              `int`、`float`、`complex`   整数、浮点数、复数       不可变

  布尔              `bool`                      真/假判断                不可变

  空值              `NoneType`                  表示缺失、无值或无结果   不可变

  文本              `str`                       Unicode 文本             不可变

  二进制            `bytes`、`bytearray`        字节数据                 bytes
                                                                         不可变；bytearray
                                                                         可变

  序列              `list`、`tuple`、`range`    有序数据                 list
                                                                         可变；tuple/range
                                                                         不可变

  集合              `set`、`frozenset`          去重、集合运算           set 可变；frozenset
                                                                         不可变

  映射              `dict`                      键值映射                 可变
  ------------------------------------------------------------------------------------------

## 3.2 `None`

`None` 是 `NoneType` 类型唯一的常用实例，用于表示"没有值""尚无结果"等。

``` python
result = None

def save():
    print("saved")
    # 没有显式 return，函数返回 None
```

不要把 `None` 与空字符串、数字零、空列表混为一谈。

## 3.3 列表 `list`

有序、可变、允许重复、支持索引和切片。

``` python
items = [10, 3, "aa", "cc", ["a", 4]]

items[0]       # 10
items[-1]      # ["a", 4]
items[1:3]     # [3, "aa"]
items.append(5)
items.extend([6, 7])
items.insert(0, 99)
items.remove(3)
value = items.pop()
```

-   正向索引从 `0` 开始。
-   反向索引从 `-1` 开始。
-   `append(x)` 添加一个元素；`extend(iterable)`
    将可迭代对象中的元素逐个添加。
-   列表越界访问会抛出 `IndexError`。

## 3.4 元组 `tuple`

有序、不可变、允许重复，常用于固定结构的数据。

``` python
point = (10, 20)
single = ("hello",)  # 单元素元组必须带逗号
nested = ((1, 2), (3, 4))
```

元组不可变指的是元素引用不能被替换，不代表其中引用的可变对象也被冻结：

``` python
data = (1, ["a", "b"])
data[1].append("c")  # 合法
```

## 3.5 字符串 `str`

字符串是不可变的 Unicode 文本序列，支持索引、切片和大量字符串方法。

``` python
text = "hello world"
new_text = text.replace("l", "L")

print(text)      # hello world：原字符串不变
print(new_text)  # heLLo worLd
# text[0] = "H"  # TypeError
```

### 字符串格式化

优先掌握 f-string：

``` python
name = "张三"
height = 175.22
salary = 1000.123456

print(f"{name}，身高 {height:.2f} cm，工资 {salary:10.2f}")
```

常见格式：

-   `{value:.2f}`：保留两位小数。
-   `{value:10}`：最小字段宽度为 10。
-   `{value:>10}`：右对齐。
-   `{value:<10}`：左对齐。
-   `{value:^10}`：居中。

其他格式化方式：

``` python
"姓名：{}，年龄：{}".format("张三", 18)
"姓名：%s，年龄：%d" % ("张三", 18)
```

`%` 格式化是旧式写法；`m.n` 的含义取决于格式转换类型，不能笼统理解成"m
总宽度、n 小数位"。新代码优先使用 f-string。

## 3.6 集合 `set`

无序、不支持索引、元素唯一，适合去重和集合运算。

``` python
values = {1, 2, 3, 3}
print(values)  # {1, 2, 3}

empty_set = set()  # 空集合
empty_dict = {}    # 空字典
```

集合元素必须是可哈希对象，通常是不可变对象；不能直接放入列表、字典或普通集合。

``` python
a = {1, 2, 3}
b = {3, 4, 5}

a & b  # 交集
a | b  # 并集
a - b  # 差集
a ^ b  # 对称差集
```

## 3.7 字典 `dict`

保存 key-value 映射。字典保持插入顺序（Python 3.7+ 语言规范保证），key
必须可哈希且唯一。

``` python
user = {
    "name": "张三",
    "age": 18,
}

user["name"]
user.get("email")            # 不存在时返回 None
user.get("email", "未填写")   # 指定默认值
user["age"] = 19
user["city"] = "北京"

for key, value in user.items():
    print(key, value)
```

-   key 通常使用字符串、整数、元组（其成员也必须可哈希）等。
-   value 可以是任意对象。
-   `dict` 的 key 唯一；重复赋值会覆盖原值。

## 3.8 通用操作与类型转换

``` python
len(container)
min(container)
max(container)
sorted(container, reverse=True)

list(iterable)
tuple(iterable)
set(iterable)
str(value)
```

注意：

-   `sorted()` 返回新列表，不会原地修改原容器。
-   `list(dict_obj)` 得到字典的 key 列表。
-   `str(obj)` 是转成字符串表示，不等于把任意容器序列化成可逆格式。
-   `set()` 会去重，但不保证顺序。

## 3.9 比较规则

-   字符串按 Unicode 码点顺序进行字典序比较，不是简单地"转 ASCII 比较"。
-   Python 3 的 `str` 是 Unicode 文本；UTF-8
    是常见编码方式，不是字符串比较规则。
-   不同类型之间通常不能直接进行大小比较，例如 `1 < "2"` 会报
    `TypeError`。

------------------------------------------------------------------------

# 4. 运算符、表达式与流程控制

## 4.1 常用运算符

  类型     运算符
  -------- -------------------
  算术     `+ - * / // % **`
  比较     `== != > < >= <=`
  逻辑     `not and or`
  成员     `in`、`not in`
  身份     `is`、`is not`
  位运算   `& | ^ ~ << >>`

逻辑运算优先级：`not` 高于 `and`，`and` 高于 `or`。

## 4.2 短路求值

`and` 和 `or` 不一定返回布尔值，而是返回参与判断的某个操作数：

``` python
name = input_name or "anonymous"
result = user and user["name"]
```

-   `A and B`：A 为假时返回 A；A 为真时继续判断并返回 B。
-   `A or B`：A 为真时返回 A；A 为假时继续判断并返回 B。

## 4.3 条件与循环

``` python
if score >= 90:
    level = "A"
elif score >= 60:
    level = "B"
else:
    level = "C"
```

``` python
for item in items:
    print(item)

for i in range(1, 10, 2):
    print(i)

while condition:
    # ...
    break       # 结束当前循环
    # continue  # 跳过本轮剩余语句
```

`range(start, stop, step)` 的 `stop` 不包含在结果中。

------------------------------------------------------------------------

# 5. 函数

## 5.1 定义与调用

``` python
def add(a, b):
    return a + b

result = add(1, 2)
```

-   `def` 定义普通函数。
-   `lambda` 定义简短匿名函数，适合简单表达式，不适合承载复杂业务逻辑。
-   函数是对象，可以赋值给变量、作为参数传递、作为返回值。

定义函数时，解释器创建函数对象并执行必要的定义阶段工作；调用函数时才执行函数体。

## 5.2 参数类型

``` python
def create_user(name, age=18, *args, city, **kwargs):
    ...
```

  参数类型         说明                        示例
  ---------------- --------------------------- -------------------------
  位置参数         按位置传值                  `f("Tom", 18)`
  关键字参数       按参数名传值，可调整顺序    `f(age=18, name="Tom")`
  默认参数         调用时可省略                `age=18`
  可变位置参数     收集多余位置参数为 tuple    `*args`
  可变关键字参数   收集多余关键字参数为 dict   `**kwargs`
  仅限关键字参数   必须通过参数名传入          `*, city` 后面的参数

参数顺序需要遵守 Python 语法规则。典型形式：

``` python
def func(positional, default=1, *args, keyword_only, **kwargs):
    print(positional, default, args, keyword_only, kwargs)
```

调用：

``` python
func(10, 20, "a", "b", keyword_only="北京", extra=True)
```

## 5.3 `*` 与 `**` 的解包

``` python
def show(a, b, c):
    print(a, b, c)

values = [1, 2, 3]
show(*values)  # 等价于 show(1, 2, 3)

data = {"a": 1, "b": 2, "c": 3}
show(**data)   # 等价于 show(a=1, b=2, c=3)
```

-   在**函数定义**中，`*args` / `**kwargs` 用于收集参数。
-   在**函数调用**中，`*iterable` / `**mapping` 用于解包参数。
-   `*dict` 解包的是字典的 key，不是 value。

## 5.4 返回值与多返回值

``` python
def get_info():
    return "张三", 18

name, age = get_info()
result = get_info()  # 实际返回一个 tuple
```

Python 函数只能通过 `return`
返回一个对象；写多个逗号分隔的值时，通常是返回一个元组。

没有显式 `return` 或只写 `return`，返回值都是 `None`。

## 5.5 默认参数的陷阱

默认参数表达式在函数定义时求值一次，不是每次调用时重新创建。

``` python
# 不推荐
def add_item(item, items=[]):
    items.append(item)
    return items

# 推荐
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

## 5.6 参数传递的准确理解

Python 使用对象引用传递（也常称 call by
sharing）：函数参数名绑定到传入对象。

-   对可变对象进行原地修改，调用方可能观察到变化。
-   在函数内部把参数名重新绑定到新对象，不会改变调用方变量的绑定。

``` python
def change(items):
    items.append(3)  # 修改同一个列表对象

def rebind(items):
    items = [100]    # 只改变局部名字的绑定
```

------------------------------------------------------------------------

# 6. 命名空间、作用域与闭包

## 6.1 命名空间 Namespace

命名空间是**名字到对象的映射**。可以把它理解为一张查找表；模块全局命名空间通常可通过
`globals()` 观察，局部命名空间可通过 `locals()` 观察。

常见命名空间：

  命名空间          创建时机         主要内容
  ----------------- ---------------- ----------------------------------
  Built-in          解释器初始化     `print`、`int`、内建异常等
  Global            模块执行时       模块级变量、函数、类
  Enclosing         外层函数调用时   外层函数局部变量，供内层函数访问
  Local             函数调用时       当前函数参数和局部变量
  Class namespace   执行类定义体时   类属性、方法等

类命名空间主要参与类属性和属性查找，不应简单地把它插入函数的 LEGB
查找链中。

## 6.2 作用域与 LEGB

函数中查找普通名字时，常见顺序是：

``` text
L - Local       当前函数局部作用域
E - Enclosing   外层函数作用域
G - Global      当前模块全局作用域
B - Builtins    内建命名空间
```

Python
使用词法（静态）作用域：变量的作用域关系由代码结构决定，而不是由调用者是谁决定。

Python 没有普通的 `if`、`for`、`while`
块级作用域；但函数、类、模块等会形成自己的命名空间/作用域边界。

## 6.3 `global` 与 `nonlocal`

``` python
count = 0

def increment():
    global count
    count += 1
```

`global` 声明函数中对某名字的赋值指向模块全局命名空间。

``` python
def outer():
    count = 0

    def inner():
        nonlocal count
        count += 1

    inner()
    return count
```

`nonlocal` 指向最近一层、且已经存在该名字的外层函数作用域。

注意：对列表执行 `append()` 等原地修改，通常不需要 `global` /
`nonlocal`；只有需要在当前作用域内**重新绑定名字**时，才需要相应声明。

## 6.4 闭包

闭包是函数对象与其捕获的外部作用域变量之间的组合。内层函数即使在外层函数执行结束后，仍可以访问被捕获的变量。

``` python
def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
```

常见用途：保存状态、延迟执行、装饰器、函数工厂。

------------------------------------------------------------------------

# 7. 模块、包与项目组织

## 7.1 模块 Module

一个 Python 模块通常对应一个 `.py`
文件。模块可以包含变量、函数、类和可执行语句。

``` python
import math
from pathlib import Path
import numpy as np
```

常见导入方式：

``` python
import module
import module as alias
from module import function
from module import function as alias
```

不建议在业务代码中大量使用
`from module import *`，因为它会让名字来源不清晰，也容易造成命名冲突。

## 7.2 `__name__`

``` python
if __name__ == "__main__":
    main()
```

-   文件作为程序入口直接执行时，`__name__ == "__main__"`。
-   文件作为模块导入时，`__name__` 通常是模块的导入名。

用途：把可复用定义与脚本入口逻辑分开。

## 7.3 `__all__`

`__all__` 主要控制执行 `from module import *` 时导出的名称：

``` python
__all__ = ["add", "subtract"]
```

它不是模块的访问权限系统，也不会阻止别人显式导入其他名字。

包中的 `__all__` 可用于控制 `from package import *`
时导出的名称，但不会自动替代模块导入和包初始化机制。

## 7.4 包 Package

包用于组织多个模块。传统常规包通常包含 `__init__.py`：

``` text
my_project/
├── pyproject.toml
└── src/
    └── my_app/
        ├── __init__.py
        ├── main.py
        ├── api/
        │   ├── __init__.py
        │   └── users.py
        └── services/
            ├── __init__.py
            └── user_service.py
```

Python 3 还支持 namespace
package（命名空间包），因此并非所有包都必须包含
`__init__.py`。但常规项目通常保留它，以明确包边界并便于初始化。

## 7.5 导入与模块缓存

-   首次导入模块时，Python 查找模块、创建模块对象并执行模块代码。
-   导入后的模块通常缓存在 `sys.modules` 中。
-   后续再次导入通常复用缓存中的模块对象，不会简单地从头执行一遍。
-   `import x as y`
    是给导入对象在当前命名空间中绑定别名，不会把模块本身改名。
-   不同文件需要各自执行导入语句，不能因为另一个文件导入过就假设当前文件自动拥有该名字。

## 7.6 第三方依赖与项目安装

``` bash
python -m pip install requests
```

使用 uv 时：

``` bash
uv add requests
uv sync
```

-   `pip` / `uv` 负责安装依赖。
-   `pyproject.toml` 用于声明项目元数据、依赖和工具配置。
-   `src` 布局把可导入包放在 `src/`
    下，减少从项目根目录意外导入源码的情况。
-   `pip install -e .`
    是可编辑安装：把当前项目安装到环境中，开发时修改源码通常不需要重新安装。
-   项目目录名与 Python 包名不要求相同，例如项目名 `my-agent`
    可以对应导入包 `my_agent`。

------------------------------------------------------------------------

# 8. 面向对象编程

## 8.1 面向过程与面向对象

-   **面向过程**：围绕步骤和流程组织代码。
-   **面向对象**：围绕对象组织状态和行为。
-   两者不是互斥关系。面向对象程序内部仍然由函数和步骤完成工作。

## 8.2 类与对象

-   类（class）：描述一类对象的属性和行为，是创建实例的模板。
-   对象/实例（instance）：根据类创建的具体对象。
-   属性：对象或类所关联的数据。
-   方法：定义在类中的函数，通常描述对象行为。

``` python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        return f"{self.name}, {self.age}"

user = User("张三", 18)
print(user.introduce())
```

## 8.3 `self` 与实例化过程

`self` 不是 Python
关键字，只是实例方法中约定俗成的第一个参数名，代表当前实例。

``` python
user.introduce()
# 近似等价于
User.introduce(user)
```

调用 `User(...)` 创建实例时，核心过程涉及 `__new__()` 创建对象，再由
`__init__()` 初始化对象。`__init__()`
不负责创建对象，也不应返回其他对象。

## 8.4 常见魔法方法

  方法                       用途
  -------------------------- -----------------------------------------------------
  `__new__`                  创建实例
  `__init__`                 初始化实例
  `__str__`                  面向用户的字符串表示，常被 `str()` / `print()` 使用
  `__repr__`                 面向开发者的表示，常用于调试
  `__del__`                  对象终结时可能调用；不适合承担关键资源释放
  `__len__`                  支持 `len(obj)`
  `__iter__`                 返回迭代器
  `__next__`                 获取下一个元素
  `__enter__` / `__exit__`   支持上下文管理器 `with`

不要依赖 `__del__()` 的执行时机来关闭文件、网络连接等资源；使用 `with`
或显式关闭更可靠。

## 8.5 实例属性、类属性与方法类型

``` python
class Student:
    school = "一中"  # 类属性

    def __init__(self, name):
        self.name = name  # 实例属性

    def show(self):       # 实例方法
        print(self.name)

    @classmethod
    def show_school(cls): # 类方法
        print(cls.school)

    @staticmethod
    def is_adult(age):    # 静态方法
        return age >= 18
```

  类型       第一个隐式参数   适用场景
  ---------- ---------------- ------------------------------------
  实例方法   `self`           访问/修改实例状态
  类方法     `cls`            访问/修改类状态，或提供替代构造器
  静态方法   无               与类逻辑相关，但不依赖实例或类状态

类属性可被实例访问，但对可变类属性进行原地修改会影响共享该对象的实例。实例对同名属性赋值，通常会在实例自身创建同名属性，从而遮蔽类属性。

## 8.6 封装与"私有"属性

Python 没有 Java 那种严格的 `private`
访问控制。双下划线开头的属性会触发名称改写（name mangling）：

``` python
class Person:
    def __init__(self, name):
        self.name = name
        self.__mobile = "123456"

    def get_mobile(self):
        return self.__mobile
```

`__mobile` 通常会被改写为
`_Person__mobile`，主要用于避免子类属性意外冲突，不是安全边界，也不是绝对不可访问。

命名习惯：

-   `name`：公开属性。
-   `_name`：约定为内部使用。
-   `__name`：触发名称改写。
-   `__name__`：通常是 Python
    特殊方法或特殊属性命名形式，不要自行随意占用。

## 8.7 继承、重写与 `super()`

``` python
class Animal:
    def speak(self):
        print("动物发声")

class Dog(Animal):
    def speak(self):
        print("汪汪")
        super().speak()
```

-   子类继承父类的属性和方法。
-   子类定义同名方法会覆盖继承来的方法，即方法重写。
-   `super()` 按
    MRO（方法解析顺序）继续查找，不应简单理解成"直接调用父类"。
-   多继承的查找顺序可通过 `ClassName.mro()` 查看。
-   多继承时应遵守协作式继承设计，父类方法通常通过 `super()` 串联调用。

## 8.8 组合优先原则

组合是让一个对象持有另一个对象作为属性，以复用其能力。相比继承，组合通常耦合更低、替换更灵活。

-   "是一个"关系且行为确实可替代：考虑继承。
-   "有一个/使用一个"关系：优先考虑组合。

## 8.9 多态

多态强调不同对象可以通过共同接口被统一使用：

``` python
class Cat:
    def speak(self):
        print("喵")

class Dog:
    def speak(self):
        print("汪")

def make_sound(animal):
    animal.speak()
```

Python 常使用鸭子类型（duck
typing）：关注对象是否提供所需行为，而不是必须继承某个指定父类。

## 8.10 `property`

`property` 把方法包装成属性接口，常用于校验或控制读写：

``` python
class Person:
    def __init__(self, age):
        self._age = age

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("age 不能小于 0")
        self._age = value
```

也可以通过 `property(getter, setter)` 形式创建，但装饰器写法更常见。

## 8.11 反射与元类

-   **反射**：运行时检查或操作对象属性，例如
    `getattr()`、`setattr()`、`hasattr()`、`delattr()`。
-   **元类**：用于控制类对象如何创建；`type`
    是常见默认元类。一般业务开发很少需要自定义元类，先理解即可。

## 8.12 内置函数、反射与对象协议

Python 内置函数（Built-in
Functions）是语言运行环境提供的常用工具。它们不是彼此孤立的"命令"，很多操作会通过对象协议调用特殊方法（常被称为魔法方法）。

### 常用内置函数分类

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------
  分类                    常用函数                                                                                               用途
  ----------------------- ------------------------------------------------------------------------------------------------------ --------------------------------
  对象与类型              `type()`、`isinstance()`、`issubclass()`、`id()`、`dir()`、`help()`                                    查看对象类型、身份、属性和帮助

  数值计算                `abs()`、`round()`、`pow()`、`divmod()`、`sum()`、`min()`、`max()`                                     数值处理与聚合

  真值判断                `bool()`、`all()`、`any()`                                                                             真值转换、整体判断

  迭代处理                `iter()`、`next()`、`enumerate()`、`zip()`、`map()`、`filter()`、`sorted()`、`reversed()`、`range()`   迭代、组合、映射、过滤、排序

  类型构造/转换           `int()`、`float()`、`str()`、`bool()`、`list()`、`tuple()`、`set()`、`dict()`                          构造或转换对象

  反射与属性              `getattr()`、`setattr()`、`hasattr()`、`delattr()`、`vars()`                                           运行时检查和操作属性

  作用域                  `globals()`、`locals()`                                                                                查看全局/局部命名空间

  格式化与表示            `format()`、`repr()`、`str()`                                                                          格式化及字符串表示

  输入输出                `print()`、`input()`、`open()`                                                                         控制台与文件 I/O

  动态执行                `eval()`、`exec()`、`compile()`                                                                        执行动态表达式或代码
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------

补充理解：

-   `dir(obj)` 用于查看属性名称线索，不等于完整、可靠的 API 文档。
-   `help(obj)` 查看帮助文档。
-   `vars(obj)` 通常返回对象的 `__dict__`；并非所有对象都有
    `__dict__`，例如某些使用 `__slots__` 的对象。
-   `locals()`、`globals()` 返回命名空间映射；不要把修改 `locals()`
    的结果当作可靠的局部变量赋值机制。
-   `eval()` 计算表达式并返回结果；`exec()` 执行代码块，返回值为
    `None`。不要对不可信输入使用二者。
-   `__import__()` 是底层导入钩子；业务代码通常使用
    `importlib.import_module()` 做动态导入。
-   `__name__`、`__file__`、`__package__`、`__doc__`、`__annotations__`
    是模块/对象常见特殊属性，不是内置函数。

### 内置函数与特殊方法（对象协议）对照

  ------------------------------------------------------------------------------------------------
  内置函数 / 语法         常见协议入口                                     说明
  ----------------------- ------------------------------------------------ -----------------------
  `len(obj)`              `obj.__len__()`                                  返回长度

  `str(obj)`              `obj.__str__()`                                  用户可读表示

  `repr(obj)`             `obj.__repr__()`                                 开发者表示

  `abs(obj)`              `obj.__abs__()`                                  绝对值

  `bool(obj)` / `if obj`  `obj.__bool__()`；否则尝试 `obj.__len__()`       真值判断

  `iter(obj)`             `obj.__iter__()`；特定旧式序列协议也可能回退到   获取迭代器
                          `__getitem__()`                                  

  `next(it)`              `it.__next__()`                                  获取下一个值

  `obj[key]`              `obj.__getitem__(key)`                           下标/键访问

  `obj[key] = value`      `obj.__setitem__(key, value)`                    设置元素

  `del obj[key]`          `obj.__delitem__(key)`                           删除元素

  `x in obj`              通常 `obj.__contains__(x)`；否则可能迭代查找     成员测试

  `reversed(obj)`         优先 `obj.__reversed__()`；否则要求序列协议      反向迭代

  `obj()`                 `obj.__call__()`                                 可调用对象
  ------------------------------------------------------------------------------------------------

### 运算符与特殊方法

  表达式     常见特殊方法
  ---------- ----------------------------------------------------
  `a + b`    `a.__add__(b)`，必要时尝试反向运算 `b.__radd__(a)`
  `a - b`    `__sub__()` / `__rsub__()`
  `a * b`    `__mul__()` / `__rmul__()`
  `a / b`    `__truediv__()` / `__rtruediv__()`
  `a // b`   `__floordiv__()` / `__rfloordiv__()`
  `a % b`    `__mod__()` / `__rmod__()`
  `a ** b`   `__pow__()` / `__rpow__()`
  `a == b`   `__eq__()`
  `a != b`   `__ne__()`
  `a < b`    `__lt__()`
  `a <= b`   `__le__()`
  `a > b`    `__gt__()`
  `a >= b`   `__ge__()`

说明：运算符分派比表格中的单一方法调用更复杂，可能涉及反向方法、子类优先规则以及
`NotImplemented`。表格用于建立入口对应关系，不是完整的解释器调用流程。

### 属性访问协议

  --------------------------------------------------------------------------------
  操作                                相关特殊方法
  ----------------------------------- --------------------------------------------
  读取 `obj.x`                        `__getattribute__()`；属性不存在时可能调用
                                      `__getattr__()`

  写入 `obj.x = value`                `__setattr__()`

  删除 `del obj.x`                    `__delattr__()`
  --------------------------------------------------------------------------------

`__getattribute__()` 参与每次常规属性读取；`__getattr__()`
是属性查找失败后的后备机制。重写 `__getattribute__()` 时应使用
`object.__getattribute__(self, name)` 等方式避免递归。

### 对象创建与上下文管理

``` python
obj = MyClass()
```

通常涉及：

1.  元类的调用逻辑（默认元类通常是 `type`）。
2.  `__new__()` 创建实例。
3.  若 `__new__()` 返回当前类的实例，再调用 `__init__()` 初始化。

`__del__()` 是终结器，不等于可靠的析构/资源释放机制。资源应使用 `with`
或显式 `close()` 管理。

``` python
with resource as value:
    ...
```

对应上下文管理协议：

-   `__enter__()`：进入上下文并返回绑定给 `as` 的对象。
-   `__exit__(exc_type, exc_value, traceback)`：退出上下文；返回真值可抑制异常。

### 类型检查钩子

`isinstance(obj, A)` 和 `issubclass(B, A)`
的判断可能受抽象基类注册及元类钩子影响，涉及 `A` 的元类
`__instancecheck__()` /
`__subclasscheck__()`。它们不是普通实例类上随意定义同名方法就会触发的通用机制。

**核心认知：** Python
的许多内置操作和语法，会通过对象协议分派到特殊方法；但不能把所有语法都简单归结为"语法糖就是直接调用一个魔法方法"。

------------------------------------------------------------------------

# 9. 迭代器、生成器与推导式

## 9.1 可迭代对象 Iterable

可迭代对象可以被 `for` 遍历。常见有：

-   `list`、`tuple`、`str`、`dict`、`set`
-   `range`
-   文件对象
-   生成器
-   实现了迭代协议的自定义对象

可迭代对象不一定就是迭代器。

## 9.2 迭代器 Iterator

迭代器需要支持：

-   `__iter__()`：返回迭代器自身（或返回一个迭代器）。
-   `__next__()`：返回下一个值；没有更多元素时抛出 `StopIteration`。

``` python
class Count:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        value = self.current
        self.current += 1
        return value

for number in Count(1, 4):
    print(number)
```

`iter(obj)` 获取迭代器；`next(iterator)` 获取下一个值。

## 9.3 生成器 Generator

生成器是一种便于创建迭代器的方式，按需生成值，不必一次性把所有结果放进内存。

``` python
def count_up_to(n):
    for i in range(n):
        yield i

gen = count_up_to(3)
next(gen)  # 0
next(gen)  # 1
```

调用生成器函数时，不会立即执行函数体到结束，而是返回生成器对象；每次迭代推进执行，遇到
`yield` 暂停并产出值。

生成器表达式：

``` python
gen = (x * x for x in range(1000000))
```

与列表推导式比较：

``` python
squares_list = [x * x for x in range(100)]
squares_gen = (x * x for x in range(100))
```

列表推导式立即构造列表；生成器表达式按需计算。

## 9.4 推导式

``` python
[x * 2 for x in values]
{x: x * x for x in values}
{x for x in values if x > 0}
(x * 2 for x in values)
```

分别是列表、字典、集合和生成器表达式。

------------------------------------------------------------------------

# 10. 装饰器与属性管理

## 10.1 装饰器是什么

装饰器本质上是一个接收函数/类并返回函数/类的可调用对象，常用于在不直接修改原函数业务代码的情况下增加横切逻辑。

``` python
from functools import wraps

def log_call(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("调用前")
        result = func(*args, **kwargs)
        print("调用后")
        return result
    return wrapper

@log_call
def add(a, b):
    return a + b

print(add(1, 2))
```

`@log_call` 近似等价于：

``` python
def add(a, b):
    return a + b

add = log_call(add)
```

`functools.wraps` 用于保留被装饰函数的名称、文档字符串等元信息。

## 10.2 装饰器必须正确处理参数与返回值

通用装饰器通常使用：

``` python
def decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result
    return wrapper
```

不能只处理"无参数、无返回值"的函数，否则会破坏原函数接口。

## 10.3 多层装饰器

``` python
@decorator_a
@decorator_b
def task():
    pass
```

等价于：

``` python
task = decorator_a(decorator_b(task))
```

离函数最近的装饰器先应用，外层装饰器再包装内层结果。

## 10.4 带参数的装饰器

带参数装饰器通常多一层函数：

``` python
def retry(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == times - 1:
                        raise
        return wrapper
    return decorator

@retry(3)
def request_data():
    ...
```

------------------------------------------------------------------------

# 11. 赋值、浅拷贝与深拷贝

## 11.1 赋值不是拷贝

``` python
a = [1, 2]
b = a
b.append(3)
print(a)  # [1, 2, 3]
```

`a` 与 `b` 绑定到同一个列表对象。

## 11.2 浅拷贝

浅拷贝创建一个新的最外层容器，但内部元素仍然引用原对象。

``` python
import copy

source = [[1, 2], [3, 4]]
shallow = copy.copy(source)

shallow is source        # False
shallow[0] is source[0]  # True
```

列表切片、`list.copy()`、`dict.copy()` 等常见操作都是浅拷贝。

适用情况：只需要复制外层容器，或内部对象本来就打算共享。

## 11.3 深拷贝

深拷贝会递归复制嵌套对象（并通过 memo 机制处理循环引用）：

``` python
deep = copy.deepcopy(source)
```

适用情况：需要让嵌套可变对象也相互独立。

注意：深拷贝不一定适用于所有对象；文件句柄、锁、网络连接等资源对象通常不应简单深拷贝。

------------------------------------------------------------------------

# 12. 文件与资源管理

## 12.1 文件对象与操作系统资源

文件是操作系统通过文件系统提供的抽象；Python
的文件对象提供程序访问文件的接口。打开文件通常同时占用 Python
对象资源和操作系统文件描述符/句柄资源。

``` text
Python 程序
    ↓ open()
Python 文件对象
    ↓ 系统调用
操作系统文件描述符/句柄
    ↓
文件系统与存储设备
```

## 12.2 `open()` 参数

``` python
open(file, mode="r", encoding=None)
```

常用模式：

  模式   含义
  ------ --------------------------------
  `r`    只读，文件必须存在
  `w`    只写；存在则清空，不存在则创建
  `a`    追加写；不存在则创建
  `x`    独占创建；文件已存在则报错
  `+`    在基础模式上增加读写能力
  `t`    文本模式，默认
  `b`    二进制模式

组合示例：`rt`、`wt`、`rb`、`wb`、`r+`、`w+`、`a+`。

-   文本模式读写 `str`，需要编码/解码；通常显式指定 `encoding="utf-8"`。
-   二进制模式读写 `bytes`，不能指定 `encoding`。
-   `w` 会清空原文件；需要保留原内容时不要误用。

## 12.3 读文件

``` python
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

常见读取方法：

  方法              行为
  ----------------- --------------------------------------------------------
  `read(n)`         读取最多 n 个字符（文本模式）或 n 个字节（二进制模式）
  `readline()`      读取一行
  `readlines()`     读取所有行并返回列表
  `for line in f`   逐行迭代，适合大文件

大文件通常优先逐行读取，避免一次性把整个文件载入内存。

## 12.4 写文件与缓冲区

``` python
with open("data.txt", "w", encoding="utf-8") as f:
    f.write("hello\n")
    f.writelines(["第一行\n", "第二行\n"])
    f.flush()
```

-   `write()` 写入字符串。
-   `writelines()` 写入字符串可迭代对象，不会自动添加换行符。
-   写入通常经过缓冲区，不保证每次 `write()` 都立即落盘。
-   `flush()` 刷新 Python
    文件缓冲区；它不等同于所有硬件/文件系统层面的持久化保证。
-   `close()` 会刷新缓冲区并关闭文件。

## 12.5 二进制文件与编码

``` python
with open("image.jpg", "rb") as f:
    data = f.read()

text = "你好"
raw = text.encode("utf-8")
decoded = raw.decode("utf-8")
```

-   `str.encode()`：文本编码为 `bytes`。
-   `bytes.decode()`：字节按指定编码解码为文本。
-   图片、音频、压缩包等一般按二进制方式读写。

## 12.6 `seek()` 与 `tell()`

``` python
with open("data.bin", "rb") as f:
    f.seek(10, 0)  # 从文件开头偏移 10 字节
    position = f.tell()
```

`seek(offset, whence)`：

-   `whence=0`：从文件开头。
-   `whence=1`：从当前位置。
-   `whence=2`：从文件末尾。

二进制模式下偏移按字节计算。文本模式对 `seek()`
的偏移限制更严格，不应把文本模式下的偏移简单理解为任意字节偏移。

## 12.7 `with` 上下文管理器

``` python
with open("data.txt", encoding="utf-8") as f:
    content = f.read()
```

`with`
通过上下文管理协议确保退出代码块时执行清理逻辑，即使发生异常也会进入退出流程。它适用于文件、锁、数据库连接、网络连接等资源管理。

------------------------------------------------------------------------

# 13. 异常处理

## 13.1 基本结构

``` python
try:
    result = 10 / 2
except ZeroDivisionError as exc:
    print("除数不能为零：", exc)
else:
    print("try 中没有发生异常")
finally:
    print("无论是否发生异常，都会执行清理流程")
```

-   `try`：放置可能抛出异常的代码。
-   `except`：捕获并处理匹配的异常。
-   `else`：只有 `try` 块没有异常时执行。
-   `finally`：通常用于清理资源，无论是否异常都会执行（进程被强制终止等特殊情况除外）。

## 13.2 主动抛出异常与自定义异常

``` python
if age < 0:
    raise ValueError("age 不能小于 0")

class BusinessError(Exception):
    pass
```

建议：

-   捕获具体异常，而不是无差别捕获 `Exception`。
-   不要静默吞掉异常。
-   需要保留原始异常上下文时使用 `raise` 或
    `raise NewError(...) from exc`。
-   不要把正常业务分支全部写成异常流程。

------------------------------------------------------------------------

# 14. 常用标准库与第三方库

## 14.1 标准库模块分类

  -------------------------------------------------------------------------------------------------------------------------------
  领域                    模块                                                              用途
  ----------------------- ----------------------------------------------------------------- -------------------------------------
  时间日期                `time`、`datetime`                                                时间戳、日期时间、时间差

  随机与数学              `random`、`math`、`statistics`                                    随机数、数学函数、统计

  操作系统                `os`、`sys`                                                       环境、路径、进程参数、解释器信息

  路径                    `pathlib`、`os.path`                                              路径拼接、判断、遍历

  文件操作                `shutil`、`zipfile`、`tempfile`                                   复制、移动、压缩、临时文件

  序列化                  `json`、`pickle`                                                  JSON 数据交换、Python 对象序列化

  配置                    `configparser`、`tomllib`                                         INI、TOML 配置读取

  哈希                    `hashlib`                                                         SHA-256 等摘要计算

  正则                    `re`                                                              文本模式匹配

  标识符                  `uuid`                                                            生成 UUID

  二进制结构              `struct`                                                          Python 数据与二进制结构转换

  数据结构                `collections`、`heapq`、`bisect`                                  deque、Counter、堆、二分

  并发                    `threading`、`multiprocessing`、`concurrent.futures`、`asyncio`   多线程、多进程、线程池/进程池、协程

  网络                    `socket`、`urllib`、`http.server`                                 底层网络与简单 HTTP 服务

  子进程                  `subprocess`                                                      启动外部程序、执行系统命令

  日志                    `logging`                                                         分级日志、日志输出与配置
  -------------------------------------------------------------------------------------------------------------------------------

## 14.2 `pathlib` 与 `os.path`

新代码通常优先考虑 `pathlib`：

``` python
from pathlib import Path

path = Path("data") / "users.json"
if path.exists():
    text = path.read_text(encoding="utf-8")
```

`os` 仍然适合环境变量、进程、权限等操作；`pathlib`
更适合面向对象地处理路径。

## 14.3 JSON 与 pickle

``` python
import json

data = {"name": "Tom", "age": 18}
text = json.dumps(data, ensure_ascii=False)
obj = json.loads(text)
```

文件读写：

``` python
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json", encoding="utf-8") as f:
    data = json.load(f)
```

-   JSON 是跨语言数据交换格式，适合 API 和配置。
-   `pickle` 是 Python 专用序列化机制。
-   **不要反序列化不可信来源的 pickle 数据**，因为它可能执行任意代码。

## 14.4 `logging`

生产项目应优先使用 `logging`，而不是到处 `print()`：

``` python
import logging

logger = logging.getLogger(__name__)
logger.info("任务开始")
logger.exception("任务执行失败")
```

`logger.exception()` 通常在异常处理上下文中使用，会附带异常堆栈。

## 14.5 `subprocess`

``` python
import subprocess

result = subprocess.run(
    ["python", "--version"],
    capture_output=True,
    text=True,
    check=True,
)
print(result.stdout)
```

优先使用参数列表而不是拼接 shell
命令字符串；处理外部输入时尤其要避免命令注入风险。

## 14.6 常见第三方库

  领域          常见库                             用途
  ------------- ---------------------------------- ------------------------
  HTTP 客户端   `requests`、`httpx`                同步/异步 HTTP 请求
  Web 后端      `FastAPI`、`Starlette`、`Django`   API 与 Web 应用
  数据验证      `pydantic`                         数据解析、校验与序列化
  数据库        `SQLAlchemy`、数据库驱动           ORM、SQL 与数据库连接
  数值计算      `numpy`                            数组与数值运算
  数据分析      `pandas`                           表格数据处理
  可视化        `matplotlib`、`pyecharts`          图表
  AI/机器学习   按项目选择相应框架                 模型训练、推理与应用

------------------------------------------------------------------------

# 15. 网络编程基础

## 15.1 网络分层与 socket

Socket 是应用程序进行网络通信时常用的编程接口。它不是 TCP
本身，而是操作系统提供的网络通信抽象。

``` text
应用层协议（HTTP 等）
        ↓
传输层（TCP / UDP）
        ↓
网络层（IP）
        ↓
链路层与物理网络
```

## 15.2 TCP 与 UDP

  -------------------------------------------------------------------------------------
  对比                    TCP                           UDP
  ----------------------- ----------------------------- -------------------------------
  连接                    面向连接                      无连接

  可靠性                  提供有序、可靠字节流          不保证送达、顺序和去重

  数据边界                字节流，没有消息边界          数据报，有消息边界

  控制机制                流量控制、拥塞控制、重传      协议本身不提供上述完整机制

  常见用途                HTTP/HTTPS、数据库连接、SSH   DNS、实时音视频、部分游戏通信
  -------------------------------------------------------------------------------------

TCP 是字节流协议：一次 `send()` 不对应对端一次
`recv()`。应用层需要自行设计消息边界，例如固定长度、长度前缀或分隔符协议。

## 15.3 TCP 服务端基本流程

``` text
socket()
  ↓
bind()       绑定 IP 与端口
  ↓
listen()     开始监听
  ↓
accept()     接受连接，得到连接 socket
  ↓
recv()/send() 收发数据
  ↓
close()      关闭连接
```

客户端常见流程：

``` text
socket()
  ↓
connect()
  ↓
send()/recv()
  ↓
close()
```

服务端监听 socket 与 `accept()` 返回的连接 socket 是不同角色。

## 15.4 UDP 基本流程

UDP 服务端一般使用：

``` text
socket()
  ↓
bind()
  ↓
recvfrom()
  ↓
sendto()
```

UDP 客户端创建 socket 后可以直接 `sendto()`，也可以按需要使用
`connect()` 设置默认对端。

## 15.5 并发服务器

最简单的单线程 TCP
服务端通常一次处理一个连接；一个连接处理较慢时，其他连接可能等待。

可选方案包括：

-   多线程：每个连接/任务分配线程。
-   多进程：用多个进程处理连接或任务。
-   I/O 多路复用：`select`、`poll`、`epoll` 等。
-   异步框架：如 `asyncio`、`aiohttp`、`httpx`、FastAPI/Starlette
    所依赖的异步生态。

`socketserver`
提供基础服务器类，可用于理解同步、多线程和多进程服务器模型；生产项目通常使用更成熟的
Web/网络框架。

------------------------------------------------------------------------

# 16. 并发编程：进程、线程、协程

## 16.1 并发与并行

-   **并发（Concurrency）**：多个任务在一段时间内交替推进，宏观上同时处理多个任务。
-   **并行（Parallelism）**：多个任务在同一时刻真正同时执行，通常需要多核或多执行资源。
-   并发不等于并行。

## 16.2 进程 Process

进程是操作系统进行资源分配和隔离的重要单位。每个进程通常拥有独立的虚拟地址空间。

``` python
from multiprocessing import Process

def work(name):
    print("working:", name)

if __name__ == "__main__":
    p = Process(target=work, args=("task",))
    p.start()
    p.join()
```

常用操作：

-   `start()`：启动子进程。
-   `join()`：等待子进程结束。
-   `terminate()`：请求/强制终止进程，不适合用于正常清理流程。
-   `is_alive()`：检查进程是否仍在运行。
-   `daemon`：守护进程设置，需在启动前配置。

进程之间默认不共享普通 Python 对象；通信需要 IPC，例如
Queue、Pipe、共享内存等。Queue、Pipe、JoinableQueue 的完整用法见第 22
章。

**跨平台注意：** macOS、Windows 常见启动方式为 `spawn`；Linux 还可能使用
`fork`。多进程代码应使用 `if __name__ == "__main__":`
保护入口，避免子进程导入主模块时重复启动任务。

## 16.3 线程 Thread

线程是进程内的执行单元。同一进程中的线程共享进程地址空间，因此共享数据方便，但也需要处理竞态条件。

``` python
import threading

lock = threading.Lock()
counter = 0

def work():
    global counter
    with lock:
        counter += 1

threads = [threading.Thread(target=work) for _ in range(10)]

for thread in threads:
    thread.start()

for thread in threads:
    thread.join()
```

线程适合 I/O 密集型任务，例如等待网络、磁盘、数据库响应。

## 16.4 锁与同步原语

  原语                      作用
  ------------------------- --------------------------------------
  `Lock`                    互斥锁，同一时刻只允许一个线程持有
  `RLock`                   可重入锁，同一线程可重复获取
  `Semaphore`               信号量，限制同时访问某资源的任务数量
  `Event`                   事件标志，用于通知等待方
  `Condition`               条件变量，等待某个共享状态满足
  `queue.Queue`             线程安全队列
  `multiprocessing.Queue`   进程间队列；详见第 22 章

锁应使用上下文管理器：

``` python
with lock:
    # 临界区
    ...
```

死锁常见原因：多个锁获取顺序不一致、持锁等待另一个任务、异常路径没有正确释放锁等。降低风险的方法：统一锁顺序、缩小临界区、避免持锁执行慢
I/O、设置合理超时。

## 16.5 GIL（全局解释器锁）

在传统 GIL 构建的 CPython 中，同一进程内通常同一时刻只有一个线程执行
Python 字节码。因此：

-   多线程适合 I/O 密集型任务。
-   CPU 密集型纯 Python
    计算通常难以通过多线程实现多核并行，可考虑多进程或原生扩展。
-   GIL 不等于业务锁，不能代替 `Lock` 保护共享业务状态。
-   其他 Python 实现或 CPython 的特殊构建可能有不同情况；现代 CPython
    也出现了可选 free-threaded 构建，不能把"Python 永远只有
    GIL"当作语言定律。

## 16.6 线程池与进程池

``` python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def work(value):
    return value * 2

with ThreadPoolExecutor(max_workers=5) as pool:
    results = list(pool.map(work, range(10)))
```

-   `ThreadPoolExecutor`：线程池，适合大量 I/O 等待任务。
-   `ProcessPoolExecutor`：进程池，适合 CPU 密集型任务。
-   `submit()` 返回 `Future`，可通过 `result()` 获取结果；`map()`
    适合批量映射。

## 16.7 协程 Coroutine

协程是一种可以暂停并在之后恢复执行的任务。`async def`
定义的函数调用后会产生协程对象；协程需要由事件循环等机制调度运行。

``` python
import asyncio

async def work():
    await asyncio.sleep(1)
    return "done"
```

协程通常在单线程事件循环中协作式切换；它不等于线程，也不会自动让 CPU
密集计算并行。

------------------------------------------------------------------------

# 17. asyncio 异步编程

## 17.1 生态关系

``` text
asyncio（Python 标准库异步基础设施）
        ↑
AnyIO（兼容 asyncio / Trio 等异步后端的抽象层）
        ↑
Starlette / FastAPI 等框架可通过 AnyIO 等机制管理异步任务
```

不能简单说 FastAPI、Starlette、HTTPX 的所有异步底层都"完全依赖
AnyIO"；不同库、版本和执行路径的实现有所区别。AnyIO
的价值是提供统一的异步并发抽象。

## 17.2 最小可用模板

``` python
import asyncio

async def main():
    print("开始")
    await asyncio.sleep(1)
    print("结束")

asyncio.run(main())
```

-   `async def` 定义协程函数。
-   调用协程函数会得到 coroutine 对象。
-   `await` 用于等待可等待对象，并在等待期间让出控制权。
-   `asyncio.run()` 通常用于程序入口，创建并运行事件循环。

## 17.3 顺序等待与并发等待

顺序执行：

``` python
a = await fetch_a()
b = await fetch_b()
```

并发执行：

``` python
results = await asyncio.gather(
    fetch_a(),
    fetch_b(),
)
```

`gather()` 的结果顺序与传入 awaitable
的顺序一致，而不是谁先完成就排在谁前面。

## 17.4 Task 与 TaskGroup

``` python
task = asyncio.create_task(fetch_data())
result = await task
```

创建 Task 后，事件循环可以调度该任务。应保存需要管理的 Task
引用，并妥善处理异常与取消。

Python 3.11+ 推荐了解结构化并发 `TaskGroup`：

``` python
async def main():
    async with asyncio.TaskGroup() as group:
        group.create_task(fetch_a())
        group.create_task(fetch_b())
    # 离开上下文时，组内任务已完成或按规则取消
```

TaskGroup 中任务失败时，会触发组级别的取消与异常传播，具体异常可能以
`ExceptionGroup` 形式呈现。

## 17.5 异步代码中的阻塞陷阱

错误：

``` python
async def bad():
    time.sleep(1)          # 阻塞事件循环线程
    requests.get(url)      # 同步 HTTP 请求也会阻塞
```

推荐：

``` python
async def good():
    await asyncio.sleep(1)
    response = await async_client.get(url)
```

如果暂时只能使用同步阻塞 I/O 函数：

``` python
result = await asyncio.to_thread(blocking_function, arg)
```

`asyncio.to_thread()` 主要用于把阻塞 I/O 函数放到线程中执行，不是让纯
Python CPU 密集计算自动获得多核并行。

## 17.6 asyncio 的适用边界

适合：

-   大量网络请求。
-   高并发 I/O 等待。
-   异步数据库、异步 HTTP 客户端。
-   WebSocket、长连接等。

不适合直接解决：

-   纯 Python CPU 密集计算。
-   本身没有异步接口且无法隔离的阻塞调用。
-   需要多核并行计算的任务。

异步不是"执行速度一定更快"，而是提高等待期间的资源利用率和并发承载能力。

------------------------------------------------------------------------

# 18. I/O 模型与高性能网络基础

## 18.1 一次 I/O 的两个阶段

以网络接收为例：

1.  **等待数据准备好**：数据从网络到达，并进入内核 socket 接收缓冲区。
2.  **数据拷贝**：数据从内核缓冲区复制到用户空间缓冲区，供应用程序使用。

很多网络 I/O 的主要等待发生在第一阶段。

## 18.2 五种经典 I/O 模型

  ---------------------------------------------------------------------------------------------------------
  模型                    核心行为                             应用程序是否还要 `recv/read`
  ----------------------- ------------------------------------ --------------------------------------------
  阻塞 I/O                调用等待数据就绪，之后等待拷贝完成   是

  非阻塞 I/O              数据未就绪时立即返回，应用反复尝试   是

  I/O 多路复用            内核监视多个 fd，通知哪些 fd 就绪    是

  信号驱动 I/O            数据就绪时通过信号通知应用           通常是

  异步 I/O                应用提交请求，内核完成 I/O 后通知    典型完成模型中不需要再主动执行同一读取操作
  ---------------------------------------------------------------------------------------------------------

这里的"异步 I/O"是经典 I/O 模型语境下的概念，不要与 Python `async def`
直接画等号。

## 18.3 select、poll、epoll

-   `select`：使用集合描述要监视的
    fd，存在平台相关的数量限制；每次调用通常需要重新传入并扫描集合。
-   `poll`：使用 pollfd 数组，缓解了传统 `select` 的 fd
    数量限制，但仍需要遍历检查就绪项。
-   `epoll`：Linux 提供的 I/O
    事件通知机制，适合大量连接场景；通过内核维护关注集合和就绪事件，减少无效扫描。

`epoll` 通知的是**就绪（ready）**：某个 fd
现在可以尝试读/写；应用仍需调用 `recv()` / `send()`
完成相应操作。它通常归入同步 I/O
多路复用，而不是内核替应用完成全部数据拷贝的异步 I/O。

## 18.4 同步/异步与阻塞/非阻塞是两个维度

-   **阻塞/非阻塞**：描述调用是否会让当前线程等待。
-   **同步/异步**：描述 I/O 操作由谁推进、何时以何种方式通知完成。

典型理解：

-   epoll：等待事件时，线程可能阻塞在 `epoll_wait()`；收到 ready
    后，应用主动 `recv()`，属于 I/O 多路复用/同步 I/O。
-   典型异步 I/O：应用提交请求，内核完成操作后通知 completion。

因此"非阻塞 I/O 就是异步 I/O"是错误的。

## 18.5 Reactor 与 Proactor

-   **Reactor**：关注事件就绪；事件发生后由应用执行读写处理。常与
    `select`、`poll`、`epoll` 组合。
-   **Proactor**：应用先提交异步 I/O
    请求，由系统完成操作，再通知应用结果。

## 18.6 asyncio 与事件循环

可以用下面的概念链理解常见 asyncio 网络 I/O：

``` text
协程任务
   ↓
await 等待网络 I/O
   ↓
事件循环把 socket 注册到 I/O 多路复用机制
   ↓
内核监视 socket 是否就绪
   ↓
就绪事件通知事件循环
   ↓
事件循环恢复对应协程
   ↓
协程继续执行后续读写逻辑
```

不同操作系统底层可能使用 epoll、kqueue、IOCP 等不同机制。不要把 asyncio
永远等同于 Linux epoll。

## 18.7 用户态、内核态、DMA 与零拷贝

-   用户态程序通过系统调用请求内核执行文件、网络等操作。
-   用户态/内核态切换有成本，但不是每次切换都等价于一次完整的线程上下文切换。
-   DMA 允许设备在 DMA 控制器协助下与内存传输数据，减少 CPU 逐字节搬运。
-   零拷贝是一类减少数据复制和用户态参与的技术，不代表所有路径完全没有数据复制。

传统文件发送网络的概念路径：

``` text
磁盘/页缓存
   ↓
用户空间缓冲区
   ↓
内核 socket 缓冲区
   ↓
网卡
```

使用 `sendfile()`
等机制时，可以在适用条件下减少数据经过用户空间的往返拷贝。实际内核、驱动、协议和硬件路径会更复杂，不能把示意图当成所有机器的固定执行细节。

## 18.8 高并发的核心思路

高并发不只是"开更多线程"，还包括：

1.  不让线程长时间空等 I/O。
2.  减少不必要的线程/任务切换。
3.  控制数据复制与内存分配。
4.  减少不必要的系统调用。
5.  做好连接、队列、线程池和任务数量的背压管理。

常见技术关联：

  技术       相关思想
  ---------- --------------------------------------------
  Redis      事件驱动网络处理；具体版本与线程模型有演进
  Nginx      事件驱动、多路复用、`sendfile` 等
  asyncio    事件循环、协程、平台 I/O 事件机制
  Netty      Reactor 等网络事件驱动模型
  Kafka      页缓存、批量 I/O、零拷贝相关优化
  io_uring   Linux 新一代异步 I/O 接口
  IOCP       Windows 完成端口机制

------------------------------------------------------------------------

# 19. 核心概念对照表

## 19.1 名字、对象、作用域

  概念          回答的问题
  ------------- ------------------------------------
  对象          数据和行为是什么
  变量名/名称   用什么名字引用对象
  命名空间      名字存放在哪里、映射到什么对象
  作用域        当前代码按什么规则查找名字
  闭包          内层函数如何保留外层作用域中的变量

## 19.2 可迭代对象、迭代器、生成器

  概念           关键点
  -------------- ----------------------------------
  可迭代对象     能通过 `iter()` 获取迭代器
  迭代器         能通过 `next()` 逐个产出值
  生成器         用生成器函数或表达式创建的迭代器
  列表推导式     立即创建列表
  生成器表达式   按需生成元素

## 19.3 进程、线程、协程

  维度       进程               线程               协程
  ---------- ------------------ ------------------ ------------------------
  所属层级   操作系统           操作系统           语言/运行时任务
  内存       通常独立地址空间   同进程内共享       通常运行在某个线程上
  切换       相对较重           相对较轻           通常较轻
  通信       IPC                共享内存/队列/锁   通过 await、队列等协作
  适用方向   CPU 并行、隔离     I/O 并发、线程库   大量异步 I/O
  典型工具   multiprocessing    threading          asyncio

## 19.4 并发方案选择

  场景                                 优先考虑
  ------------------------------------ -----------------------------------
  大量同步 I/O 调用，改造成本低        线程池
  大量异步网络 I/O                     asyncio / 异步客户端
  纯 Python CPU 密集计算               多进程
  NumPy 等释放 GIL 的原生计算          结合库特性评估线程/进程
  简单后台任务                         线程/任务队列，视生命周期要求选择
  需要可靠任务投递、重试、跨机器执行   专门的任务队列/工作进程架构

## 19.5 内置函数与对象协议速查

  ------------------------------------------------------------------------------------------
  目标                    常用入口                            相关协议/注意点
  ----------------------- ----------------------------------- ------------------------------
  看类型                  `type()`、`isinstance()`            类型判断不等于身份判断

  看身份                  `id()`、`is`                        不用于比较普通值

  看属性                  `dir()`、`getattr()`、`hasattr()`   动态属性访问属于反射

  看长度                  `len()`                             `__len__()`

  遍历对象                `iter()`、`next()`、`enumerate()`   迭代协议

  组合数据                `zip()`                             默认按最短输入停止

  映射/过滤               `map()`、`filter()`                 返回迭代器

  排序                    `sorted()`                          返回新列表；依赖 key
                                                              或元素间可比较性

  反向遍历                `reversed()`                        返回反向迭代器，不是原地修改

  真值判断                `bool()`、`all()`、`any()`          `__bool__()` / `__len__()`

  字符串表示              `str()`、`repr()`、`format()`       面向用户/开发者/格式规范

  动态执行                `eval()`、`exec()`                  不可信输入存在代码执行风险
  ------------------------------------------------------------------------------------------

## 19.6 相等、身份与共享状态速查

  -----------------------------------------------------------------------------------------------
  情况                    是否共享同一对象               应如何理解
  ----------------------- ------------------------------ ----------------------------------------
  `b = a`                 是                             赋值建立新名字绑定，不复制对象

  `b = a.copy()`          否（外层容器不同）             浅拷贝，内部成员可能仍共享

  小整数/字符串字面量     有时可能                       解释器优化，不依赖 `is`

  `None` / `True` /       是对应单例                     可用 `is` 判断
  `False`                                                

  可变默认参数            多次调用共享默认对象           默认值在定义函数时求值

  可变类属性              多实例可能访问同一对象         类属性由类对象持有

  闭包变量                闭包函数共享被捕获的变量绑定   需要固定循环值时可用默认参数或工厂函数
  -----------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 20. 原笔记关键错误与修正清单

以下是原始笔记中容易造成错误理解的点，统一修正如下：

1.  **"Python
    是解释型语言"**：作为入门分类可以使用，但更准确地说，CPython
    会先编译为字节码，再由虚拟机执行。

2.  **"垃圾回收回收没有变量名的值"**：不准确。对象可能被容器、闭包、栈帧等引用；CPython
    主要依靠引用计数并配合循环垃圾回收。

3.  **"id
    就是内存地址"**：语言规范只保证对象存活期间身份标识唯一且稳定；CPython
    中通常与地址相关。

4.  **"字符串比较转 ASCII / 汉字转 UTF-8 或 GBK 比较"**：Python 3 的
    `str` 按 Unicode 码点进行字典序比较。

5.  **"集合只能存不可变类型"**：准确说是集合元素必须可哈希；常见不可变对象通常可哈希，但自定义类型可自行实现哈希规则。

6.  **"字典无序"**：Python 3.7+ 保证字典按插入顺序迭代。

7.  **"字典 key 不可以是数据容器"**：不准确。可哈希的元组可以作为
    key；列表、字典、集合等不可哈希对象不能直接作为 key。

8.  **"元组里面的值都不能变"**：元组外层结构不可变，但其中的可变对象仍可修改。

9.  **"位置参数必须写前面、默认参数放最后"**：这是常见函数签名的简化说法；还要考虑
    `*args`、仅限关键字参数和 `**kwargs` 的语法规则。

10. **"默认参数每次调用都会重新创建"**：错误。默认参数表达式在函数定义时求值一次，使用可变默认值容易产生状态共享问题。

11. **"`__del__`
    在文件执行结束或删除对象时必然立即调用"**：不可靠。对象终结时机受引用关系和实现影响，不能用它承担关键资源清理。

12. **"多继承优先左边父类"**：不完整。属性查找按 MRO（C3
    线性化）执行，使用 `Class.mro()` 查看；`super()` 按 MRO 继续查找。

13. **"双下划线属性是真正私有属性"**：错误。它主要触发名称改写，不是访问控制或安全机制。

14. **"两个锁就锁不住"**：错误。多个锁可以正确使用；但需要统一加锁顺序，避免死锁。锁保护的是共享临界区，不是锁对象的数量。

15. **"GIL 意味着 Python 只能通过多进程并行"**：仅适用于传统 GIL 构建的
    CPython 纯 Python 字节码执行场景。原生扩展可能释放 GIL，且已有可选
    free-threaded CPython 构建。

16. **"守护进程/线程就是主程序结束时所有任务都安全结束"**：守护任务可能被直接终止，清理代码不一定完整执行；重要任务应显式等待、取消并回收。

17. **"`asyncio.create_task()`
    创建的任务不保存引用就一定会被垃圾回收"**：更准确地说，事件循环对任务的强引用保证并非所有场景都能替代应用自己的生命周期管理；应保存任务引用并处理异常/取消。

18. **"`asyncio`、AnyIO、FastAPI
    是固定的单向依赖链"**：不应绝对化。AnyIO
    提供异步抽象，具体库和版本的内部调用路径不同。

19. **"`await` 只能在 async 函数里使用"**：普通 `.py`
    模块中通常如此；交互式环境、特定框架或支持顶层 await
    的环境有额外规则。

20. **"`asyncio` 能让 CPU 密集计算自动并行"**：错误。协程主要用于协作式
    I/O 并发；CPU 密集任务应考虑进程池或原生计算库。

21. **"epoll 是异步 I/O"**：经典模型分类中，epoll 属于 I/O
    多路复用，通知的是就绪事件；应用仍需调用 `recv()` / `send()`。

22. **"非阻塞 I/O 等于异步
    I/O"**：错误。阻塞/非阻塞与同步/异步是两个不同维度。

23. **"零拷贝就是完全没有拷贝"**：不准确。通常指减少数据复制、用户态参与或系统调用，实际路径取决于操作系统和硬件。

24. **文件读取的字符/字节单位**：文本模式 `read(n)` 的 n
    通常是字符数；二进制模式是字节数。不要把两者混淆。

25. **`writelines()` 不自动添加换行符**：需要在每个字符串中自行包含
    `\n`。

26. **`flush()` 不等于绝对持久化到物理介质**：它刷新 Python
    层缓冲；更强的持久化语义还涉及操作系统与存储设备。

27. **"小整数缓存范围是 Python 语言规范"**：错误。`-5` 到 `256` 是
    CPython 常见实现细节，不是跨解释器保证。

28. **"所有相同字符串都会驻留"**：错误。字符串驻留策略与解释器实现、上下文有关；需要时可显式使用
    `sys.intern()`，但不要用它替代正确的数据建模。

29. **"相同字面量 `is` 为 True 就说明可以用 `is`
    比较字符串"**：错误。应使用 `==` 比较值，`is` 比较身份。

30. **"`None`、`True`、`False`
    与小整数缓存性质相同"**：不准确。前几者是语言内建单例；小整数缓存是实现优化。

31. **"空元组/空 `frozenset`
    一定是单例"**：不能作为通用语言保证；尤其不要依赖容器构造的身份结果。

32. **"`1 + 2` 常量折叠成 `6`"**：明显笔误，正确结果是
    `3`。常量折叠只改变计算发生的时机，不改变表达式结果。

33. **"`sorted(obj)` 直接调用 `obj.__lt__()`
    一次"**：过度简化。排序通过比较协议进行比较，也可通过 `key=`
    提供排序键；比较分派可能涉及多个特殊方法。

34. **"`reversed(obj)` 一定调用 `__reversed__()`"**：不准确。优先使用
    `__reversed__()`，否则可使用序列协议（`__len__` 和整数索引
    `__getitem__`）。

35. **"`isinstance()` 会调用对象类自身的
    `__instancecheck__()`"**：不准确。相关钩子属于目标类元类层面的机制，且抽象基类等也有专门规则。

36. **"所有内置函数都直接对应一个同名魔法方法"**：错误。协议入口、回退规则和分派过程各不相同；对照表只是常见对应关系。

37. **"`__import__()` 是推荐的动态导入方式"**：不推荐。通常使用
    `importlib.import_module()`。

38. **"`locals()`
    返回字典，修改它就能可靠修改函数局部变量"**：不可靠。不要依赖修改
    `locals()` 的结果来改变优化过的函数局部变量。

------------------------------------------------------------------------

# 21. 建议学习顺序

建议按依赖关系学习，而不是按"基础、进阶、高级"文件名机械推进。

## 第一阶段：语言基础

1.  变量名与对象、`id/type/value`、可变与不可变。
2.  数值、字符串、列表、元组、字典、集合。
3.  索引、切片、运算符、条件与循环。
4.  函数、参数、返回值、解包。
5.  异常处理与文件读写。

**阶段目标：** 能独立编写小型脚本，读写数据并组织函数。

## 第二阶段：程序组织与面向对象

1.  模块、包、导入机制、`__name__`。
2.  命名空间、作用域、LEGB、`global`、`nonlocal`。
3.  类、实例、属性、方法、继承、组合、多态。
4.  `property`、魔法方法、反射。
5.  赋值、浅拷贝、深拷贝。

**阶段目标：** 能把脚本整理成结构清晰、可维护的多模块项目。

## 第三阶段：Python 语言进阶能力

1.  迭代协议、可迭代对象、迭代器。
2.  生成器、推导式。
3.  闭包与装饰器。
4.  常用标准库：`pathlib`、`json`、`logging`、`datetime`、`subprocess`
    等。
5.  项目依赖、虚拟环境、`pyproject.toml`、`uv`。

**阶段目标：** 能读懂常见 Python 库的接口设计，掌握常见工程化工具。

## 第四阶段：并发与网络

1.  TCP/UDP、socket、HTTP 基础。
2.  进程、线程、锁、队列。
3.  线程池、进程池、Future。
4.  协程、事件循环、`async` / `await`。
5.  `asyncio`、`Task`、`TaskGroup`、取消与异常处理。
6.  I/O 多路复用、Reactor、Proactor、零拷贝概念。

**阶段目标：** 能根据任务类型选择同步、线程池、进程池或异步 I/O。

## 第五阶段：面向 Python 后端与 AI 应用开发

在语言基础稳定后，再进入：

1.  FastAPI：路由、请求/响应、依赖注入、Pydantic。
2.  数据库：SQL、PostgreSQL、SQLAlchemy 2.x、Alembic。
3.  认证授权：JWT、RBAC、权限边界。
4.  异步后端：async endpoint、异步数据库驱动、HTTPX。
5.  工程化：日志、配置、测试、类型检查、Lint、CI/CD。
6.  AI 应用：模型 API、工具调用、RAG、Agent、任务编排与可观测性。

------------------------------------------------------------------------

## 最终知识地图

``` text
Python
│
├── 运行机制
│   ├── 解释器 / CPython
│   ├── 源码 → AST → 字节码 → 虚拟机执行
│   ├── 对象模型 / 引用 / 垃圾回收
│   └── 模块加载机制
│
├── 语言基础
│   ├── 数据类型与容器
│   ├── 运算符 / 流程控制
│   ├── 函数 / 参数 / 返回值
│   ├── 命名空间 / 作用域 / 闭包
│   └── 异常 / 文件 / 编码
│
├── 语言进阶
│   ├── 模块 / 包 / 项目组织
│   ├── 面向对象 / 继承 / 组合 / 多态
│   ├── 迭代器 / 生成器 / 推导式
│   ├── 装饰器 / property
│   └── 拷贝 / 反射
│
├── 标准库与工程能力
│   ├── pathlib / json / logging / subprocess
│   ├── datetime / re / collections / hashlib
│   ├── pip / uv / pyproject.toml
│   └── 测试 / 类型标注 / 代码质量
│
└── 网络与并发
    ├── Socket / TCP / UDP / HTTP
    ├── 进程 / 线程 / 锁 / 队列
    ├── 线程池 / 进程池
    ├── asyncio / Task / TaskGroup
    └── I/O 多路复用 / Reactor / Proactor / 零拷贝
```

> 学习主线：先理解 Python
> 如何表示对象、查找名字和执行函数，再理解如何组织程序；最后学习网络 I/O
> 与并发。这样后续学习 FastAPI、SQLAlchemy、HTTPX、LangChain/LangGraph
> 等框架时，会更容易看懂其底层机制。

------------------------------------------------------------------------

# 22. 并发通信：Queue、Pipe 与任务协作

> 本章是本次重点补回的内容。**Queue 和 Pipe 没有被淘汰**：它们仍是Python 标准库 `multiprocessing`提供的进程间通信（IPC）工具。
> 线程队列、进程队列、协程队列解决的是不同执行模型之间的通信问题，不能混为一谈。

## 22.1 先建立通信工具全景

  -------------------------------------------------------------------------------------------------------
  工具                              所属模块            通信范围                   典型用途
  --------------------------------- ------------------- -------------------------- ----------------------
  `queue.Queue`                     `queue`             同一进程内的线程之间       线程生产者/消费者

  `queue.LifoQueue`                 `queue`             同一进程内的线程之间       后进先出任务栈

  `queue.PriorityQueue`             `queue`             同一进程内的线程之间       按优先级取任务

  `multiprocessing.Queue`           `multiprocessing`   多个进程之间               多生产者、多消费者

  `multiprocessing.JoinableQueue`   `multiprocessing`   多个进程之间               需要确认任务完成

  `multiprocessing.Pipe`            `multiprocessing`   进程之间的连接端点         两个进程直接收发消息

  `asyncio.Queue`                   `asyncio`           同一事件循环中的协程任务   异步生产者/消费者

  `subprocess.PIPE`                 `subprocess`        父进程与子进程标准流       捕获命令的
                                                                                   stdin/stdout/stderr
  -------------------------------------------------------------------------------------------------------

选择时先问：**谁和谁通信？线程、进程、协程，还是外部子进程？**

## 22.2 `queue.Queue`：线程间队列

`queue.Queue` 是线程安全的 FIFO 队列。多个线程可以同时 `put()` 和
`get()`，队列内部负责必要的同步。

``` python
from queue import Queue, Empty
from threading import Thread

tasks = Queue(maxsize=100)

def producer():
    for item in range(5):
        tasks.put(item)       # 队列满时默认等待
    tasks.put(None)           # 发送结束标记

def consumer():
    while True:
        item = tasks.get()    # 队列空时默认等待
        try:
            if item is None:
                return
            print("处理：", item)
        finally:
            tasks.task_done()

t1 = Thread(target=producer)
t2 = Thread(target=consumer)
t1.start()
t2.start()

tasks.join()                  # 等待所有 put 的任务都 task_done
t1.join()
t2.join()
```

常用 API：

  API                                     作用
  --------------------------------------- ------------------------------------
  `put(item, block=True, timeout=None)`   放入元素；满队列时可阻塞
  `put_nowait(item)`                      非阻塞放入；失败抛出 `queue.Full`
  `get(block=True, timeout=None)`         取出元素；空队列时可阻塞
  `get_nowait()`                          非阻塞取出；失败抛出 `queue.Empty`
  `task_done()`                           通知队列某个已取出的任务处理完毕
  `join()`                                等待未完成任务计数归零

注意：`Queue.join()`
等待的是任务完成计数归零，不是等待线程退出。每次成功 `get()`
后，消费者应对对应任务调用一次 `task_done()`，否则 `join()`
可能一直等待。

### `LifoQueue` 与 `PriorityQueue`

``` python
from queue import LifoQueue, PriorityQueue

stack = LifoQueue()
stack.put("first")
stack.put("second")
print(stack.get())             # second

priority = PriorityQueue()
priority.put((10, "普通任务"))
priority.put((1, "高优先级任务"))
print(priority.get())          # (1, '高优先级任务')
```

`PriorityQueue` 默认按元素比较顺序取出最小项，因此数值越小越先出队。若优先级相同且任务对象不可比较，可加入递增序号作为第二排序字段：

``` python
from itertools import count
from queue import PriorityQueue

sequence = count()
tasks = PriorityQueue()
tasks.put((1, next(sequence), {"job": "A"}))
tasks.put((1, next(sequence), {"job": "B"}))
```

## 22.3 `multiprocessing.Queue`：进程间队列

不同进程拥有相互隔离的地址空间，普通 Python
列表或变量不会因为传给子进程就自动成为共享状态。`multiprocessing.Queue`
提供跨进程消息传递。

``` python
from multiprocessing import Process, Queue

def producer(q):
    for value in range(3):
        q.put(value)
    q.put(None)                # 结束标记

def consumer(q):
    while True:
        value = q.get()
        if value is None:
            break
        print("收到：", value)

if __name__ == "__main__":
    q = Queue()
    p1 = Process(target=producer, args=(q,))
    p2 = Process(target=consumer, args=(q,))
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    q.close()
    q.join_thread()
```

要点：

-   `put()` / `get()` 是主要接口；有界队列满时 `put()` 可以阻塞，空队列
    `get()` 可以阻塞。
-   进程队列传递 Python 对象时需要序列化（通常使用
    pickle），接收端再反序列化。
-   它内部涉及管道、缓冲、锁/信号量以及 feeder thread
    等实现细节；**不要把实现简单概括成固定的"Pipe +
    一把锁"**，具体内部实现属于 CPython 版本实现细节。
-   `empty()`、`full()`、`qsize()`
    在多进程并发场景下不能作为可靠同步依据；应通过阻塞操作、超时、哨兵值或明确的协议协调。
-   `get_nowait()` / `put_nowait()` 是非阻塞操作，可能抛出 `queue.Empty`
    / `queue.Full`。
-   使用完毕可调用 `close()`，并按需要调用 `join_thread()` 等待队列后台
    feeder thread 结束。

## 22.4 `JoinableQueue`：确认任务处理完成

`JoinableQueue` 在进程队列基础上增加未完成任务计数：

``` text
put(task)       → 未完成任务数 +1
get()           → 取出任务，但计数不减少
task_done()     → 未完成任务数 -1
join()          → 等待未完成任务数归零
```

完整示例（包含结束哨兵和任务确认）：

``` python
from multiprocessing import Process, JoinableQueue

def worker(q):
    while True:
        task = q.get()
        try:
            if task is None:
                return
            print("处理任务：", task)
        finally:
            # 普通任务和结束哨兵都要与一次 put 对应一次 task_done
            q.task_done()

if __name__ == "__main__":
    q = JoinableQueue()
    workers = [Process(target=worker, args=(q,)) for _ in range(2)]

    for p in workers:
        p.start()

    for task in range(5):
        q.put(task)

    # 等待业务任务处理完成
    q.join()

    # 每个 worker 发送一个结束哨兵
    for _ in workers:
        q.put(None)

    # 哨兵本身也计入未完成任务，因此再次 join
    q.join()

    for p in workers:
        p.join()

    q.close()
    q.join_thread()
```

`task_done()` 必须与已放入队列的任务一一对应；多调用会抛出
`ValueError`，漏调用则可能让 `join()` 永远等不到计数归零。

## 22.5 `multiprocessing.Pipe`：进程间连接通道

`Pipe()` 创建一对连接对象。默认 `duplex=True`，两个端点都可以收发；设置
`duplex=False` 时创建单向通信端点。

``` python
from multiprocessing import Process, Pipe

def worker(conn):
    message = conn.recv()
    conn.send({"reply": f"收到：{message}"})
    conn.close()

if __name__ == "__main__":
    parent_conn, child_conn = Pipe(duplex=True)

    p = Process(target=worker, args=(child_conn,))
    p.start()

    child_conn.close()         # 父进程不使用子进程端，及时关闭自己的副本
    parent_conn.send("hello")
    print(parent_conn.recv())

    parent_conn.close()
    p.join()
```

常用接口：

-   `send(obj)` / `recv()`：发送和接收可 pickle 的对象。
-   `send_bytes(data)` / `recv_bytes()`：发送和接收字节数据。
-   `poll(timeout)`：检查是否有数据可读。
-   `close()`：关闭连接端点。

Pipe 适合明确的一对一通信，代码直接、抽象较低。**不能简单说
Pipe"不安全"**：两个端点按协议由各自进程使用时完全可以正常工作；如果多个进程同时写同一个连接端点，消息可能发生交错，应自行同步，或改用
Queue。

## 22.6 Queue 与 Pipe 对比

  维度           `multiprocessing.Queue`    `multiprocessing.Pipe`
  -------------- -------------------------- --------------------------------
  抽象           队列                       连接通道
  消息组织       FIFO 队列                  端点之间直接收发
  常见通信模式   多生产者/多消费者          通常一对进程
  并发写入       封装了队列所需的同步机制   多进程共用同一端点时需自行同步
  任务完成确认   `JoinableQueue` 支持       需要自行设计协议
  使用难度       较低                       需要自行管理端点和通信协议
  典型场景       任务分发、工作队列         父子进程命令/响应

性能没有脱离场景的绝对结论。消息大小、生产者/消费者数量、序列化成本、进程调度和缓冲策略都会影响结果，不要仅凭"Pipe
一定更快"来选择。

## 22.7 `asyncio.Queue`：协程间队列

`asyncio.Queue`
用于同一事件循环中的协程任务，不是线程安全队列，也不能直接替代
`multiprocessing.Queue`。

``` python
import asyncio

async def producer(q: asyncio.Queue):
    for item in range(3):
        await q.put(item)
    await q.put(None)

async def consumer(q: asyncio.Queue):
    while True:
        item = await q.get()
        try:
            if item is None:
                return
            print("处理：", item)
        finally:
            q.task_done()

async def main():
    q = asyncio.Queue(maxsize=10)
    async with asyncio.TaskGroup() as tg:
        tg.create_task(producer(q))
        tg.create_task(consumer(q))
    await q.join()

asyncio.run(main())
```

常见接口与线程队列相似，但阻塞操作需要
`await`：`await put()`、`await get()`、`await join()`。`asyncio.Queue`
的 `put_nowait()` / `get_nowait()` 是同步的非阻塞接口。

## 22.8 `subprocess.PIPE` 不等于 `multiprocessing.Pipe`

``` python
import subprocess

result = subprocess.run(
    ["python", "-c", "print('hello')"],
    capture_output=True,
    text=True,
    check=True,
)
print(result.stdout)
```

-   `subprocess.PIPE` 是把外部子进程的标准输入/输出/错误流连接到父进程。
-   `multiprocessing.Pipe` 是 Python 多进程 API 提供的进程间连接对象。
-   两者都借助操作系统的进程通信能力，但 API、数据模型和使用场景不同。

## 22.9 共享内存：与消息队列不同的思路（进阶）

`multiprocessing.shared_memory`
可让多个进程访问同一块内存，减少大块数据在进程间反复序列化和复制的成本。但共享内存只解决"共享数据区域"，不自动解决并发读写一致性；仍需锁、事件或其他协议协调。

**选择建议：**

-   普通任务传递：优先 `multiprocessing.Queue`。
-   明确的一对一通信：考虑 `Pipe`。
-   需要任务完成确认：`JoinableQueue`。
-   大块数值数据共享：评估 `shared_memory`。
-   线程之间传任务：`queue.Queue`。
-   协程之间传任务：`asyncio.Queue`。

------------------------------------------------------------------------

# 23. 常用标准库实用速查

> 目标是知道"遇到什么问题用哪个模块"，不要求把所有标准库都学一遍。高频模块给最小示例，低频模块只保留定位。

## 23.1 时间与日期：`time`、`datetime`

``` python
import time
from datetime import datetime, timedelta, timezone

time.sleep(1)                         # 阻塞当前线程 1 秒
started = time.perf_counter()         # 适合测量耗时
# ...执行任务...
elapsed = time.perf_counter() - started

now = datetime.now()
tomorrow = now + timedelta(days=1)
utc_now = datetime.now(timezone.utc)
```

-   `time.time()`：Unix 时间戳。
-   `time.perf_counter()`：高精度耗时测量。
-   `time.sleep()`：阻塞式休眠；异步代码中通常使用
    `await asyncio.sleep()`。
-   `datetime`：日期时间运算、格式化和解析。
-   涉及跨时区业务时，优先使用带时区信息的 aware
    datetime；不要把本地时间和 UTC 时间混为一谈。

## 23.2 随机与数学：`random`、`math`、`statistics`

``` python
import random
import math
import statistics

random.randint(1, 10)
random.choice(["A", "B", "C"])
math.ceil(3.2)
statistics.mean([1, 2, 3])
```

`random` 适合一般随机抽样，不适合密码、令牌等安全场景；安全随机数使用
`secrets`。

## 23.3 操作系统与路径：`os`、`sys`、`pathlib`

``` python
import os
import sys
from pathlib import Path

home = Path.home()
project = Path.cwd()
python_executable = sys.executable
python_version = sys.version

database_url = os.getenv("DATABASE_URL")
files = list(Path("data").glob("*.json"))
```

-   `os`：环境变量、进程工作目录、权限等操作系统接口。
-   `sys`：解释器参数、模块搜索路径、标准输入输出、退出状态等。
-   `pathlib`：面向对象的路径拼接、遍历、读写。
-   路径拼接优先使用 `Path("a") / "b"`，避免手动拼接斜杠。

## 23.4 文件复制、压缩与临时文件

  模块         常见用途
  ------------ -------------------------------------------
  `shutil`     复制文件/目录、移动、删除目录树、磁盘空间
  `zipfile`    读取和创建 ZIP 压缩包
  `tempfile`   创建临时文件和临时目录

``` python
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory

shutil.copy2("source.txt", "backup.txt")

with TemporaryDirectory() as tmp:
    temp_path = Path(tmp) / "work.txt"
    temp_path.write_text("temporary", encoding="utf-8")
```

## 23.5 配置：`configparser`、`tomllib`

``` python
import configparser
import tomllib

config = configparser.ConfigParser()
config.read("settings.ini", encoding="utf-8")
host = config.get("database", "host", fallback="localhost")

with open("pyproject.toml", "rb") as f:
    pyproject = tomllib.load(f)       # Python 3.11+
```

`configparser` 主要读取 INI；`tomllib` 是 Python 3.11+ 标准库 TOML
解析器，只读。需要写 TOML 时可评估第三方库。

## 23.6 序列化：`json`、`pickle`、`shelve`、`xml`

-   `json`：跨语言交换数据，API 最常见。
-   `pickle`：Python 对象序列化，不可加载不可信数据。
-   `shelve`：基于 pickle
    的简单持久化字典，适合了解，不适合作为生产数据库。
-   `xml`：处理 XML 文档；需关注解析器安全，不要对不可信 XML
    盲目启用外部实体等能力。

## 23.7 哈希与安全随机数：`hashlib`、`secrets`、`uuid`

``` python
import hashlib
import secrets
import uuid

digest = hashlib.sha256(b"hello").hexdigest()
token = secrets.token_urlsafe(32)
request_id = uuid.uuid4()
```

-   哈希摘要不等于加密，不能从 SHA-256 摘要直接还原原文。
-   密码存储应使用专门的密码哈希方案（如
    Argon2、bcrypt、PBKDF2），而不是直接使用普通 SHA-256。
-   `secrets` 用于安全随机令牌。
-   `uuid.uuid4()` 常用于生成随机 UUID。

## 23.8 正则、二进制与增强数据结构

``` python
import re
import struct
from collections import Counter, defaultdict, deque
from heapq import heappush, heappop

emails = re.findall(r"[\w.+-]+@[\w.-]+\.\w+", text)

counts = Counter(["a", "b", "a"])
groups = defaultdict(list)
groups["backend"].append("FastAPI")

queue = deque([1, 2, 3])
queue.append(4)
queue.popleft()

heap = []
heappush(heap, (2, "normal"))
heappush(heap, (1, "urgent"))
print(heappop(heap))

packed = struct.pack("!I", 100)        # 网络字节序的无符号整数
number = struct.unpack("!I", packed)[0]
```

-   `re`：文本模式匹配；复杂正则要注意回溯导致的性能问题。
-   `collections.Counter`：计数；`defaultdict`：带默认值的字典；`deque`：双端队列。
-   `heapq`：堆，常用于优先队列算法。
-   `bisect`：在有序列表中二分查找/插入。
-   `struct`：按指定二进制布局打包和解包。

## 23.9 子进程、日志与其他模块

  模块           定位                         学习优先级
  -------------- ---------------------------- ----------------------
  `subprocess`   启动外部程序、管道、退出码   常用
  `logging`      分级日志、格式化、Handler    必须掌握
  `argparse`     命令行参数解析               常用
  `signal`       进程信号处理                 了解/进阶
  `selectors`    I/O 多路复用的高层封装       理解原理即可
  `shelve`       简单对象持久化               了解
  `xml`          XML 解析与生成               按项目需要
  `gc`           垃圾回收器接口               理解机制，少直接干预
  `inspect`      运行时检查函数、类、签名     进阶调试
  `functools`    `wraps`、缓存、偏函数等      常用
  `itertools`    高效迭代器工具               常用
  `contextlib`   构建上下文管理器             常用

------------------------------------------------------------------------

# 24. 网络工具与 HTTP 客户端选择

## 24.1 Python 网络工具的层次

``` text
业务代码
  │
  ├── 高层 HTTP 客户端
  │     ├── requests（同步）
  │     ├── httpx（同步 + 异步）
  │     └── aiohttp（异步客户端/服务端）
  │
  ├── Web / API 框架
  │     ├── FastAPI / Starlette
  │     └── Django
  │
  ├── 标准库网络接口
  │     ├── urllib（HTTP URL 请求等）
  │     ├── http.server（简单测试服务）
  │     └── socketserver（基础服务器框架）
  │
  └── 底层 socket
        └── TCP / UDP 通信
```

## 24.2 HTTP 客户端如何选

  --------------------------------------------------------------------------------------------------
  库                同步/异步         适合场景                        备注
  ----------------- ----------------- ------------------------------- ------------------------------
  `requests`        同步              简单脚本、同步业务              生态成熟，API 简洁

  `httpx`           同步 + 异步       现代 Python                     支持连接池、超时、异步客户端
                                      后端、需要两种调用模式          

  `aiohttp`         异步              高并发异步                      异步生态成熟
                                      HTTP、需要其客户端/服务端能力   

  `urllib`          同步标准库        不想安装第三方依赖的简单请求    API 相对底层
  --------------------------------------------------------------------------------------------------

异步示例：

``` python
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get("https://example.com")
        response.raise_for_status()
        print(response.text[:100])

asyncio.run(main())
```

工程建议：

-   同步脚本可选 `requests` 或 `httpx.Client`。
-   异步 FastAPI 服务中，调用外部 HTTP API 可选 `httpx.AsyncClient` 或
    `aiohttp`。
-   不要在 `async def` 中直接调用同步阻塞请求（例如
    `requests.get()`），否则会阻塞事件循环；确需复用同步函数时可用
    `asyncio.to_thread()`，但优先选真正的异步客户端。
-   使用客户端连接池，并合理设置超时、重试、连接数限制；不要每次请求都无条件创建一个新客户端。

## 24.3 `socketserver`、`http.server` 与 `Paramiko`

-   `socketserver`：标准库的基础服务器框架，适合学习同步/线程/进程服务器结构。
-   `http.server`：适合本地临时测试，不建议直接作为公网生产 Web 服务。
-   `Paramiko`：第三方 SSHv2 协议实现，可用于 SSH 客户端、SFTP
    等自动化场景；属于项目按需依赖，不是 Python 标准库。

------------------------------------------------------------------------

# 25. 补充概念与内容取舍

## 25.1 递归

递归函数会调用自身，必须有明确的终止条件：

``` python
def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("n 必须非负")
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

Python
不保证尾递归优化，递归层数过深会触发递归深度限制。处理深层数据或大规模任务时，优先考虑显式栈/循环，避免简单地调高递归限制。

## 25.2 装饰器与函数元数据

装饰器本质上是接收函数并返回函数（或其他可调用对象）的高阶函数。装饰器包装原函数时，通常使用
`functools.wraps` 保留元数据：

``` python
from functools import wraps

def log_call(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("调用：", func.__name__)
        return func(*args, **kwargs)
    return wrapper
```

`@decorator`
是重新绑定函数名的语法形式；带参数装饰器则多一层函数，用于接收配置参数。不要把装饰器简单理解成"只能接收一个参数的闭包"。

## 25.3 模块导入机制：掌握 Python 自身即可

-   导入模块时，解释器会先检查 `sys.modules` 缓存。
-   未缓存时，按 `sys.path`
    等导入规则查找模块，再执行模块顶层代码并缓存模块对象。
-   再次导入通常复用缓存，不会重新执行模块顶层代码。
-   `import package.module`、`from package import name`
    的绑定结果不同；不要把它们理解成"复制源文件内容"。
-   Node.js CommonJS/ES Module 对比可帮助有 JS
    背景的开发者理解模块系统，但不是 Python
    学习必需内容，因此不展开成独立大章。

## 25.4 `gevent` 与协程生态

`gevent` 是第三方协作式并发库，使用 greenlet
等机制实现协作式切换，部分场景会通过 monkey patch 改变标准库阻塞 I/O
的行为。它与 `asyncio` 的编程模型不同；新项目通常优先考虑标准库
`asyncio` 及其兼容生态，只有在维护已有 gevent 项目或有明确需求时再深入。

## 25.5 本次融合的压缩规则

  -------------------------------------------------------------------------------------
  内容                          处理方式                       原因
  ----------------------------- ------------------------------ ------------------------
  Queue、Pipe、JoinableQueue    恢复完整概念、对比与核心示例   并发基础知识，不应删除

  线程同步原语                  保留用途表 + 典型使用方式      避免每个原语重复讲解

  标准库高频模块                保留最小代码示例               能直接查阅和使用

  低频标准库（shelve、xml 等）  压缩为用途与注意事项           知道存在即可，按需深入

  网络客户端生态                保留选择表与异步示例           对后端开发有实际价值

  Node.js 模块系统对比          压缩为导入机制说明             避免偏离 Python 主线

  gevent、Paramiko、selectors   标记为了解/按需                不作为 Python 基础必修

  重复的类、闭包、迭代器概念    合并到各自主章节               避免同一知识点多处重复
  -------------------------------------------------------------------------------------

## 25.6 对原始笔记中几处不严谨表述的统一修正

1.  **Queue 不是简单固定的 `Pipe + Lock`。** `multiprocessing.Queue`
    的内部实现还涉及缓冲、后台 feeder
    thread、序列化、同步原语等；实现细节不应当当成跨版本 API 契约。
2.  **Pipe 不是"不安全"。**
    正常的一对一端点通信可以安全使用；多个进程同时操作同一个连接端点时，需要自行同步。
3.  **`empty()` / `qsize()` 不能用于并发正确性判断。**
    它们在多进程环境下可能不可靠，不应采用"先判断非空，再
    get"的竞态写法。
4.  **GIL 不是 Python 语言规范。** 它是传统 CPython
    构建的实现机制；不能用 GIL 代替业务锁。
5.  **`async def` 不代表函数内部所有操作都是非阻塞。** 同步
    I/O、`time.sleep()`、CPU 密集代码仍可能阻塞事件循环。
6.  **`asyncio.Queue` 不是线程安全队列。** 不要跨线程随意调用它的常规
    API。
7.  **`subprocess.PIPE` 与 `multiprocessing.Pipe` 不同。**
    前者重定向子进程标准流，后者是多进程连接对象。
8.  **pickle 不可信数据反序列化有代码执行风险。** 不应从不可信来源加载
    pickle。
9.  **Python 字符串是 Unicode 文本，bytes 是字节序列。**
    编码/解码是两者之间的转换，不是字符串本身的属性。
10. **"Pipe 一定比 Queue 快"不是可靠结论。**
    性能需要按消息大小、并发度和负载测量。

------------------------------------------------------------------------

## 最终检查清单

-   [x] 四份原始笔记作为整合依据，保留主要有效知识点。
-   [x]
    合并重复的变量、函数、类、闭包、装饰器、迭代器、文件、异常等内容。
-   [x] 恢复 `multiprocessing.Queue`、`JoinableQueue`、`Pipe`
    和生产者-消费者模型。
-   [x] 区分线程队列、进程队列、协程队列和 subprocess 标准流管道。
-   [x] 补充队列任务完成确认、结束哨兵和常见并发陷阱。
-   [x] 补充标准库常用模块的用途与最小示例。
-   [x] 补充 HTTP 客户端和网络模块的选择依据。
-   [x] 将低频内容压缩为速查表或"了解/按需"内容。
-   [x] 修正原笔记中关于 Pipe 安全性、Queue
    内部实现、GIL、异步阻塞等不严谨说法。
