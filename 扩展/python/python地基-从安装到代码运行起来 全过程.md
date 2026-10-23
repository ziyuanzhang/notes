# python地基 -- 从“安装 --> 代码运行起来”全过程

## 先看完整流程图

<img src='./img/python从安装 -> 代码运行起来1.png' alt='python从安装 -> 代码运行起来' width='700'/>

1. 安装 Python: 获得 Python 解释器及标准库
   ↓
2. 创建项目和虚拟环境: 项目源码 + .venv + pyproject.toml (选择解释器、虚拟环境、依赖包)
   ↓
3. 安装依赖和当前项目: 例如 uv sync、pip install -e . (让当前环境识别项目包；可编辑安装关联本地源码)
   ↓
4. 启动 Python 程序: 例如 uv run python -m my_agent.main (执行 python、python -m 或 uv run 等命令)
   ↓
5. 初始化运行环境并导入模块: 解释器、sys.path、模块查找与加载 (解析入口文件、处理 import、加载模块)
   ↓
6. 执行 Python 代码: 函数调用、对象创建、业务逻辑运行 (调用函数、连接服务、启动应用)
   ↓
7. 进入应用运行状态: 例如启动 LangGraph API 服务，等待请求

安装项目和运行项目是两个不同的阶段。

## 第一阶段: 安装 Python，究竟安装了什么？

假设 Mac 上安装了 Python 3.11。

```bash
你的电脑
│
├── Python 3.11
│   └── Python 解释器
├── 标准库
│   ├── os
│   ├── sys
│   ├── json
│   └── pathlib
│
└── pip 等包管理工具（取决于安装方式）

```

- Python 解释器: 负责读取、编译并执行 Python 程序。CPython 是最常见的 Python 实现，你平时安装的 Python 通常就是它。

- 当执行: `python hello.py`, 操作系统会启动相应的 Python 解释器，由它执行 hello.py。

  注意，这里的python 只是一个命令名称，究竟启动哪个解释器，取决于当前的命令解析和环境配置。

  ```bash
  python --version
  python -c "import sys; print(sys.executable)"  # 第二条命令会输出实际使用的解释器路径。
  ```

## 第二阶段: 创建项目和虚拟环境

```bash

my-agent/                    项目目录
├── pyproject.toml           项目配置: 声明项目元数据、依赖及相关配置
├── uv.lock                  依赖锁定文件
├── src/
│   └── my_agent/            你的 Python 包
│       ├── __init__.py
│       ├── main.py
│       └── tools.py
│
└── .venv/                   存放项目虚拟环境及其安装的包
    ├── bin/python           Python 解释器入口
    └── lib/
        └── python3.11/
            └── site-packages/
                ├── langgraph/
                ├── langchain/
                ├── pydantic/
                └── ...
```

- 虚拟环境不是另一套完全独立的操作系统，而是为一个项目提供相对隔离的 Python 解释器和包安装位置。
  ❗关键点: `创建虚拟环境不等于安装你的业务代码，也不等于安装了所有依赖`。 它首先提供一个可用于运行项目的环境。

- pyproject.toml 声明了:

  ```toml
    [project]
    name = "my-agent"
    version = "0.1.0"
    requires-python = ">=3.11"
    dependencies = [
        "langgraph",
    ]
  ```

- 三个不同层次。

  | 层次          | 负责什么                             |
  | ------------- | ------------------------------------ |
  | Python 解释器 | 执行 Python 程序                     |
  | Python 环境   | 决定使用哪个解释器、哪些依赖包和配置 |
  | 项目源码      | 你实际编写的业务逻辑                 |

  注意: 虚拟环境里的 python 通常是指向基础 Python 的链接或相关启动程序，不一定是一份完全独立复制的 Python 安装。

## 第三阶段: uv sync 和 pip install -e . 分别做什么？

1. 进入项目目录, 执行: `uv sync`
   - 通常会根据 项目配置和锁文件同步依赖、创建或使用虚拟环境，并将当前项目安装到该环境中。
   - 大致会发生以下事情:
     1. 找到或创建项目虚拟环境，通常是 `.venv`。
     2. 根据项目配置和锁文件安装所需依赖。
     3. 通常也会将"当前项目"安装到该环境中，采用可编辑安装方式。

   ❗uv sync 是环境准备阶段，不是业务程序执行阶段。

2. 进入项目目录, 如果执行: `python -m pip install -e .`
   - 主要目的，是将"当前目录的项目"以"可编辑模式"安装到"当前 Python 环境"。
   - 帮助当前环境识别项目包，而不是把每个 .py 文件逐个登记进去。

