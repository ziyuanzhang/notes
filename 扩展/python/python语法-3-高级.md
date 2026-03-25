# python 高级 [原文地址](https://www.bilibili.com/video/BV1Sp4y1U7Jr)

## 运行python3步骤

- 1、python解释器启动--解释器从硬盘读到内存（相当于启动文本编辑器）；
- 2、python解释器把a.py的内容当做普通的文本内容由硬盘读入内存(本质是解释器向操作系统发起系统调用，让操作系统控制硬件完成读取)
- 3、解释器解释执行刚刚读入内存的python代码，开始识别python语法

## 编译型or解释型、强类型or弱类型、静态型or动态型

- 强类型or弱类型
  1. 强类型：数据类型不可以被忽略的语言，即变量的数据类型一旦被定义，那就不会再改变，除非进行强转。
  2. 弱类型：数据类型可以被忽略的语言，数据类型可以被忽略，数据类型由数据内容决定。（例：linux中的shell语言）

- 静态型or动态型
  1. 静态型：在定义阶段指定数据类型，在运行时传其他类型报错；需要事先给变量进行数据类型定义
  2. 动态型：在定义阶段只定义变量，不定义类型；在运行时（即在变量赋值时），才确定变量的数据类型；

## 垃圾回收机制：回收“没有任何变量名的“值

## 变量

```python
    x=10
    y=x
    z=x
  # 给10绑定3个变量名
    del x # 解除变量名x与值10的绑定关系
    del y # 解除变量名y与值10的绑定关系
  # 此时 z=10
    z=123
  # 此时 z=123, 值10没有绑定关系了, 会被回收
```

- “变量值” 的三大特性：
  1. id：反应的是变量在内存中的唯一编号，内存地址不同id肯定不同（不是内存地址，是根据内存地址计算的编号）
  2. type：变量值的类型
  3. value：变量值

  ```python
     x='Info Tony:18'
     print(id(x), type(x), x) # ==> 4376607152,<class 'str'>,'Info Tony:18'
  ```

- is 与 ==
  `x="3.1415926"`
  `y="3.1415926"`
  1. is: 比较左右两个值“身份id”是否相等;
  2. ==: 比较左右两个值“他们的值”是否相等;
     **注：** 值相等，id可能不同，即两块不同的内存空间里可以存相同的值

- Python 中比较相等
  1. is: 判断身份
  2. ==: 判断值

- java 中比较
  1. equals: 判断值
  2. ==: 判断引用

## 常量（约定）

在Python中没有一个专门的语法定义常量，约定俗成是用全部大写的变量名表示常量。

## 运算符

1. 逻辑运算符：not、and、or；优先级：not > and > or
2. 成员运算符：in、not in;
3. 身份运算符：is, is not；

- 0、None、空（空字符串、空列表、空字典）==》代表的布尔值为False，其余为True;
- 短路运算：偷懒原则，偷懒到哪个位置，就把当前位置的值返回；【用在条件判断】
  `if 10>3 and 10 and None and 10 or 10>3 and 1===1`

## 解压赋值

- `x,y,z,*_ = arr=[11,22,33,44,55,66]`

  `_`: 占位符（变量名），永远不会被用

- `x,y,z =dic={'a':1,'b':2,'c':3}`
  print(x,y,z) ==> a,b,z 解压出来的是key

## 可变类型 与 不可变类型

- 可变类型：值变了，id不变，证明改的是原值，证明原值是可以被改变的；
  list、dict
- 不可变类型：值变了，id也变了，证明是产生新的值，原值没有改变，证明原值是不可被修改的；
  bool、int、float、str

## 浅copy与深copy

列表变量名（存列表内存地址）-->列表（存各个元素的内存地址）-->各个元素（值）或子列表的内存地址（继续递归）

✅ 浅拷贝：复制最外层容器，新容器中的元素仍指向原对象;  
✅ 深拷贝：递归创建所有子对象，完全独立；

- 默认都是浅copy (包括：切片)

## 可迭代对象

列表、字典、字符串、元组、集合、range

for 循环：在循环取值（遍历取值）比while 循环更简洁；

类型转换：凡是能被for循环遍历的类型都可以当作参数传给list()转成列表；

## 数据类型

- age=10 --> age=int(10) ：涉及申请内存空间
- str字符串：通过下标“仅可读（不可写）”;
- list数组：通过下标“可读可写”；用超出长度的下标操作-->报错；
  1. l=[1,2.2,'a'] --> l=list([1,2.2,'a']);
  2. js 的数组：可读可写；

