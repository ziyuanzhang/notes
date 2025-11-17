# python 基础

第三方库和工具，如 NumPy、Pandas、TensorFlow 和 PyTorch 等

## 编译与执行

- C/C++：源代码 → 编译器 → 机器码（直接由 CPU 执行）
- Java：源代码 → 编译器 → 字节码 → JVM →（JIT 编译为机器码或解释执行）
- Python (CPython)：源代码 → 编译器（Python 解释器） → 字节码 → Python 虚拟机 → 机器指令（纯解释执行，无 JIT）

  **注：** PyPy 是 Python 的另一种实现，带有 JIT（即时编译），会在运行时将热点字节码编译为机器码，提升性能。

## 字符串

1. () 可以换行

   ```python
    name=("hello"+"world"
     +"!")
   ```

2. m.n 拼接符串：

   - m: 总宽度 -- 小数点占一位，小于总宽度不生效；
   - n: 小数位数（四舍五入）；

   ```python
     print("身高%7.2dcm" % 175.2252) # --> 身高 175.23cm
   ```

3. f_format 字符串格式化

   ```python
     name = "张三"
     height = 175.22
     money = 1000.123456
     print(f"{name},身高{height}cm,工资{money:10.2f}") #--> 张三,身高175.22cm,工资   1000.12
   ```

4. t_format 字符串格式化

## 输入 与 输出

```python
   print("hello world")
   name = input("请输入你的名字：") # input 阻塞程序运行，等待用户输入；返回字符串
   print(f"hello {name}；type {type(name)}")
```

## 数据类型

![python_数据类型](./img/python_数据类型.png)

## 循环

range(start, stop, step)
step：步长
