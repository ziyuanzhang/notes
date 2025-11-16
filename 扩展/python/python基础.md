# python 基础

第三方库和工具，如 NumPy、Pandas、TensorFlow 和 PyTorch 等

## 编译与执行

- C/C++：源代码 → 编译器 → 机器码（直接由 CPU 执行）
- Java：源代码 → 编译器 → 字节码 → JVM →（JIT 编译为机器码或解释执行）
- Python (CPython)：源代码 → 编译器（Python 解释器） → 字节码 → Python 虚拟机 → 机器指令（纯解释执行，无 JIT）

  **注：** PyPy 是 Python 的另一种实现，带有 JIT（即时编译），会在运行时将热点字节码编译为机器码，提升性能。