- 元组：最外层的内存地址不能动，里面的子对象可以修改（类似js的const指针不能改）；
- 集合：集合内元素必须是不可变类型；
  1. s={1,2} --> s=set({1,2});
  2. 空集合: s=set()
  3. print(set('hello world')) ==>{'h','e','l','o','w','r',d'}
  4. 2个集合关系运算：交集&、并集|、差集-、对称差集^、子集<、超集>

## 字符编码

- 一、 字符编码基础
  1. 数学基础：`2**7=128；2**8=256；2**9=512`
  2. ASCII 码表：
     - 涵盖范围 0-127，是世界上首个字符编码表。
     - 实际只需要 7 位（Bit）二进制即可表示完整，但计算机中通常分配 1 个字节（8位）来存储，多出的 1 位（最高位）主要用于后续扩展或奇偶校验。
     - “向下兼容性”：后续所有主流的字符编码表（如 GBK、UTF-8 等）都完全兼容 ASCII 码（即全面支持英文和基础符号）。

- 二、输入字符到显示的完整流程（标准版）
  1. 键盘输入阶段：你按键盘 其实是：“s h a n g” 这些字符属于 ASCII，所以键盘发送的是：ASCII 码（字母）；
  2. 输入法阶段（字符生成）：输入法（如 Microsoft Pinyin）负责：“ASCII 拼音 → 中文字符”（例：shang → 上）；
     - 这里发生的是：字符层面的转换；
     - ❗此时还没有存储，只是生成了一个字符。

  3. 字符在计算机中的统一表示（Unicode）：计算机内部必须统一表示所有字符，于是使用：👉 Unicode 字符集；
     - Unicode 的作用：“字符 → 编号（码点）”（例：上 → U+4E0A）；
     - Unicode 只是一个 “抽象编号体系”，并不决定如何存储。

  4. 编码阶段（真正进入内存）：为了把 Unicode 存入内存，必须使用编码方式，例：UTF-8、UTF-16、UTF-32
     - 上（U+4E0A）→ UTF-8 → E4 B8 8A（二进制）
     - 字符 → Unicode → UTF-8 → 写入内存
     - ❗内存本身没有编码；编码是程序解释这些 0 和 1 的方式。
     - ❗编码属于程序，不属于内存

  5. 程序处理阶段：软件（如文本编辑器）在内存中处理数据：复制、粘贴、搜索、计算；这些操作通常基于 Unicode 逻辑。
  6. 显示到屏幕：内存 UTF-8 → 解码 → Unicode → 字形 → 显示；
     - 解码：软件根据编码（如 UTF-8）把二进制转换为 Unicode。
     - 字体查找：字体（如 Microsoft YaHei）负责：“Unicode → 字形（Glyph）”
     - 渲染：操作系统将字形绘制到屏幕

  7. 保存到文件（硬盘）：当你按“Ctrl + S”，软件会“Unicode → 指定编码 → 写入文件”（例：UTF-8、UTF-8、UTF-16）
     - ❗如果保存编码不同，可能产生乱码（存储时，必须使用指定的编码，否则，数据会乱码）。

  8. 文件读取：当再次打开文件“文件 → 按指定编码读取 → Unicode → 内存”
     - ❗如果编码选择错误：乱码

  ❗乱码的本质：乱码只有一个原因：👉 编码和解码不一致
  ❗字符集不支持：例：保存日文、韩文选择GBK格式，会出现 直接报错、占位符替换 等数据丢失情况；

- 👉 输入到显示的核心链路： 键盘 → ASCII → 输入法（字符） → Unicode → 编码（UTF-8） → 内存 → 解码 → Unicode → 字体 → 屏幕
- 文件流程：
  1. 保存：内存中的 Unicode 字符 → 编码（UTF-8 / GBK 等） → 生成二进制字节 → 写入硬盘文件
  2. 读取：从硬盘读取字节流 → 加载到内存 → 解码（UTF-8 / GBK 等） → 得到 Unicode 字符

- Python 解释器读取文件：
  1. 启动 Python 解释器【类似：文本编辑器】；
     - 加载 Python 程序 → 内存 → 开始执行；
  2. Python 打开 .py 文件（字节模式）【类似：加载文件】；
     - Python 首先做的事情是：以“二进制模式”读取文件，👉 此时 Python 不知道文件是什么编码。它只拿到：一串字节（bytes）例：E4 B8 8A；
  3. 检测编码声明（关键）：
     - Python 会检查文件前两行，寻找：` # coding: xxx # -*- coding: xxx -*-`
     - 👉 这一步是在“字节层”完成的。
     - 👉 Python 还没有真正解析代码。
     - 原因：Python 必须先知道编码，才能正确解码。
     - 为什么只扫描前两行？因为历史原因（兼容 Python2）：编码声明通常在第一或第二行。

  4. 确定编码:
  5. 解码源码为 Unicode: 字节 → 解码 → Unicode
  6. 词法分析（Lexical Analysis）: 例：print('上')会被分解为print、(、'上'、)
  7. 语法分析（Parsing）:生成 AST（抽象语法树）
  8. 编译为字节码: 例：字节码为`LOAD_CONST CALL_FUNCTION`
  9. 执行：Python 虚拟机执行字节码

  👉 Python 解释器先以字节读取源码，检测编码声明后再解码为 Unicode，然后进行词法和语法分析，最终编译为字节码执行。

```python
# coding=utf-8  #既是注释，又是指令；是告诉解释器，这个文件使用utf-8编码 (不用默认编码)
print('上')
```

## 文件

文件：是“操作系统”提供给“用户程序”访问硬盘的抽象接口（虚拟概念）
文件对象：又称文件句柄；

应用程序 → 操作系统 → 文件系统 → 硬盘

###

- 控制内容模式：
  1. t:文本模式（默认）:
     - 读写都是以“字符串（unicode）”为单位；
     - 只针对文本文件
     - 必须指定字符编码（即必须指定encoding参数）

  2. b:二进制模式
     - 读写都是以“字节（bytes）”为单位；
     - 可以针对所有文件
     - 一定不能指定字符编码（即不能指定encoding参数）

- 读写模式：
  1. r:只读
  2. w:只写（清空）
  3. a:只追加
  4. +:可读写；r+、w+、a+ （受r、w、a约束）
     - r+: 指针在开头，覆盖替换；
     - w+: 清空，再写；指针在末尾；
     - a+: 追加，指针在末尾
  5. x:只写模式,不可读；不存在则创建，存在则报错（了解）

### x=10 与open()

- x=10 占应用程序资源：
  1. x 是变量名，属于程序运行环境（如栈帧 / 作用域）
  2. 10 是对象，存在堆中
- open() 同时占用：
  1. Python 内存资源
  2. 操作系统文件资源（fd）

```python

  # r模式
  f=open('test.txt', mode='rt', encoding='utf-8') # 指针在开头；f 叫文件对象，又称文件句柄；
  res =f.read(4) # 4是字符，不是字节
  res = f.read() # 一次读完所有，有可能撑爆内存❗；指针在末尾 ；
  # read（只是单纯的将硬盘的二进制读到内存中，不做字符转换，转换是python做的）
  res = f.read() # 没关闭，从指针位置开始读，指针在末尾，读不到内容；
  res = f.readline() # 一次读一行，指针在末尾
  res = f.readlines() # 一次读所有行，指针在末尾❗
  for line in f: # 每次读一行，防止内存撑爆，防止电脑卡顿
    print(line)

  f.close() # 释放操作系统资源（不写，操作系统会检测：1、在进程结束时回收，2、可能长时间不用后回收；导致：1、文件描述符耗尽，2、数据未写入磁盘，3、文件锁不释放）
  f.read() # 已经close()了，再读会报错；
  del f # 释放程序资源(可以不写)

  # w 模式
  with open('file.txt', 'wt', encoding='utf-8') as f: # 先清空文件内容，指针停留在开头
     f.write('hello world') # 写入, 指针停在末尾
     f.write('hello world') # 追加, 从指针位置开始写; 没有立马写到硬盘中，攒一波再写或者关闭了再写
     f.writelines(['hello world', 'hello world'])
     f.flush() # 刷新缓冲区（立马存到硬盘中）
     f.close() # 释放操作系统资源（存硬盘中）

  # a 模式
  with open('file.txt', 'at', encoding='utf-8') as f: # 追加, 指针停留在末尾
     # f.read() # 报错
     f.write('hello world')
     f.write('hello world')

  # b 内容模式
  with open('file.txt', 'ab') as f:
    res = f.read() # utf-8的二进制
    print(type(res),res) # <class 'bytes'> ，b'\xe5\x93...' 【python解释器--默认给转化为十六进制了】

    print(res.decode('utf-8'))

  with open('file.txt', 'wb') as f:
    f.write('你好'.encode('utf-8'))
    f.writelines(['你好'.encode('utf-8'), '你好'.encode('utf-8')]) # 其他语言转码，
    # '你好'.encode('utf-8') === bytes('你好', encoding='utf-8')
    f.writelines([b'hallo world',b'hello world']) # 英文直接加b就可以

  with open('test.jpg', 'rb') as f:
    while True:
      res = f.read(1024) # 1024是字节，不是字符
      if len(res) == 0: # 读完
        break

      print(res)

  with open('aa.txt', 'rb','utf-8') as f: # 不常用
    # f.seek(n,模式)：
    f.seek(9,0) # 0 参照物是 文件开头位置；9 表示移动的字节数
    f.seek(9,1) # 1 参照物是 当前指针的位置；9 表示移动的字节数
    f.seek(-9,2) # 2 参照物是 文件末尾位置；-9 表示向前移动的字节数
    print(f.tel()) # 返回当前指针位置
```

- mode: 读写模式,内容模式；
- encoding: 文件解码格式

- close() 的核心作用：
  1. 释放 OS 资源
  2. 刷新缓冲区
  3. 防止资源泄露

### with

申请资源 → 使用 → 必须释放；

- with: 自动管理资源（自动调用清理代码）； with 的本质就是：确保操作系统资源一定被回收
- 核心作用：
  1. 自动释放资源
  2. 自动处理异常
  3. 防止资源泄露
  4. 让代码更安全

## 命名空间（名称空间 namespaces ）与 作用域（scope）

- 🔥 命名空间：是“变量存在哪里”
  1. 本质是 dict
  2. 存储变量

- 🔥 作用域：是“变量在哪里可以访问”
  1. 访问规则
  2. LEGB 查找链

`import ujson as json`: 命名空间没变（还是ujson），只是起了个别名，查找时还是找ujson;
后续其他文件 用json还需要`import json`【涉及名称空间、模块缓存】

### 命名空间: 是名字到对象的映射。 本质就是：👉 一个 dict（字典）

Python 本质：
🔥 一切变量都存储在命名空间（dict）中；
🔥 命名空间之间形成查找链（LEGB）；
而不是：❌ 栈变量模型。

- 完整对比表（核心）

  | 命名空间 | 何时创建   | 存什么             |
  | -------- | ---------- | ------------------ |
  | 全局     | 模块加载   | 模块变量、函数、类 |
  | 局部     | 函数调用   | 参数、局部变量     |
  | 类       | 类定义     | 类属性、方法       |
  | 内建     | 解释器启动 | print、int 等      |

- 在 Python 中：
  1. 全局命名空间 → globals()
  2. 局部命名空间 → locals()
  3. 类命名空间
  4. 内建命名空间 → `__builtins__` 或`import builtins`模块； 本质上：👉 一个 dict（或者模块包装的 dict）。

  ```python
  x = 100

  class A:
      y = 200

      def f(self):
          z = 300
          print(locals())
  ```

  结构：

  ```code
   builtins
     ↓
   global: x, A
     ↓
   class: y, f
     ↓
   local: z
  ```

- 1️⃣ 局部命名空间（Local）-- 特点：
  1. 每次调用时创建新的
  2. 调用结束销毁
  3. 存储函数参数和局部变量

- 2️⃣ 全局命名空间（Global）：👉 Python 模块加载时创建。
- 3️⃣ 类命名空间（Class）：👉 类定义时创建。
- 4️⃣ 内建命名空间是如何创建的？

  Python 启动时：
  1. 初始化解释器
  2. 加载核心 C 实现
  3. 创建 built-in 模块
  4. 填充基础对象
  5. 注入到每个模块

  👉 所以每个 Python 文件：`globals()["__builtins__"]`都会自动存在。
  - 内建命名空间包含 5 大类
    1. 内建函数
    2. 内建类型
    3. 内建异常
    4. 内建常量
    5. 语言底层工具

    本质：一个 Python 解释器初始化时创建的 dict；是变量查找的最后一层。

- 栈里放的是：C 语言层的“函数调用栈帧”（frame）

- 每次执行函数：创建一个 frame object，frame 里面有：
  1. f_locals → 指向局部命名空间 dict
  2. f_globals → 指向全局命名空间 dict
  3. f_builtins → 指向内建命名空间 dict

  ⚠️ 注意：frame 对象本身也在堆上。

- 真正的“栈”只是：
  1. C 语言调用栈
  2. 存放指针、返回地址等

- 在 Python 中：
  1. 变量名存在命名空间 dict 中
  2. 命名空间 dict 在堆
  3. 对象在堆
  4. frame 在堆
  5. 栈只是解释器运行机制

- `x=10`发生：

  ```code
  堆：
      10 (int对象)
      globals dict  { "x": 地址 }

  栈：
      当前frame指针
      frame里持有对 globals dict 的引用
  ```

  关系：

  ```code
    frame
      ↓
    f_globals  →  dict对象 (堆)
                       ↓
                    "x" → int对象(堆)
  ```

- 函数局部变量

  ```python
    def f():
      a = 100
  ```

  执行时：

  ```code
  堆：
    100 (int对象)
    locals dict { "a": 地址 }
    frame对象

  栈：
      C函数调用栈帧
  ```

### 作用域: 👉 代码中访问变量的区域。也就是说：哪些命名空间对当前代码可见

- 当 Python 解析代码时，查找变量顺序是(LEGB-链 规则) 或者说 Python 的作用域规则（LEGB）：
  1. Local（局部）
  2. Enclosing（闭包）
  3. Global（全局）
  4. Built-in（内建）

  👉 内建命名空间是最后的兜底查找层。

- 🔥
  1. Python 是静态作用域（Lexical scope）：在函数定义时就确定。
  2. 作用域不是运行时动态变化
  3. 局部变量优先
  4. Python 没有块级作用域

### global 与 nonlocal

- global: 让变量来自全局

  ```python
    x = 10
    y = 30
    l = [11,22]
    def f():
        global x # 主要用在：不可变类型
        x = 20  # 全局的x
        y = 35  # 新造了y, 和全局的没关系
        l.append(33) # 改变全局的l
  ```

- nonlocal: 用于闭包

  ```python
  def outer():
      x = 10
      l = []
      def inner():
          nonlocal x # 主要用在：不可变类型
          x = 20  # x -> 为outer内的x

          l.append(33) # l --> 为outer内的l
  ```

## 函数

- 定义函数时：

1. 申请内存空间保存函数体代码
2. 将上述内存地址绑定到函数名
3. 定义函数不会执行函数体代码，但会检测函数体语法

- 调用阶段:

1. 通过函数名找到函数内存地址
2. 然后加括号就是在 触发函数体代码的执行，❗产生名称空间（命名空间）

- 形参与实参：

1. 在调用阶段，实参会绑定给形参
2. 这种绑定关系只能在函数体内使用
3. 实参与形参的绑定关系在函数调用时生效，函数调用结束后解除绑定关系；
4. 默认参数的值是在定义阶段被赋值的，❗赋予的是内存地址；

`*`可以用在实参中，实参中带`*`,`*`后面的值会被打散成位置参数；

```python
def func(x,y,x):
print(x,y,z)

func(*[1,2,3]) # 1,2,3
func(*{'x':1,'y':2,'z':3}) # func('x','y','z')
func(**{'x':1,'y':2,'z':3}) # func(x=1,y=2,z=3)

# ==================================================
def index(x,y,z):
print(x,y,z)

def wrapper(*args, **kwargs): #形参 #arg=(1,) kwargs={'y':2,'z':3}
index(*args, **kwargs) # 实参
# index(*(1,),**{'y':2,'z':3})
# index(1,z=3,y=2)

wrapper(1,z=3,y=2)
```

- 命名关键字参数（了解）

  ```python
  def func(x,y,*,a,b): #其中，a和b是命名关键字参数，y和z是位置参数
    print(x,y,a,b)

  func(1,2,b=4,a=3)
  ```

### 👉 Python 在编译函数时就确定变量作用域，而不是运行时

```python
def func():
    print(x) # 无法访问未赋值的局部变量'x'
    x=2

x=111
func()

# ===== 上面报错、下面不报错 ====================
def func(): # 第一步：定义函数：Python 只是创建函数对象，不执行函数体。
    print(x)

x=111 # 第二步：执行： 👉 全局命名空间已经有：x → 111
func() # 第三步：调用函数
```

- 编译阶段：Python 在函数定义时（编译阶段）扫描函数体：发现`x = 2`，于是 Python 认为：👉 x 是局部变量。
- 执行阶段：但执行时：执行到：`print(x)`局部变量 x 还没有赋值。所以报错：UnboundLocalError

⚠️ 注意：不是找不到变量; 是找到局部变量，但还没赋值。
👉 全局变量在函数执行前已经赋值了，而局部变量是在函数执行过程中才赋值。

### 和 JavaScript 的 var/let 作用域机制对比

#### JavaScript 的 var 机制

```js
function f() {
  console.log(x); // 输出 undefined
  var x = 2;
}
f();
```

🔥 JS 的 var 有“变量提升”

- JS 在函数执行前，会：
  1. 创建执行上下文
  2. 扫描 var 声明
  3. 把变量加入作用域
  4. 初始值设为 undefined

等价于：

```js
function f() {
  var x; // 提升
  console.log(x);
  x = 2;
}
```

所以：👉 访问时已经存在; 只是值是 undefined

#### JavaScript 的 let 机制

```js
function f() {
  console.log(x); // 报错：ReferenceError
  let x = 2;
}
f();
```

因为：👉 let 存在 TDZ（暂时性死区）

- 执行流程：
  1. 变量已被创建
  2. 但在声明前不可访问
  3. 访问就报错

## 装饰器

装饰器：定义一个函数，该函数是用来为其他函数添加额外的功能

在“不修改原函数及调用方式”的情况下，给它添加新功能；

- 开放封闭原则：
  1. 开放：指对扩展功能是开放的
  2. 封闭：指对修改源代码是封闭的

```python
import time
from functools import wraps # 将原函数的属性赋值给wrapper函数

def index(x,y,z):
  time.sleep(3)
  print(x,y,z)

def home(x):
  time.sleep(3)
  print(x)

def outter(func):
  # func:被装饰对象的内存地址
  @wraps(func) # 将原函数的属性赋值给wrapper函数
  def wrapper(*args, **kwargs):
    start = time.time()
    res = func(*args, **kwargs)
    stop = time.time()
    print(f'耗时：{stop-start}')
    return res

  # wrapper.__name__ = func.__name__
  # wrapper.__doc__ = func.__doc__
  # ...
  return wrapper

home = outter(home) # 偷梁换柱: 变量home: 指向wrapper函数的内存地址
res = home("hello")
print("返回值",res) # hello

# == 语法糖 ================================================
# 由于语法糖限制：outter函数只能有一个参数（只用来接受被装饰对象的内存地址）；
@outter  # index = outter(index)
def index(x,y,z):
  time.sleep(3)
  print(x,y,z)
  return "返回值-index"

res = index(1,2,3)
print("返回值",res)
# == 语法糖解析、装饰器函数属性 ===============================================
@print('hello')  # ==> None=print('hello')(index) ==> index=None(index)
def index(x,y,z):
  """ 函数文档 """
  pass

# index.__name__ = 原函数.__name__
# index.__doc__ = 原函数.__doc__
# ...

print(index.__name__)
print(index.__doc__)
print(help(index))
# ==有参数装饰器================================
def auth(type):
  def deco(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
      if type == 'admin':
        print("管理员权限")
        return func(*args, **kwargs)
      else type == 'user':
        print("普通用户权限")
        return func(*args, **kwargs)
    return wrapper
  return deco

  @auth('admin') # deco=@auth('admin') ==> index=deco(index) ==》index=wrapper
  def index(x,y,z):
    print(x,y,z)
    return "返回值-index"

```

- 多个装饰器
  1. 查找阶段：由近及远
  2. 执行阶段：从远端开始，U型（或者洋葱模型）

```python
  # deco1
  def deco1(func1): # func1 =wrapper2的内存地址
    def wrapper1(*args, **kwargs):
      print("正在运行==》deco1.wrapper1 ")
      res1 = func1(*args, **kwargs)
      return res1
    return wrapper1

  # deco2
  def deco2(func2): #func2 =wrapper3的内存地址
    def wrapper2(*args, **kwargs):
      print("正在运行==》deco2.wrapper2 ")
      res2 = func2(*args, **kwargs)
      return res2
    return wrapper2

  # deco3
  def deco3(x):
    def outter3(func3): ##func3 =被装饰对象index函数的内存地址
      def wrapper3(*args, **kwargs):
        print("正在运行==》deco3.wrapper3 ")
        res3 = func3(*args, **kwargs)
        return res3
      return wrapper3
    return outter3

  # 加载顺序: 由近到远
  @deco1 #index=deco1(wrapper2的内存地址)  ==>index=wrapper1的内存地址
  @deco2 #index=deco2(wrapper3的内存地址)  ==>index=wrapper2的内存地址
  @deco3(111) # ==》@outter3 ==> index=outter3(index) ==>index=wrapper3的内存地址
  def index(x):
    print("正在运行==》test ")

  # 执行顺序: 从远端开始，U型（或者洋葱模型）
```

## 迭代器 与 生成器

### 迭代器

迭代器：是迭代取值的工具，迭代是一个重复的过程，每次重复都是基于上一次的结果而继续的（单纯的重复不是迭代）；

```python
  d={"a":1,"b":2}
  d_iter = d.__iter__()

  print(d_iter.__next__()) #==> 'a'
  print(d_iter.__next__()) #==> 'b'
  print(d_iter.__next__()) # 抛出异常
```

- 迭代器对象：不依赖索引取值
- 可迭代对象（可以转换成迭代器的对象）：内置有`__iter__`方法的的对象;
  1. `可迭代对象.__iter__()`: 得到迭代器对象

- 迭代器对象： 内置有`__next__`方法和`__iter__`方法的对象；
  1. `迭代器对象.__next__()`: 返回迭代器的下一个值
  2. `迭代器对象.__iter__()`: 返回迭代器对象本身（调了跟没调一样）

  ```python
    dic={"a":1,"b":2}
    dic_iterator = dic.__iter__()
    print(dic_iterator is dic_iterator.__iter__().__iter__().__iter__()) # ==> True
  ```

  python为什么给迭代器对象内置`__iter__`方法: 为了让for循环的工作原理统一起来；

- ❗for 循环工作原理：

  ```python
  for k in 可迭代对象: # ==> 可迭代对象.__iter__() ==> 迭代器对象 ==> next(迭代器对象)
    print(k)
  ```

  1. `d.__iter__()`得到一个迭代器对象；
  2. `迭代器对象.__next__()`拿到一个返回值，然后将该值赋值给K；
  3. 循环往复步骤2，直到抛出StopIteration异常,for循环会捕捉异常然后结束循环；

### 生成器: 自定义的迭代器

在函数内一旦存在yield关键字，调用函数并不会执行函数体代码，会返回一个生成器对象，生成器即自定义的迭代器

`x = yield 返回值`

```python
  def func():
    print("hello")
    yield 1
    print("world")
    yield 2
    print("python")
    yield 3
    print("end")

  g=func()
  # print(func) # <function func at 0x7f7c7c0c0c50>
  # 生成迭代器
  # print(g) # <generator object func at 0x7f7c7c0c0c50>
  # print(g.__iter__()) # <generator object func at 0x7f7c7c0c0c50>

  # len('aaa')  # 'aaa'.__len__()
  # next(g) # g.__next__()
  res1= g.__next__() # hello
  print(res1) # 1
  res2= g.__next__() # world
  print(res2) # 2
  res3= g.__next__() # python
  print(res3) # 3
  res4= g.__next__() # end
  print(res4) # 报错：StopIteration
```

```python
def dog(name):
  print(f'{name}  is coming')
  while True:
    x= yield # x 拿到的是 yield 接收到的值
    print(f'{name}  is eating {x}')

g= dog('wangcai')
g.send(None) # 等同于next(g)

g.send('bone')
g.send('fish')
g.send('meat')
g.close()
g.send('egg') # 报错：StopIteration
```

## 三元表达式 与 生成式(列表、字典、集合、生成器)

- 语法格式：条件成立时的值 if 条件 else 条件不成立时的值
- 列表生成式：arr=[表达式 for item in 可迭代对象 if 条件]
  `arr = [name for name in names if name[0] == 'w']`

- 字典生成式
  `items = [('name', 'wc'), ('age', 18), ('sex', 'male')];
`dicts = {key: value for key, value in items if key != 'sex'}`

- 集合生成式
  `keys = {name for name in names if name[0] == 'w'}`

- 生成器表达式：
  `gen = (i for i in range(10) if i % 2 == 0)`

## 递归 (python 没有尾递归)

```python
  import sys;
  sys.getrecursionlimit() # ==> 1000 获取递归深度
  sys.setrecursionlimit(2000) # 设置递归深度
```

- 递归的2个阶段：递推、回归

回溯：指的是一种通过“试错”来寻找解的方法；

## 面向过程思想

过程是“流水线”，用“分步骤”来解决问题；

- 面相过程思想：
  - 优点：复杂问题流程化，进而简单化
  - 缺点：扩展性非常差

爬虫（Scrapy框架）：1、目标站点发请求，拿数据；3、数据清洗；4、存数据库
数据分析：

- 匿名函数：fn=lambda 参数：函数体
  `res = max(obj,key=lambda k:obj[k])`
  `res = map(lambda x:x**2,range(10));res.__iter__();`
  `res = filter(lambda x:x%2==0,range(10));res.__iter__();`
  `res = reduce(lambda x,y:x+y,range(10),0);res.__iter__();`

## 模块： 一些列功能的集合体

1. 内置模块：python解释提供好的，C、C++语言便编写的；
2. 第三方模块：
3. 自定义模块：python、C、C++写的

- 首次导入 与 之后的导入
  - “首次导入”模块会发生什么？
    1. 执行foo.py 文件;
    2. 产生foo.py的命名空间，将foo.py运行过程产生的名称丢到foo.py的命名空间中；
    3. 当前文件中产生一个foo名字，该名字指向2中产生的命名空间；

  - 之后的导入，都是直接引用“首次导入”产生的命名空间（不会重复执行）；

- 起别名: `import foo as f` 把foo的内存地址给了f;

- `__name__`
  1. 当文件被运行时:`__name__`的值为`__main__`，
  2. 当文件被作为模块导入时：`__name__`的值为模块名；

```python
# ==foo.py===============================================
x=1
def get():
  print(x)

def change():
  globals x
  x=0

__all__ = ['x','get','change'] # 控制*代表的名字有哪些
# from foo import *
# ==run.py===============================================
from foo import x # 指向foo中1的内存地址
from foo import get #指向foo中get函数内存地址
from foo import change
# from foo import change as c
  # ------------------
  # print(x)
  # x=33
  # print(x)
# --------------------
get() # 获得foo的x
change() #改变foo的x
get() # 获得foo的x
print(x) # 指向当前x(1的内存地址)
# --------------------
from foo import x # 重新导入foo的x值为0
print(x) # 0
```

- python模块加载机制

1. 内存（内置模块、缓存）
2. 硬盘（自定义的文件）

```python
import sys
print(sys.path) # 查看模块查找路径
# 👉 环境变量是以执行文件为准的，“所有被导入的模块中” 或 “后续的其他文件中” 引用的sys.path都是参照执行文件的sys.path
sys.path.append('/Usrs/xxx/foo') # 添加 文件查找路径
import foo # 导入后能查到
```

- `sys.modules`:查看已经加载到内存中的模块
  `del 模块名`：解除模块绑定（理论上模块应该被垃圾回收，实际还在内存中；原因：优化机制，减少下次导入时申请内存）

### python模块加载机制 与 node 加载机制

- Python: 模块是一个对象，被 import 系统动态加载。
- Node CommonJS: 模块是一个函数执行环境，通过 require 运行。
- Node ESM: 模块是一个静态依赖图，在执行前完成链接。

#### python模块加载机制

Python 的模块加载由 import system 控制，核心模块是：

- importlib、
- sys.modules、
- sys.meta_path、
- sys.path

1. 第一步：检查缓存：`sys.modules`这是一个 全局模块缓存字典
2. 第二步：查找模块：搜索顺序：sys.meta_path -> PathFinder -> sys.path
   - sys.path: [ 当前脚本目录、PYTHONPATH、标准库目录、site-packages ]
   - 按顺序寻找：

   ```python
     foo.py
     foo/__init__.py
     foo.so
     foo.pyd
   ```

3. 第三步：创建 Module 对象，放入缓存中（⚠️先缓存、在执行 - 这是为了解决：循环引用）
   `module = ModuleType("foo"); sys.modules["foo"] = module`
4. 第四步：执行模块代码：模块变量全部进入：`module.__dict__`
5. 第五步：绑定到当前命名空间：`foo -> module object`

⚠️ 1、模块只执行一次：  
⚠️ 2、循环引用问题：因为：module 先进入 sys.modules所以不会死循环，`但变量可能未初始化`。  
⚠️ 3、Python 模块是对象：模块本质是：ModuleType object

#### Node.js 模块加载机制--1--CommonJS（传统）

1. 第一步：检查缓存：`require.cache`
2. 第二步：路径解析：
   Node 按顺序查找：

   ```js
   ./foo
   ./foo.js
   ./foo.json
   ./foo.node
   // ========================
   当前目录/node_modules
   父目录/node_modules
   根目录/node_modules
   ```

3. 第三步：创建 Module 对象,并加入缓存`require.cache`;

   ```js
   Module {
     id
     filename
     exports
     loaded
   }
   ```

4. 第四步：代码包装；Node 不会直接执行 JS 文件，会先包一层函数：

   ```js foo.js
   (function (exports, require, module, __filename, __dirname) {
     // foo.js 内容
   });
   ```

5. 第五步：执行模块:
   执行 wrapper function，最终返回：`module.exports`

#### Node.js 模块加载机制--2--ES Module（现代）

- Node 的 ESM 实现遵循：ECMAScript Module Spec
- 加载流程：解析 → 链接 → 执行
- ESM 关键特点: 静态分析: 在 编译阶段就解析:所以：import 不能写在 if 里
- live binding: `export let count = 0` 其他模块引用：实时更新(不是拷贝)。

#### Python vs Node 模块机制核心区别

| 对比     | Python               | Node CommonJS    | Node ESM     |
| -------- | -------------------- | ---------------- | ------------ |
| 加载方式 | import               | require()        | import       |
| 解析阶段 | 运行时               | 运行时           | 编译阶段     |
| 缓存     | sys.modules          | require.cache    | Module Map   |
| 模块本质 | Module object        | module.exports   | live binding |
| 执行次数 | 一次                 | 一次             | 一次         |
| 循环依赖 | 可运行但可能未初始化 | 容易 undefined   | 更安全       |
| 作用域   | module.**dict**      | wrapper function | module scope |
| 是否静态 | 否                   | 否               | 是           |

## 包（模块的一种）

包：一个包含`__init__.py`文件的文件夹；
包本质：是模块的模块的一种形式，用来当做模块导入；

```shell
day
|->main.py
└─>package
  |->moduleAA.py
  |->__init__.py
  └─>packageChild
       |->moduleBB.py
       └─>__init__.py
```

1.关于包相关的导入语句也分为import和from...import#两种，但是无论哪种，无论在什么位置，在导入时都必须遵循一个原则:# #凡是在导入时带点的，点的左边都必须是一个包，否则非法。
可以带有一连串的点，如import 顶级包.子包.子模块，但都必须遵循这个原则。

例如:#
#from a.b.c.d.e.f import xxx；。。。。。
#import a.b.c.d.e.f 其中a、b、c、d、e都必须是包
#2、包A和包B下有同名模块也不会冲突，如A.a与B.a来自俩个命名空间#
#3、import导入文件时，产生名称空间中的名字来源于文件，
#import 包，产生的名称空间的名字同样来源于文件，即包下的

- 绝对导入：以包的文件夹作为起始来进行导入；
  package文件夹下的`__init__.py`中添加`from package.module import func`

  确保执行文件与包在同一文件夹下 或者 sys.path.append('/Usrs/xxx/foo')；

  原因：👉 环境变量是以执行文件为准的，“所有被导入的模块中” 或 “后续的其他文件中” 引用的sys.path都是参照执行文件的sys.path
  `from a.b.c.d.e.f import func` : .左侧的必须是包，不能是其他；

- 相对导入：仅限于包内使用，不能跨出包(包内模块之间的导入，推荐使用相对导入)
  1. .:代表当前文件夹
  2. ..:代表上一层文件夹
     `from .module import func`

```python
print(__file__) # 当前文件的绝对路径
import os
print(os.path.dirname(os.path.dirname(__file__))) # 当前文件的父目录的父目录
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(BASE_DIR) #基准目录，添加到环境变量
from pathlib import Path
res = Path(__file__).parent.parent
res.resolve() # 获取绝对路径

```

## 常用模块

### 一、 时间模块

- time模块
  1. 时间戳：用于计算时间间隔（从1970-01-01 00:00:00 开始到现在的秒数）
  2. 格式化字符串时间：用于展示时间（2026-03-11 21:46:00）
  3. 结构化的时间：用于单独获取时间的某一部分（本地时间）

  ```python
  import time
  # 时间戳:
  print(time.time()) # 1647020160.0
  # 按照格式显示的时间：
  print(time.strftime("%Y-%m-%d %H:%M:%S")) # 2026-03-11 21:46:00
  print(time.strftime("%Y-%m-%d %X")) # 2026-03-11 21:46:00
  # 结构化时间：
  tm = time.localtime() # (2026, 3, 11, 21, 46, 0, 0, 78, 0)
  print(tm.tm_year)
  # 1、format time <-->struct time <-->timestamp
  # 2、世界标准时间与本地时间
  # time.sleep(1) # 阻塞1秒
  ```

- datetime模块（类似js的moment.js、dayjs）

```python
import datetime
print(datetime.datetime.now()) # 2026-03-11 21:46:00.000000
print(datetime.datetime.utcnow()) # 世界标准时间

```

### 二、 random 随机数

```python
import random

print(random.random()) # （0,1） 0<x<1 的小数
print(random.randint(1, 10)) # [1,10] 1-10的整数
print(random.randrange(1,3)) #[1,3) 1<=x<3 的整数
print(random.choice([1,2,3,4,5]))
print(random.shuffle([1,2,3,4,5]))
print(random.sample([1,2,3,4,5], 2))
print(random.uniform(1, 10)) # (1,10) 1<=x<10 的小数
##==验证码==========
ord('a') # 97
ord('z') # 122
chr(ord('a')) # a
s1= chr(random.randint(ord('a'), ord('z')))
s2 = str(random.randint(0,9))
random.choice([s1,s2])
```

### 三、 操作系统模块--1-- os模块

```python
import os
print(os.name) # 当前操作系统
print(os.environ) # 环境变量-字典；
print(os.getcwd()) # 当前工作目录
print(os.listdir()) # 当前目录下的文件
print(os.path.join('a', 'b', 'c')) # a/b/c
print(os.path.exists('a')) # 判断文件是否存在
# print(os.path.abspath('a')) 与 print(__file__) # 绝对路径
# print(os.path.split('a/b/c')) # ('a/b', 'c')
print(os.path.dirname('a/b/c')) # a/b
print(os.path.basename('a/b/c')) # c
print(os.path.getsize('a')) # 文件大小
# print(os.path.getmtime('a')) # 文件修改时间
# print(os.path.getatime('a')) # 文件访问时间
# print(os.path.getctime('a')) # 文件创建时间
print(os.path.isdir('a')) # 判断是否是目录
print(os.path.isfile('a')) # 判断是否是文件
# print(os.path.isabs('a')) # 判断是否是绝对路径
print(os.path.realpath('a')) # 真实路径
print(os.path.splitdrive('a')) # ('', 'a')
print(os.path.commonpath(['a', 'b', 'c'])) # a
print(os.path.commonprefix(['a', 'b', 'c']))
os.mkdir('a') # 创建目录
os.makedirs('a/b/c') # 创建目录
os.rmdir('a') # 删除目录
os.rename('a', 'b') # 重命名
os.remove('a') # 删除文件
os.chdir('a') # 切换目录
os.chdir('..') # 返回上一级目录
os.walk('a') # 遍历目录
os.system('ls') # 执行系统命令
# ----------------------------
PATH=文件夹的路径 # 环境变量 -- 执行系统命令的时候用；
sys.path # 环境变 -- 用在导模块的时候；
os.environ['aaa'] ='111' # 环境变量 -- 用在全局变量中；
```

### 四、 系统模块 --2-- sys模块

```python
import sys

sys.path # 路径
python3.8 run.py 1 2 3
# sys.argv # 获取python解释器后的参数值
print(sys.argv) # ['run.py', '1', '2', '3']
```

```python
# 进度条
import time
res =''
for i in range(50):
  res+=''
  time.sleep(0.1)
  print('\r[%-50s]' %,end='')
  # \r 回到行首
```

### 五、 shutil模块 -- 【文件copy、解压缩】

### 六、 序列化反序列化 --1-- json(通用) & pickle（python专用）模块

- 序列化：用于将对象序列化成字符串；用于存储和数据传输；

  python(列表) <--> 特定格式(跨平台交互--通用的，所有语言都能识别) <--> java(数组)

  内存中的数据 --> 序列化 --> 特定格式（json或pickle格式）  
  `{'aa':'aa'} --> 序列化str({'aa':'11'}) --> "{'aa':'11'}"`

- 反序列化：用于将字符串反序列化成对象；

  `{'aa':'aa'} <-- 反序列化eval({'aa':'11'}) <-- "{'aa':'11'}"`

```python
import json
# 序列化
json_res= json.dumps([1,'aa',True,False,None])
print(json_res,type(json_res))  # [1, "aa", true, false, null] <class 'str'>
# json.dump([1,'aa',True,False,None], fp) # ⚠️将对象序列化成字符串并写入文件

# 反序列化: json格式中字符串的引号必须是双引号
l = json.loads('[1, "aa", true, false, null]') # 将字符串反序列化成对象
# json.load(fp) # ⚠️将文件内容读取成对象
print(l,type(l)) # [1, 'aa', True, False, None] <class 'list'>

print(json.dumps({'aa':'aa'}))
print(json.loads('{"aa":"aa"}'))
print(json.dumps({'aa':'aa'}, ensure_ascii=False))
print(json.dumps({'aa':'aa'}, indent=2))
print(json.dumps({'aa':'aa'}, indent=2, ensure_ascii=False))
```

- pickle：用法与json类似（python2与python3不同，要指定协议）

  ```python
  import pickle

  res = pickle.dumps([1,'aa',True,False,None])
  print(pickle.loads(res)) # [1, 'aa', True, False, None]

  s =pickle.loads(res)
  print(s) # [1, 'aa', True, False, None]
  ```

json模块： 不支持 python对象（实例）序列换；
pickle模块：可以将 python对象（实例）序列化成字符串；

### 🔥猴子补丁：替换第三方的部分功能

直接在入口文件中修改，后续其他文件导入使用“自动使用”

```python
# ujson 效率比json高
import json
import ujson
json.dumps = ujson.dumps
json.loads = ujson.loads


```

### 七、 序列化反序列化 --2-- shelve 模块(了解)

对pickle的封装

### 八、 序列化反序列化 --3-- xml 模块(了解)

### 九、 加载配置文件 -- configparser 模块【配置文件】

加载某种特定格式的配置文件

```python
# test.ini
[section1] #分组
k=v1
k2=v2
user=zhang
password=123
is_admin=True

[section2]
k1=v3
# config.py
import configparser
config = configparser.ConfigParser()
config.read('test.ini') # 加载配置文件
print(config['section1']['k'])
print(config.get('section1', 'k2')) # 获取section1的k2的值
print(config.getboolean('section1', 'is_admin')) # 获取section1的is_admin的值
```

### 十、 哈希模块 -- hashlib 模块【hash加密】

- hash算法：该算法接受传入的内容，经过运算得到一串hash值；

- hash算法特点：  
  1、只要传入的内容一样，得到的hash值必然一样；  
  2、不能由hash值推算出原始内容；  
  3、只要使用的hash算法不变，无论传入的内容多大，得到的hash值长度是固定的；

- 撞库破解md5：不停试账户密码，直到找到；

```python
import hashlib
# print(hashlib.md5('123456'.encode('utf-8')).hexdigest())
m=hashlib.md5()
m.update('hello'.encode('utf-8')) # 只能接受byte值
m.update('world'.encode('utf-8'))
res=m.hexdigest() # 拼成'helloword'后获取hash值
print(res)

# print(hashlib.sha1('123456'.encode('utf-8')).hexdigest())


```

### 十一、 执行系统命令 -- subprocess 模块【子进程】

执行系统命令的

```python
os.system('dir') # “应用程序”向“操作系统”提交指令;
import subprocess

subprocess.call('dir')
subprocess.call('dir', shell=True)

res = subprocess.run('dir', shell=True, capture_output=True)
print(res.stdout.decode('utf-8'))
print(res.stderr.decode('utf-8'))
print(res.returncode)
print(res.args) # 运行命令的参数
print(res.stdout) # 运行命令的输出
print(res.stderr) # 运行命令的错误输出

obj = subprocess.Popen('ls /root', shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
# stdout: 标准输出给stdout; stderr: 错误输出stderr
res =obj.stdout.read()
print(res.decode('utf-8')) #编码（'utf-8'）是系统的默认编码（win:gbk,linux:utf-8），不是我们指定的
print(res.decode('utf-8'))
print(obj.returncode)


```

### 十二、 logging 模块

日志级别：debug > info > warning > error > critical

```python
import logging

  # 1、基础配置--了解
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s -%(levelname)s -%(module)s: %(message)s')
    # 参数1、日志输出位置：1文件、2默认终端；filename='access.log' (不配置，默认终端)
    # 参数2、日志格式：%(asctime)s - %(name)s - %(levelname)s - %(message)s
    # 参数3、时间格式 datefmt='%Y-%m-%d %H:%M:%S %p'
    # 参数4、日志级别：level=默认30；大于等于30才输出；小于30不输出；

    logging.debug('调试--debug') # 级别 10 --默认不输出
    logging.info('消息--info') # 级别 20--默认不输出
    logging.warning('警告--warning') # 级别 30
    logging.error('错误--error') # 级别 40
    logging.critical('严重--critical') # 级别 50

  # 2、日志配置 -- 单独文件

      # 1、定义三种日志输出格式，日志中可能用到的格式化串如下
      # %(name)s Logger的名字
      # %(levelno)s 数字形式的日志级别
      # %(levelname)s 文本形式的日志级别
      # %(pathname)s 调用日志输出函数的模块的完整路径名，可能没有
      # %(filename)s 调用日志输出函数的模块的文件名
      # %(module)s 调用日志输出函数的模块名
      # %(funcName)s 调用日志输出函数的函数名
      # %(lineno)d 调用日志输出函数的语句所在的代码行
      # %(created)f 当前时间，用UNIX标准的表示时间的浮 点数表示
      # %(relativeCreated)d 输出日志信息时的，自Logger创建以 来的毫秒数
      # %(asctime)s 字符串形式的当前时间。默认格式是 “2003-07-08 16:49:45,896”。逗号后面的是毫秒
      # %(thread)d 线程ID。可能没有
      # %(threadName)s 线程名。可能没有
      # %(process)d 进程ID。可能没有
      # %(message)s用户输出的消息


      # settings.py
      import os

      # 2、强调：其中的%(name)s为getlogger时指定的名字
      standard_format = '[%(asctime)s][%(threadName)s:%(thread)d][task_id:%(name)s][%(filename)s:%(lineno)d]' \
                        '[%(levelname)s][%(message)s]'

      simple_format = '[%(levelname)s][%(asctime)s][%(filename)s:%(lineno)d]%(message)s'

      test_format = '%(asctime)s] %(message)s'

      # 3、日志配置字典
      LOGGING_DIC = {
          'version': 1,
          'disable_existing_loggers': False,
          'formatters': {
              'standard': {
                  'format': standard_format
              },
              'simple': {
                  'format': simple_format
              },
              'test': {
                  'format': test_format
              },
          },
          'filters': {},
          'handlers': {
              #打印到终端的日志
              'console': {
                  'level': 'DEBUG',
                  'class': 'logging.StreamHandler',  # 打印到屏幕
                  'formatter': 'simple' # 使用formatters里配置的format
              },
              #打印到文件的日志,收集info及以上的日志
              'default': {
                  'level': 'DEBUG',
                  'class': 'logging.handlers.RotatingFileHandler',  # 保存到文件,日志轮转
                  'formatter': 'standard',
                  # 可以定制日志文件路径
                  # BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # log文件的目录
                  # LOG_PATH = os.path.join(BASE_DIR,'a1.log')
                  'filename': 'a1.log',  # 日志文件
                  'maxBytes': 1024*1024*5,  # 日志大小 5M
                  'backupCount': 5,
                  'encoding': 'utf-8',  # 日志文件的编码，再也不用担心中文log乱码了
              },
              'other': {
                  'level': 'DEBUG',
                  'class': 'logging.FileHandler',  # 保存到文件
                  'formatter': 'test',
                  'filename': 'a2.log',
                  'encoding': 'utf-8',
              },
          },
          'loggers': {
              #logging.getLogger(__name__)拿到的logger配置
              '': { # 默认的:没有指定logger,匹配不到logger
                  'handlers': ['default', 'console'],  # 这里把上面定义的两个handler都加上，即log数据既写入文件又打印到屏幕
                  'level': 'DEBUG', # loggers(第一层日志级别关限制)--->handlers(第二层日志级别关卡限制)
                  'propagate': False,  # 默认为True，向上（更高level的logger）传递，通常设置为False即可，否则会一份日志向上层层传递
              },
              '用户交易': {
                  'handlers': ['default', 'console'],  # 这里把上面定义的两个handler都加上，即log数据既写入文件又打印到屏幕
                  'level': 'DEBUG', # loggers(第一层日志级别关限制)--->handlers(第二层日志级别关卡限制)
                  'propagate': False,  # 默认为True，向上（更高level的logger）传递，通常设置为False即可，否则会一份日志向上层层传递
              },
              '专门的采集': {
                  'handlers': ['other',],
                  'level': 'DEBUG',
                  'propagate': False,
              },
          },
      }

      # 4、使用
      import settings
      # 4.1
      from logging import getLogger, config
      if not logging.getLogger().handlers:
        config.dictConfig(settings.LOGGING_DIC)
      logger1 = getLogger('用户交易')
      logger1.info('info')

      # 4.2
      import logging.config # 导入config模块时，logging模块也会被导入所有有getLogger模块可用
      if not logging.getLogger().handlers:
        logging.config.dictConfig(settings.LOGGING_DIC)
      logger2 = logging.getLogger('专门的采集')
      logger2.info('info')

      logger3 = logging.getLogger('用户操作') # 匹配不到,进''中
      logger3.info('info')


```

### 十三、 re 模块 -- 【正则模块】

![正则表达式](./img/正则表达式.png)

```python

import re
#1、返回所有满足匹配条件的结果,放在列表里
print(re.findall('e','alex make love') )   #['e', 'e', 'e'],
#2、只到找到第一个匹配然后返回一个包含匹配信息的对象,该对象可以通过调用group()方法得到匹配的字符串,如果字符串没有匹配，则返回None。
print(re.search('e','alex make love').group()) #e,

#3、同search,不过在字符串开始处进行匹配,完全可以用search+^代替
print(re.match('e','alex make love'))    #None,match

#4、先按'a'分割得到''和'bcd',再对''和'bcd'分别按'b'分割
print(re.split('[ab]','abcd'))     #['', '', 'cd']，
#5
print('===>',re.sub('a','A','alex make love')) #===> Alex mAke love，不指定n，默认替换所有
print('===>',re.sub('a','A','alex make love',1)) #===> Alex make love
print('===>',re.sub('a','A','alex make love',2)) #===> Alex mAke love
print('===>',re.sub('^(\w+)(.*?\s)(\w+)(.*?\s)(\w+)(.*?)$',r'\5\2\3\4\1','alex make love')) #===> love make alex

print('===>',re.subn('a','A','alex make love')) #===> ('Alex mAke love', 2),结果带有总共替换的个数

#6
obj=re.compile('\d{2}')

print(obj.search('abc123eeee').group()) #12
print(obj.findall('abc123eeee')) #['12'],重用了obj
```

### 十四、 uuid模块

```python
import uuid
print(uuid.uuid4()) # 9c5d0c0c-d0c9-4c0c-9c0c-c0c9d0c0c0c0

```

## 面向对象思想

- 函数：用来封装“可复用的功能（行为）”；
- 对象：就是“容器”，用来封装“数据+功能”，将程序“整合”起来; 👉 对象：封装"数据+行为"的实体，是程序运行的基本单位
- 类：对象的抽象模板，是定义"同类对象"共有属性和方法的"模板"; 👉 注意：类不是“装对象的容器”; 类是“生成对象的规则”
- 👍 程序最终用的是对象【程序运行时操作的都是对象，类只存在于设计阶段（或语法层面）】

📌 本质：面向对象 = 用对象组织程序，而不是用函数堆代码；

🔥 一句话讲清三者关系: `类是模具 → 造出对象 → 对象用函数干活`

- 函数: 干活的工具
- 对象: 一个完整的东西（有数据 + 能做事）
- 类: 造对象的模板
- 程序运行时，真正干活的是对象

1️⃣ 封装（Encapsulation）: 把数据和操作数据的方法绑定在一起，并隐藏内部细节;  
2️⃣ 继承（Inheritance）: 子类继承父类的属性和方法，并扩展新的属性和方法;  
3️⃣ 多态（Polymorphism）: 同一个方法，不同对象表现不同;

### 类

类体中最常见的是变量与函数的定义，但是类体其实是可以包含任意其他代码的；  
📌 类体代码：是在类定义阶段就会立即执行，会产生类的名称空间（命名空间）；

```python
# 👉 类定义时，会执行类体代码，生成类对象（只执行一次）
class Student:
  # stu_name = "张三"
  # stu_age = 18
  # stu_gender = "男"
  stu_school = "上海大学"
  count = 0 # 静态变量 --> 统计实例化次数

  def __init__(self,name=None): # 1、构造函数，初始化参数；2、类调用阶段运行(即生成对象实例时)，3、self:对象实例本身；4、可以给默认值；
    self.stu_name = name # 初始化参数
    Student.count += 1
    print("=====") # 也可以放其他代码,类调用时立即执行；
    return None # 默认就是 None，可以不写；如果写了非 None 会报错(建议：直接省略，不写)

  def set_name(self, name): # self只是个参数名字，写成X、Y也可以；❗指向调用者，类似js的call/apply/bind
    self.stu_name = name # ❗self上的属性，就当没有；初始化后才有

  def choose(self, course):
    self.course = course

  print("=====") # 定义时运行（只执行一次）；

  # 读到 class
  # 1️⃣ 执行 class 里的代码（print 会执行）
  # 2️⃣ 把执行过程中产生的变量/函数收集起来（形成一个 dict）
  # 3️⃣ 用这个 dict 创建“类对象 Student”


print(Student.__dict__) # 类的名称空间的内容 ==>
# {
#   '__module__': '__main__',
#   'stu_school': '上海大学',
#   '__init__': <function Student.__init__ at 0x1031c98a0>,
#   'set_name': <function Student.set_name at 0x1031c9da0>,
#   '__dict__': <attribute '__dict__' of 'Student' objects>,
#   '__weakref__': <attribute '__weakref__' of 'Student' objects>,
#   '__doc__': None
# }


print('========访问类的属性===============')
print(Student.stu_school) # 本质是Student.__dict__['stu_school'] ==> "上海大学"
# print(Student.stu_name) # ❗报错，因为stu_name是实例属性，对象实例才能访问，类没有这个属性；
print(Student.set_name) # 本质是Student.__dict__['set_name'] ==> <function Student.set_name at 0x0000020EA0E5EA60>

print('=========访问对象属性===============')
# 调用类，其实就是在调用类这个“可调用对象”，触发 __call__，内部完成实例化流程了；简化版【类名() = 创建对象 + 自动调用 __init__】
stu1_obj = Student() # 创建对象, 绑定对象与类的关联关系（❗不是执行类，而是告诉解释器用这个类模板产生对象）
print(stu1_obj.__dict__) # 本质是stu1_obj.__dict__ ==> {'stu_name': None} 已经被 __init__ 初始化了;
stu1_obj.stu_name = "李四"
print(stu1_obj.stu_name) # 本质是stu1_obj.__dict__['stu_name'] ==> 李四
# 🔥 实例化发生3件事：
# step1、产生空对象；
# step2、调用类中的__init__方法，然后将空对象和调用类时括号内的参数一起传给__init__；
# step3、返回初始化完的对象（调用类的返回值，不是init的返回值）；

stu2_obj = Student("张三") # 实例化（即创建对象）时，会自动触发__init__并将生成的对象传给它，❗Student.__init__(空对象,,,)

print("======类中存放的是 对象'共有的'数据+功能 =====================")
print( id(stu1_obj.stu_school) == id(stu2_obj.stu_school) ) # id 相同，共用类的属性
# 1️⃣ 先找 stu1_obj.__dict__ ❌ 没有; 2️⃣ 再找 Student.__dict__ ✅ 找到了; 3️⃣ 返回


print('========访问类方法===============')
# 实例对象调用方法时，会自动把“对象本身”作为第一个参数（self）传进去
print(Student.set_name) #  <function Student.set_name at 0x0000020EA0E5EA60> 本质是Student.__dict__['set_name']
print(stu1_obj.set_name) # <bound method Student.set_name of <__main__.Student object at 0x10263fce0>>
# Student.set_name("李四") # ❌ 报错：TypeError: missing 1 required positional argument: 'self' --->因为：没有自动传 self
Student.set_name(stu1_obj, "李四") # ✅
stu1_obj.set_name("李四") # 实际等价于：Student.set_name(stu1_obj, "李四") # obj.fn() ≈ Class.fn(obj)

stu1_obj.choose("Python 开发")
print(stu1_obj.course) #  Python 开发
print(stu2_obj.course) #  ❌ 报错，因为 course 属性只属于对象实例，对象实例没有 course 属性；
# stu1_obj.set_name
#   ↓
# 先找 stu1_obj.__dict__ ❌ 没有
#   ↓
# 找到 Student.set_name ✅
#   ↓
# 📌自动绑定 stu1_obj
#   ↓
# 得到 bound method
#   ↓
# 调用时自动传入 stu1_obj
```

✅ 1. 类是“共享区”: 放公共数据 + 方法
✅ 2. 对象是“私人空间”: `__dict__` 里存自己的数据
✅ 3. 查找规则（必须记住）: 对象 → 类 → 父类 → 报错

✅ Python：方法 = 函数 + 自动绑定对象（self）
✅ JS：this = 谁调用函数，就指向谁（可以被 call/apply/bind 改）

```python
# python3中 类就是类型，类型就是类
l=['a', 'b', 'c'] # l=List('a', 'b', 'c')
l.append('d')
print(l) # ['a', 'b', 'c', 'd']

# list.append('d') # ❌ 报错
list.append(l,'d') # ✅
print(l) # ['a', 'b', 'c', 'd', 'd']

```

### 封装 --》隐藏属性

## a

## python 诡异现象

核心关键词：缓存、复用、单例、编译期优化

- Python 中，凡是你“没 new 的对象”，都可能被复用。
  所以：
  - ❌ 不要用 is 判断值
  - ✅ is 只用于单例（None / True / False）
  - ✅ 写代码时假设：对象可能被复用

- Python 为了性能，在你看不见的地方疯狂“省对象”。

### 一、数值类

- 1️⃣小整数池；【范围：-5 ~ 256】python解释器启动时，就在内存申请了空间；
- 2️⃣ bool 是 int 的子类【历史设计】

```python
 # 1️⃣ 小整数池
   a = 100
   b = 100
   a is b   # True
 # 2️⃣ bool 是 int 的子类
   isinstance(True, int)  # True
   True + 1    # 2
```

### 二、字符串类：比你想象得多

- 3️⃣ 字符串字面量合并【✔ 编译期， ✔ Unicode/中文/emoji都适用】
- 4️⃣ 字符串驻留（intern）【典型场景: dict key; 状态机; 词法分析】
- 5️⃣ 标识符字符串自动 intern 【 如果它是: 合法标识符;且来源明确; 👉 很可能被自动 intern】

```python
 # 3️⃣ 字符串字面量合并
   x = "abc"
   y = "abc"
   x is y   # True
 # 4️⃣ 字符串驻留（intern）
   import sys
   a = sys.intern("hello")
   b = sys.intern("hello")
   a is b  # True
 # 5️⃣ 标识符字符串自动 intern
   x = "variable_name"
```

### 三、空值与特殊对象：严格单例

- 6️⃣ None 永远只有一个 【✔ 语言规范保证】
- 7️⃣ True / False 也是单例
- 8️⃣ Ellipsis（...）【用于：切片;类型提示】

```python
 # 6️⃣ None 永远只有一个
   x = None
   y = None
   x is y   # True
 # 7️⃣ True / False 也是单例
   a = True
   b = True
   a is b   # True
 # 8️⃣ Ellipsis（...）
   x = ...
   y = ...
   x is y   # True
```

### 四、容器 & 语法层面的“坑”

- 9️⃣ 空元组是单例 【✔ 不可变，✔ 常量复用】
- 🔟 空 frozenset 可能被复用【⚠️ 实现细节，别依赖】
- 1️⃣1️⃣ 默认参数陷阱（复用的是同一个对象）【原因：默认参数在”函数定义时“创建；不是调用时】

```python
 # 9️⃣ 空元组是单例
   a = ()
   b = ()
   a is b   # True
 # 🔟 空 frozenset 可能被复用
   a = frozenset()
   b = frozenset()
   a is b   # True（常见）
 # 1️⃣1️⃣ 默认参数陷阱（复用的是同一个对象）
   def f(x=[]):
       x.append(1)
       return x
   f()  # [1]
   f()  # [1, 1]
```

### 五、编译期优化导致的“幻觉”

- 1️⃣2️⃣ 常量折叠（Constant Folding）
- 1️⃣3️⃣ 编译期字符串拼接
- 1️⃣4️⃣ 同一行对象复用【⚠️ 不可预测】

```python
 # 1️⃣2️⃣ 常量折叠
   x = 1 + 2 编译期直接变成：x = 6
 # 1️⃣3️⃣ 编译期字符串拼接
   x = "hello" + "world" 等价于： x = "helloworld"
 # 1️⃣4️⃣ 同一行对象复用
   a = 1000; b = 1000
   a is b  # 有时 True
```

### 六、类 / 函数层面的共享

- 1️⃣5️⃣ 类属性共享
- 1️⃣6️⃣ 闭包捕获的是“变量”，不是“值”

```python
 # 1️⃣5️⃣ 类属性共享
   class A:
      x = []

    a1 = A()
    a2 = A()
    a1.x.append(1)
    a2.x   # [1]
 # 1️⃣6️⃣ 闭包捕获的是“变量”，不是“值”
   funcs = []
   for i in range(3):
       funcs.append(lambda: i)

   [f() for f in funcs]  # [2, 2, 2]
```

### 七、总结一张「归因速查表」

| 现象           | 原因                     |
| -------------- | ------------------------ |
| `id` 一样      | 缓存 / 单例 / 编译期合并 |
| `is` 偶尔 True | CPython 优化             |
| 默认参数共享   | 定义期绑定               |
| 中文字符串相同 | 常量合并                 |
| 空对象复用     | 不可变 + 优化            |

### 八、对照总表（Python vs Java）

| 维度       | Python      | Java          |
| ---------- | ----------- | ------------- |
| 小整数缓存 | -5 ~ 256    | -128 ~ 127    |
| 是否规范   | ❌ 实现细节 | ✅ JLS        |
| 字符串池   | 有（隐式）  | 有（强规范）  |
| intern     | sys.intern  | String.intern |
| None/null  | None 是对象 | null 不是对象 |
| is / ==    | is 判断引用 | == 判断引用   |
| equals     | == 判断值   | equals 判断值 |

## 数据类型 与 数据类

- 数据类型

```bash
object
 ├── int, float, bool, complex(复数)
 ├── str(不可变)
 ├── list, tuple(不可变), range
 ├── set, frozenset(不可变集合)
 ├── dict
 ├── bytes(不可变字节), bytearray, memoryview
 ├── None(空值)
 └── function, class, ...

```

- 数据类

| 类型                 | 是否官方 | 是否推荐  | 特点             |
| -------------------- | -------- | --------- | ---------------- |
| `@dataclass`         | ✅       | ✅ 强烈   | 现代 Python 标准 |
| `namedtuple`         | ✅       | ⚠️        | 老方案，不直观   |
| `typing.NamedTuple`  | ✅       | ⚠️        | 不可变           |
| `attrs`              | ❌       | ✅        | dataclass 超集   |
| `pydantic.BaseModel` | ❌       | ✅（Web） | 校验 + 序列化    |

```python
# 1. 默认
@dataclass
class Point:
    x: int
    y: int
    z: int = 18 # 默认值
    members: list[str] = field(default_factory=list) # 使用 field() 的数据类
    members: list[str] = []  # 大坑 ❌
p = Point(1, 2)
p.x = 10   # ✅ 可以改

# 2. 不可变数据类
@dataclass(frozen=True)
class Point:
    x: int
    y: int
p = Point(1, 2)
p.x = 10  # ❌ 报错

# 3. 默认值
@dataclass
class Team:
    name: str
    age: int = 18 # 默认值
    members: list[str] = field(default_factory=list) # 使用 field() 的数据类
    members: list[str] = []  # 大坑 ❌
    classVal: str = field(compare=False) # 不参与比较

# 4. 排序数据类
@dataclass(order=True)
class User:
    age: int
    name: str
User(18, "A") < User(20, "B")  # True

```

第三方库和工具，如 NumPy、Pandas、TensorFlow 和 PyTorch 等

- 类型工具：
  1. dataclass:主要用于简化类的创建;
  2. typing: 类型检查;
     - TypedDict
     - NamedTuple
  3. pydantic V2: (推荐用于 Python 3.11+) 处理复杂的数据验证;
