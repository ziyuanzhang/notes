# python相关扩展

❗ 👉 🔥 1️⃣ ❌ ✅ ⚠️ 📌 🚀 👍

⚠️ 1. xx是什么？2. 为什么有它？3. 怎么用？

## 管理工具

| 排名    | 工具                 | 定位                           | 评价              | 镜像体积   | 冷启动时间    | 构建时间     |
| ------- | -------------------- | ------------------------------ | ----------------- | ---------- | ------------- | ------------ |
| 🥇 NO.1 | **uv**               | 全家桶（环境 + 包管理 + 构建） | 🚀 未来标准       | 100∼180MB  |    1.2∼2.8s   |  <45s        |
| 🥈 NO.2 | **venv + pip-tools** | 稳定组合                       | 🧱 企业保守首选   |   90∼150MB |     1.8∼3.5s  |    <90s      |
| 🥉 NO.3 | **poetry**           | 项目管理                       | ⚠️ 逐渐被 uv 替代 | 450∼800MB  |    8∼15s      |     3∼7min   |
| ❌ NO.4 | **pipenv**           | 已过气                         | 基本淘汰          | 600MB+     |     12s+      |      5min+   |
| 💀 NO.5 | **conda**            | 科学计算                       | ❗仅限特定领域    | 1.2∼3GB    |    25∼60s     |      8∼20min |

- 👉 一句话：uv = Python 世界的 npm + cargo；
- 👉 conda 是“重型武器”，不是日常工具（AI / 数据科学）；
  - conda 解决的是 系统级依赖（C库）；
  - pip/uv 解决不了 CUDA / MKL / BLAS；
- Ruff 正在成为 Python 的 eslint

| 产品名称 | 核心功能         | 替代的传统工具                             | 核心优势                                                                       |
| :------- | :--------------- | :----------------------------------------- | :----------------------------------------------------------------------------- |
| uv       | 包管理与环境管理 | `pip`, `pip-tools`, `Poetry`, `virtualenv` | 极速解析依赖（毫秒级），自动管理虚拟环境，不仅是安装器，更是项目构建工具。     |
| Ruff     | 代码检查与格式化 | `Flake8`, `Black`, `isort`, `pydocstyle`   | 速度比传统工具快 10-100 倍，内置 800+ 条规则，支持自动修复，是目前的行业标准。 |
| ty       | 静态类型检查     | `mypy`, `pyright`                          | Astral 较新的产品，专注于在大型代码库中进行高性能的全局类型安全扫描。          |

| 类别     | 传统/内置工具                   | 推荐现代工具 | 核心优势                   |
| :------- | :------------------------------ | :----------- | :------------------------- |
| 代码质量 | Flake8, Black, isort,pydocstyle | Ruff         | 极速，多合一               |
| 包管理   | pip, virtualenv                 | uv           | 毫秒级安装，统一环境       |
| 命令行   | argparse, click                 | Typer        | 基于类型提示，开发极快     |
| 终端显示 | print                           | Rich         | 漂亮的表格、颜色、Markdown |
| 数据处理 | Pandas                          | Polars       | Rust 内核，更快更省内存    |
| HTTP请求 | requests                        | httpx        | 支持异步，现代标准         |
| 数据校验 | 手动 if/else                    | Pydantic     | 自动类型检查，安全可靠     |

### 总结建议

如果你是一个追求现代化开发体验的 Python 开发者，我推荐的“2026 黄金组合”是：

- ✅ 必选
  - 包管理：uv
  - 代码质量：Ruff

- ✅ 强烈推荐
  - 类型检查：pyright
  - CLI：Typer
  - 输出：Rich
  - 数据模型：Pydantic v2
  - HTTP：httpx

- ✅ 数据场景
  - 新项目：Polars
  - 旧项目：Pandas

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

## PyCharm 插件

file--> settings--> plugin (安装完重启 pycharm)

1. 代码统计（Statistics）: 按完在pyCharm左下角，点击-->刷新（refresh）查看；
2. 错误检查（Inspections/ Code Inspection）: 内置；
3. 错误修复（Quick Fix）: 内置；
4. Rainbow Brackets (彩虹括号)：
5. SonarLint (代码体检)：比 PyCharm 自带的检查更严格；
