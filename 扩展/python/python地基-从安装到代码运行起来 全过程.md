# python地基 -- 从“安装 --> 代码运行起来”全过程

## 一、先看完整流程图

<img src='./img/python从安装 -> 代码运行起来.png' alt='python从安装 -> 代码运行起来' width='700' />

1. 安装 Python: 获得 Python 解释器及标准库
   ↓
2. 创建项目和虚拟环境: 项目源码 + .venv + pyproject.toml
   ↓
3. 安装依赖和当前项目: 例如 uv sync、pip install -e .
   ↓
4. 启动 Python 程序: 例如 uv run python -m my_agent.main
   ↓
5. 初始化运行环境并导入模块: 解释器、sys.path、模块查找与加载
   ↓
6. 执行 Python 代码: 函数调用、对象创建、业务逻辑运行
   ↓
7. 进入应用运行状态: 例如启动 LangGraph API 服务，等待请求

## 安装项目依赖

1. `pip install -e .` 或 `uv sync`

```bash
开发目录/
   ├── langgraph-learning/    # ← 项目目录名
   │   ├── src/
   │   │    ├── my_agent/  # ← Python 包名
   │   │    │  ├── __init__.py
   │   │    │  ├── main.py
   │   │    │  ├── requests.py   # ← 你自己写的文件
   │   │    │  └── aa/  # ← Python 子包名
   │   │    │      ├── __init__.py
   │   │    │      └── aa.py
   │   │    │
   │   │    └── my_tools/  # ← Python 包名
   │   │        ├── __init__.py
   │   │        └── helper.py
   │   │
   │   └── .venv/   # ← 项目的虚拟环境
   │         └── lib/
   │             └── python3.11/
   │                 └── site-packages/ # ← Python 的 site-packages 目录
   │                     ├── langgraph/
   │                     ├── pydantic/
   │                     └── my_agent/
   │
   ├── web-api/  # ← 项目目录
   │   ├── src/
   │   │    └── web_api/
   │   └── .venv/
   │
   └── data-tool/  # ← 项目目录
       └── .venv/
```

- Python 套模块搜索机制: 会从一些指定目录中寻找代码，其中就包括当前环境的 site-packages 目录。

- 把 site-packages 理解成: 当前 Python 环境中，第三方 Python 包通常存放的地方。

- Python 运行: 是在当前环境下运行(即 项目目录下的`.venv`目录中)

  我们写的源代码不在`.venv`下，想要运行，需要把源代码放到`site-packages`下。
