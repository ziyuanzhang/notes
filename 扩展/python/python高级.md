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

## 垃圾回收机制：回收“没有任何变量名的“值

## 编译型or解释型；强类型or弱类型；动态型or静态型

1. 强类型：数据类型不可以被忽略的语言 即变量的数据类型一旦被定义，那就不会再改变，除非进行强转。
2. 动态型：运行时才进行数据类型检查 即在变量赋值时，才确定变量的数据类型，不用事先给变量指定数据类型
3. 静态型：需要事先给变量进行数据类型定义

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
  >>> x='Info Tony:18'
  >>> id(x), type(x), x
  4376607152，<class 'str'>, 'Info Tony:18'
  ```

- is 与 ==
  `x="3.1415926"`
  `y="3.1415926"`
  1. is: 比较左右两个值身份id是否相等; x is y >>>False
  2. ==: 比较左右两个值他们的值是否相等; x == y >>>True
     **注：** 值相等，id可能不同，即两块不同的内存空间里可以存相同的值
     `i=3.14`

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
