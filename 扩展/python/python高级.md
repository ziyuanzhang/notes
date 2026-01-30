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