- 把安装过程拆成两件事:
  1. 安装第三方依赖: 例如 LangGraph、Pydantic。它们的代码通常安装在 .venv 对应的 site-packages 目录中。
  2. 安装当前项目: 让当前环境能按包的方式导入你写的 my_agent。使用可编辑模式时，导入通常会指向项目源码，而不是依赖一份独立复制的源码。

- 例如:
  `from langgraph.graph import StateGraph`
  `from my_agent.tools import add`

  这两行代码分别导入第三方库和你自己的项目模块。
  它们能否导入，取决于当前 Python 环境是否能找到对应模块。
  因此，安装阶段不是在执行你的业务逻辑，而是在为后续运行做好准备。

- 新增兄弟包、子包是否需要重新执行安装

| 变化类型                                                            | 是否需要重新执行 | 说明                                     |
| ------------------------------------------------------------------- | ---------------- | ---------------------------------------- |
| 只在已有包里新增/修改 `.py` 文件                                    | 不需要           | 因为源码目录是实时读取的                 |
| 新增子包，且已在 `packages` / `pyproject.toml` 中被包含(例: 通配符) | 通常不需要       | 只要安装配置已经覆盖到它                 |
| 新增兄弟包/子包，但安装配置没包含它                                 | 需要             | 否则 Python 环境不会把它视为项目的一部分 |

## 第四阶段: 启动 Python，程序才真正开始运行

在项目根目录执行: `uv run python -m my_agent.main`

这条命令可以拆成三个部分:

| 部分             | 作用                                                          |
| ---------------- | ------------------------------------------------------------- |
| uv run           | 在项目管理的环境中 运行命令; 根据配置，必要时会检查或同步环境 |
| python           | 启动对应的 Python 解释器                                      |
| -m my_agent.main | 按模块名查找并运行 my_agent.main                              |

- ❗重要区别:
  1. `python src/my_agent/main.py`: 是按文件路径执行脚本。
  2. `python -m my_agent.main`: 是按模块名运行模块。

  对于采用 src 布局的包，先完成项目安装，再使用 -m 运行，通常更符合规范的开发方式。

### 1. Python 启动后做了什么？

1. 操作系统启动 Python 解释器进程。
2. Python 初始化运行时环境;
   - Python 初始化解释器内部的运行状态，包括模块系统、内置模块和运行配置等。

3. Python 根据启动方式,确定相关模块搜索路径。
4. 找到 my_agent.main 模块。
5. 加载并执行"该模块的顶层代码"。

这里的“顶层代码”非常重要。

❗Python 不会先把整个项目的所有 .py 文件都执行一遍。它先执行指定的入口模块，其他模块通常是在被导入时才加载和执行。

## 第五阶段: Python 怎么找到并加载导入的代码？

模块导入机制，整个过程可以简化为:

<img src='./img/python从安装 -> 代码运行起来2_模块导入与执行流程图.png' alt='模块导入与执行流程图.' width='800'/>

1. sys.path: 搜索路径

   ```python
      import sys
      print(sys.executable) # 当前 Python 解释器的位置。
      print(sys.path)  # 模块导入时使用的搜索路径列表。

      # [
      # '/Users/zhangzy625/Desktop',
      # '/Users/zhangzy625/.pyenv/versions/3.12.4/lib/python312.zip',
      # '/Users/zhangzy625/.pyenv/versions/3.12.4/lib/python3.12',
      # '/Users/zhangzy625/.pyenv/versions/3.12.4/lib/python3.12/lib-dynload',
      # '/Users/zhangzy625/.pyenv/versions/3.12.4/lib/python3.12/site-packages'
      # ]
   ```

   这些路径可能包括:
   - 当前脚本相关的目录或其他启动路径。
   - 标准库目录。
   - 当前虚拟环境的 site-packages。

2. site-packages: 安装包的位置

   ```bash
      .venv/
         └── lib/python3.11/site-packages/
                                  ├── langgraph/
                                  ├── pydantic/
                                  └── my_agent-0.1.0.dist-info/
   ```

   这里的 my_agent-0.1.0.dist-info 主要是安装元数据，不是你业务代码本身。

   对于可编辑安装，项目源码仍然位于原来的 src/my_agent/。环境中的安装配置使 Python 能够找到它。

3. sys.modules: 已经加载的模块
   已经加载过的模块缓存，一个正在运行的程序中修改 .py 文件后，程序通常不会自动更新已经加载的模块。

