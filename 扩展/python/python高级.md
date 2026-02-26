# python 高级

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

## 前置知识

1. 运行python3步骤：
   - 1、python解释器启动--解释器从硬盘读到内存（相当于启动文本编辑器）；
   - 2、python解释器把a.py的内容当做普通的文本内容由硬盘读入内存(本质是解释器向操作系统发起系统调用，让操作系统控制硬件完成读取)
   - 3、解释器解释执行刚刚读入内存的python代码，开始识别python语法

## 1. xx是什么？2. 为什么有它？3. 怎么用？

## 编译型or解释型；强类型or弱类型；动态型or静态型

- 强类型：数据类型不可以被忽略的语言 即变量的数据类型一旦被定义，那就不会再改变，除非进行强转。
- 动态型：运行时才进行数据类型检查 即在变量赋值时，才确定变量的数据类型，不用事先给变量指定数据类型
- 静态型：需要事先给变量进行数据类型定义

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

✅ 浅拷贝：复制最外层容器，新容器中的元素仍指向原对象
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
  f.write('hello world') # 追加, 从指针位置开始写
  f.writelines(['hello world', 'hello world'])

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
      res = f.read(1024)
      if len(res) == 0: # 读完
        break

      print(res)
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

数据类型

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

数据类

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

## 安装并初始化项目

1. 安装uv
   - Linux / macOS: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Windows (PowerShell): `powershell -ExecutionPolicy ByPass -Command "irm https://astral.sh/uv/install.ps1 | iex"`
   - 或 `pip install uv`
   - `uv --version`
2. 初始化项目: `uv init my_project` ；`cd my_project`;
3. 创建虚拟环境并激活：
   - `uv venv`;
   - Linux/macOS: `source .venv/bin/activate`
   - Windows (PowerShell/CMD): `.venv\Scripts\activate`
4. 添加”.python-version “文件，在src下写代码；
5. git:
   - `git add uv.lock`
   - .gitignore（最小但正确）

   ```gitignore
     .venv/
     __pycache__/
     .mypy_cache/
     .pytest_cache/
     .ruff_cache/
     .env
   ```

6. 安装开发依赖:`uv add --dev pytest mypy ruff`
   在 pyproject.toml 中添加：

   ```python
      [tool.mypy]
      python_version = "3.11"
      strict = true

      # 项目结构
      packages = ["my_project"]
      mypy_path = ["src"]

      # 常见妥协
      ignore_missing_imports = true
      warn_unused_ignores = true
      warn_return_any = true
      warn_unreachable = true

      [tool.ruff]  # 格式 + lint
      target-version = "py311"
      line-length = 88

      [tool.ruff.lint] # 格式 + lint
      select = ["E", "F", "I", "B", "UP"]
      ignore = ["E501"]
   ```

   - 执行格式检查和格式化：`uv run ruff check .`；`uv run ruff format .`；
   - 执行类型检查：`uv run mypy src`；

7. 同步下载pyproject.toml中的依赖：`uv sync`
   👉 uv + mypy + ruff + src 布局
   👉 FastAPI + uv + mypy + ruff 标准骨架
   👉 LangGraph / LlamaIndex 项目如何用 uv 管理多子模块
