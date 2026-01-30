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

## 1. xx是什么？2.为什么有它？3.怎么用？

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

- 变量值 的三大特性：
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
  1. is: 比较左右两个值”身份id“是否相等;
  2. ==: 比较左右两个值”他们的值“是否相等;
     **注：** 值相等，id可能不同，即两块不同的内存空间里可以存相同的值

- Python 中比较相等
  1. is: 判断身份
  2. ==: 判断值

- java 中比较
  1. equals: 判断值
  2. ==: 判断引用

### python 诡异现象

核心关键词：缓存、复用、单例、编译期优化

- Python 中，凡是你“没 new 的对象”，都可能被复用。
  所以：
  - ❌ 不要用 is 判断值
  - ✅ is 只用于单例（None / True / False）
  - ✅ 写代码时假设：对象可能被复用

- Python 为了性能，在你看不见的地方疯狂“省对象”。

#### 一、数值类

- 1️⃣小整数池；【范围：-5 ~ 256】
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

#### 二、字符串类：比你想象得多

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

#### 三、空值与特殊对象：严格单例

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

#### 四、容器 & 语法层面的“坑”

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

#### 五、编译期优化导致的“幻觉”

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

#### 六、类 / 函数层面的共享

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

#### 七、总结一张「归因速查表」

| 现象           | 原因                     |
| -------------- | ------------------------ |
| `id` 一样      | 缓存 / 单例 / 编译期合并 |
| `is` 偶尔 True | CPython 优化             |
| 默认参数共享   | 定义期绑定               |
| 中文字符串相同 | 常量合并                 |
| 空对象复用     | 不可变 + 优化            |

#### 八、对照总表（Python vs Java）

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