- 三个特别重要的知识点
  1. 导入本身也可能执行代码。
  2. Python 会缓存已导入的模块。
  3. Python 不需要你逐个安装文件。

## 第六阶段: Python 怎样执行 .py 文件？

找到文件之后，Python 才能加载并执行其中的代码。

```bash
.py 源代码
    ↓
解析与编译
    ↓
Python 字节码
    ↓
CPython 虚拟机执行
    ↓
产生程序行为
```

CPython 会将源代码编译成字节码，再由解释器执行这些操作。

有时你会看到 `__pycache__` 目录:

```bash
my_agent/
├── tools.py
└── __pycache__/
    └── tools.cpython-311.pyc  # .pyc 是缓存的字节码文件，Python 可以在适用时复用它，减少重复编译的开销。
```

注意:

- 不是所有执行场景都会产生 .pyc 文件。
- .pyc 不是普通意义上可独立运行的应用程序。
- Python 仍然需要执行代码，而不只是找到 .pyc 文件就算完成。

安装解决代码在哪里，导入解决如何找到并加载模块，解释器负责执行代码, 这是三个不同的问题。

## 第七阶段: 普通 Python 程序怎样变成一个运行中的服务？

- 一个普通 Python 程序:

  ```python
  def main():
      print("Agent 启动")

  if __name__ == "__main__":
      main()
  ```

  执行: `python -m my_agent.main` Python 找到模块并执行代码 (一次性，跑完退出)。
  当模块以 `__main__` 身份运行时，条件成立，调用 main()，程序输出: `Agent 启动`, 这只是一个执行完就退出的普通程序。

- 如果你希望程序持续提供 HTTP API 服务，还需要启动一个 Web 服务器。

  ```python
  from fastapi import FastAPI

  app = FastAPI()

  @app.get("/")
  def read_root():
      return {"Hello": "World"}
  ```

  安装好依赖后执行: `uv run python -m uvicorn my_agent.main:app --host 127.0.0.1 --port 8000 --reload`
  Uvicorn 会导入 my_agent.main，取得其中的 app 对象，然后启动 HTTP 服务，监听指定端口。

  <img src='./img/python从安装 -> 代码运行起来3_持续服务.png' alt='python持续服务' width='800'/>

  LangGraph 的本地开发服务器也是类似的高层思路: 在准备好 Python 环境和项目依赖后，通过 LangGraph CLI 启动服务，由运行时加载配置中的图和相关应用组件，提供 API。
  不过，LangGraph CLI 的具体启动链路还包含自己的配置解析、图加载和运行时逻辑，并不等于上面这个简单的 Uvicorn 示例。

- 启动 LangGraph 开发服务器

    <img src='./img/启动 LangGraph 开发服务器.png' alt='启动 LangGraph 开发服务器' width='800'/>
    
    ![]()
  1. 启动服务器和执行一次 Agent 是两个不同的阶段:
     - 启动服务器: 准备应用、加载图、监听 HTTP 请求。
     - 执行 Agent: 收到请求后，根据代码调用模型、工具和图节点。

## 八、把所有概念放到一张表里

| 阶段         | 核心问题                      | 对应概念或命令            |
| ------------ | ----------------------------- | ------------------------- |
| 安装 Python  | 谁负责执行代码？              | Python 解释器             |
| 创建虚拟环境 | 代码在哪个环境运行？          | .venv                     |
| 安装依赖     | 第三方库在哪里？              | uv sync、pip install      |
| 安装本地项目 | Python 如何找到自己的项目包？ | pip install -e .          |
| 启动程序     | 从哪里开始执行？              | python -m ...             |
| 导入模块     | 如何找到其他代码？            | import、sys.path          |
| 执行代码     | 函数和语句怎样运行？          | 编译、字节码、解释器执行  |
| 启动服务     | 如何持续接收请求？            | Uvicorn、LangGraph CLI 等 |

| 线索   | 需要回答的问题                       | 关键机制                              |
| ------ | ------------------------------------ | ------------------------------------- |
| 环境线 | 使用哪个 Python，安装了哪些包？      | uv、虚拟环境、site-packages           |
| 导入线 | Python 如何找到 main.py 和其他模块？ | sys.path、包结构、import、sys.modules |
| 执行线 | 找到代码后，程序如何运行？           | 编译、解释器执行、函数调用、服务启动  |

- 环境: 负责提供运行条件，
- 安装: 负责准备依赖和包的可发现性，
- 导入: 负责加载模块，
- 解释器: 负责执行代码，
- 服务器: 负责持续处理请求。
