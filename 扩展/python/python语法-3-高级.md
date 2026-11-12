# python 高级 [原文地址](https://www.bilibili.com/video/BV1Sp4y1U7Jr)

🔥 先看 膜拜大神所得/计算机科学速成课/通用讲解.md


## 字符编码

- 一、 字符编码基础
  1. 数学基础: `2**7=128；2**8=256；2**9=512`
  2. ASCII 码表:
     - 涵盖范围 0-127，是世界上首个字符编码表。
     - 实际只需要 7 位（Bit）二进制即可表示完整，但计算机中通常分配 1 个字节（8位）来存储，多出的 1 位（最高位）主要用于后续扩展或奇偶校验。
     - “向下兼容性”: 后续所有主流的字符编码表（如 GBK、UTF-8 等）都完全兼容 ASCII 码（即全面支持英文和基础符号）。

- 二、输入字符到显示的完整流程（标准版）
  1. 键盘输入阶段: 你按键盘 其实是: “s h a n g” 这些字符属于 ASCII，所以键盘发送的是: ASCII 码（字母）；
  2. 输入法阶段（字符生成）: 输入法（如 Microsoft Pinyin）负责: “ASCII 拼音 → 中文字符”（例: shang → 上）；
     - 这里发生的是: 字符层面的转换；
     - ❗此时还没有存储，只是生成了一个字符。

  3. 字符在计算机中的统一表示（Unicode）: 计算机内部必须统一表示所有字符，于是使用: 👉 Unicode 字符集；
     - Unicode 的作用: “字符 → 编号（码点）”（例: 上 → U+4E0A）；
     - Unicode 只是一个 “抽象编号体系”，并不决定如何存储。

  4. 编码阶段（真正进入内存）: 为了把 Unicode 存入内存，必须使用编码方式，例: UTF-8、UTF-16、UTF-32
     - 上（U+4E0A）→ UTF-8 → E4 B8 8A（二进制）
     - 字符 → Unicode → UTF-8 → 写入内存
     - ❗内存本身没有编码；编码是程序解释这些 0 和 1 的方式。
     - ❗编码属于程序，不属于内存

  5. 程序处理阶段: 软件（如文本编辑器）在内存中处理数据: 复制、粘贴、搜索、计算；这些操作通常基于 Unicode 逻辑。
  6. 显示到屏幕: 内存 UTF-8 → 解码 → Unicode → 字形 → 显示；
     - 解码: 软件根据编码（如 UTF-8）把二进制转换为 Unicode。
     - 字体查找: 字体（如 Microsoft YaHei）负责: “Unicode → 字形（Glyph）”
     - 渲染: 操作系统将字形绘制到屏幕

  7. 保存到文件（硬盘）: 当你按“Ctrl + S”，软件会“Unicode → 指定编码 → 写入文件”（例: UTF-8、UTF-8、UTF-16）
     - ❗如果保存编码不同，可能产生乱码（存储时，必须使用指定的编码，否则，数据会乱码）。

  8. 文件读取: 当再次打开文件“文件 → 按指定编码读取 → Unicode → 内存”
     - ❗如果编码选择错误: 乱码

  ❗乱码的本质: 乱码只有一个原因: 👉 编码和解码不一致
  ❗字符集不支持: 例: 保存日文、韩文选择GBK格式，会出现 直接报错、占位符替换 等数据丢失情况；

- 👉 输入到显示的核心链路: 键盘 → ASCII → 输入法（字符） → Unicode → 编码（UTF-8） → 内存 → 解码 → Unicode → 字体 → 屏幕
- 文件流程:
  1. 保存: 内存中的 Unicode 字符 → 编码（UTF-8 / GBK 等） → 生成二进制字节 → 写入硬盘文件
  2. 读取: 从硬盘读取字节流 → 加载到内存 → 解码（UTF-8 / GBK 等） → 得到 Unicode 字符

- Python 解释器读取文件:
  1. 启动 Python 解释器【类似: 文本编辑器】；
     - 加载 Python 程序 → 内存 → 开始执行；
  2. Python 打开 .py 文件（字节模式）【类似: 加载文件】；
     - Python 首先做的事情是: 以“二进制模式”读取文件，👉 此时 Python 不知道文件是什么编码。它只拿到: 一串字节（bytes）例: E4 B8 8A；
  3. 检测编码声明（关键）:
     - Python 会检查文件前两行，寻找: ` # coding: xxx # -*- coding: xxx -*-`
     - 👉 这一步是在“字节层”完成的。
     - 👉 Python 还没有真正解析代码。
     - 原因: Python 必须先知道编码，才能正确解码。
     - 为什么只扫描前两行？因为历史原因（兼容 Python2）: 编码声明通常在第一或第二行。

  4. 确定编码:
  5. 解码源码为 Unicode: 字节 → 解码 → Unicode
  6. 词法分析（Lexical Analysis）: 例: print('上')会被分解为print、(、'上'、)
  7. 语法分析（Parsing）:生成 AST（抽象语法树）
  8. 编译为字节码: 例: 字节码为`LOAD_CONST CALL_FUNCTION`
  9. 执行: Python 虚拟机执行字节码

  👉 Python 解释器先以字节读取源码，检测编码声明后再解码为 Unicode，然后进行词法和语法分析，最终编译为字节码执行。

```python
# coding=utf-8  #既是注释，又是指令；是告诉解释器，这个文件使用utf-8编码 (不用默认编码)
print('上')
```


## 装饰器

装饰器: 定义一个函数，该函数是用来为其他函数添加额外的功能

在“不修改原函数及调用方式”的情况下，给它添加新功能；

- 开放封闭原则:
  1. 开放: 指对扩展功能是开放的
  2. 封闭: 指对修改源代码是封闭的

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
    print(f'耗时: {stop-start}')
    return res

  # wrapper.__name__ = func.__name__
  # wrapper.__doc__ = func.__doc__
  # ...
  return wrapper

home = outter(home) # 偷梁换柱: 变量home: 指向wrapper函数的内存地址
res = home("hello")
print("返回值",res) # hello

# == 语法糖 ================================================
# 由于语法糖限制: outter函数只能有一个参数（只用来接受被装饰对象的内存地址）；
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
  1. 查找阶段: 由近及远
  2. 执行阶段: 从远端开始，U型（或者洋葱模型）

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


## 递归 (python 没有尾递归)

```python
  import sys;
  sys.getrecursionlimit() # ==> 1000 获取递归深度
  sys.setrecursionlimit(2000) # 设置递归深度
```

- 递归的2个阶段: 递推、回归

回溯: 指的是一种通过“试错”来寻找解的方法；

## 面向过程思想

过程是“流水线”，用“分步骤”来解决问题；

- 面相过程思想:
  - 优点: 复杂问题流程化，进而简单化
  - 缺点: 扩展性非常差

爬虫（Scrapy框架）: 1、目标站点发请求，拿数据；3、数据清洗；4、存数据库
数据分析:

- 匿名函数: fn=lambda 参数: 函数体
  `res = max(obj,key=lambda k:obj[k])`
  `res = map(lambda x:x**2,range(10));res.__iter__();`
  `res = filter(lambda x:x%2==0,range(10));res.__iter__();`
  `res = reduce(lambda x,y:x+y,range(10),0);res.__iter__();`


## 网络编程 -- 参考“Python 网络编程生态.md”

CS架构(Client-Server) 、BS架构(Browser-Server)

ip + MAC + port(端口,应用程序的id)

### 正确理解: 半连接池（SYN Queue）

1. 内存是有限的
2. 每个半连接 ≈ 占用一块内核内存
3. 队列大小有限 = 为了防止资源被耗尽 + 保证系统稳定性
   - 服务器的内存给应用程序划一块内存（A），在这块内存（A）中再划出一块做半连接池；

半连接队列大小是有限的，因为每个连接都会占用内核资源，如果不限制，在高并发或攻击场景下会导致内存和CPU被耗尽，从而拖垮整个系统，因此操作系统通过限制队列大小来保证稳定性。

- 队列大小其实是: “吞吐能力” 和 “抗攻击能力” 的平衡点

```code
📌 工作流程（超重要）

1️⃣ 客户端发 SYN
2️⃣ 服务端:
   - 创建一个“半连接对象”
   - 放入 SYN 队列【半连接池】
   - 返回 SYN+ACK

3️⃣ 如果客户端回 ACK:
   👉 从 SYN 队列移除
   👉 进入 Accept 队列【全连接队列】

4️⃣ 应用程序 accept() 取走连接【应用接管】
5️⃣ 。。。
6️⃣ 应用程序 close()【进入 TIME_WAIT】
7️⃣ 释放


📌 两个队列要分清！

队列                     状态                          作用
------------------------------------------------------------------
SYN 队列（半连接池）       SYN_RECV（半连接）             等 ACK
------------------------------------------------------------------
Accept 队列（全连接池）    ESTABLISHED（已连接）          等应用 accept
------------------------------------------------------------------
                        TIME_WAIT（等待连接彻底关闭）
📌 队列满了会怎样？

1. SYN 队列满:
  * 新 SYN 被丢弃
  * 或 启用 SYN Cookie

2. Accept 队列满:
  * TCP 已建立，但应用不 accept
  * 客户端会感觉:
    👉 连接成功但卡住

```

1. 洪水攻击（SYN Flood）:
   - 本质: 攻击者: 疯狂发 SYN, 但不回 ACK;
   - 结果: 半连接队列被占满, 正常用户无法连接(服务“看起来挂了”);
   - 防御手段:
     1. SYN Cookie（核心）: 不分配内存，直接用算法生成序列号
     2. 增大队列
     3. 限速 / 防火墙

2. 普通个人发起洪水攻击:
   - 数据包会在互联网中经过多跳路由转发（多个路由器），根据网络拓扑和路由协议（如 BGP）动态选择路径。
   - 由于不同路径的延迟、带宽和拥塞情况不同，数据包通常不会同时到达目标服务器，而是呈现出一定的离散性和波动性。

### socket

![网络_五层协议](./img/网络_五层协议.png)
![网络_socket](./img/网络_socket层.png)

1. 🔥 B/S vs C/S
   - B/S = 浏览器帮你用 socket
   - C/S = 你自己写 socket

#### TCP、UDP共用

TCP 和 UDP 的共同点是都基于 socket API，数据都经过内核协议栈和 socket 缓冲区。

1. socket抽象层: 封装应用层以外的所有层；
   - 👉 socket = 操作系统提供的 API，用来操作 TCP/IP 协议栈
   - 🔥 socket 的本质: socket = 应用程序访问 TCP/IP 的入口
   - socket 是“应用程序 ↔ 操作系统网络协议栈”的接口

   ```code
      应用层（浏览器 / App）
           ↓
      socket API
           ↓
      TCP（可靠传输）
           ↓
      IP（路由）
           ↓
      网卡（发包）
   ```

2. 浏览器 帮你封装了 socket【浏览器是 socket 的高级封装 + 协议实现器（HTTP/HTTPS）】

   ```code
   访问: https://google.com 时，
   浏览器内部其实做了:
      * socket()
      * connect()
      * TLS握手
      * 发送HTTP请求
      * 接收响应
   ```

   ✔ 本质: HTTP over TCP（或 QUIC over UDP）

   👉 小补充（高级点）:
   - HTTP/1.1 / HTTP/2 → TCP
   - HTTP/3（QUIC）→ UDP

3. 很多客户端连接会撑爆服务端: 👉 这是高并发的核心问题；
   - 每个连接都占用:
     - 一个 socket（文件描述符）
     - 内核内存（缓冲区）
     - TCP 状态

4. 服务端怎么解决“撑爆问题”？
   1. ✅ IO 多路复用（核心）: 一个线程管理成千上万连接【也适合UDP】
   2. ✅ 连接池 / 限流
   3. ✅ 负载均衡: 把流量分散到多台服务器【也适合UDP】
   4. ✅ 长连接优化: 减少握手次数
   5. ✅ 内核调优: 1、 提高文件描述符上限；2、accept队列；3、半连接队列的最大长度【也适合UDP】

   👉 UDP 也会撑爆（但更轻）

5. ip:
   - 0,0,0,0: 监听所有网卡（是否能访问取决于网络环境）；
   - 127.x.x.x: “本地回环”，永远只在本机内部通信
   - 192.168.x.x: 局域网可访问

6. 发送路径

   ```code
       ① 应用程序
           ↓ send()
       ② 用户态 → 内核态（拷贝）
                   ↓
       ③ Socket 发送缓冲区（Socket在内核中）
           ↓
       ④ TCP/IP 协议栈（分包）
           ↓
       ⑤ DMA 直接写入内存（内核空间）
           ↓
       ⑥ 网卡
           ↓
       ⑦ 网络
   ```

7. 数据接收（从网络到程序）

   ```code
       ① 网卡（NIC）
           ↓
       ② DMA 直接写入内存（内核空间）
           ↓
       ③ 操作系统网络协议栈（TCP/IP）
           ↓
       ④ Socket 接收缓冲区（recv buffer）
           ↓
       ⑤ 应用程序调用 recv()
           ↓
       ⑥ 数据从“内核态”拷贝到“用户态”
   ```

#### TCP 专属

TCP 是面向连接、可靠的流式协议，需要三次握手、四次挥手，有连接状态和队列；

1. 🔥 连接问题:
   - 是否每次握手？ → 看是否复用连接;
   - 会不会撑爆？ → 会（所以才有高并发架构）

2. 一个连接生命周期: 建立 → 使用 → 空闲 → 超时关闭

3. TCP 粘包的本质原因: 是 TCP 是面向字节流的协议，没有消息边界，多个应用层消息在传输过程中可能被合并或拆分。
   - ✅ 解决方法是: 在应用层设计协议来定义消息边界，常见方式包括固定长度、分隔符、以及最常用的“长度字段 + 数据”模式。
   - UDP 是面向数据报的协议，每个数据报在内核中独立存储，recvfrom() 一次读取一个完整报文。

4. 程序结束后: socket会释放，但不是“立刻完全消失”

   🔹阶段1: 程序运行中

   ```code
       你创建 socket
         → 获得 fd（文件描述符）

      如果你不 close:
         → fd 一直占用
         → 数量不断增加
         → 达到系统上限（ulimit -n）
         → 报错: too many open files

      ✅ 运行过程中必须主动 close(不需要时):
         → fd 释放（应用层）
         → 内存释放（内核层）
         → TCP 连接关闭（协议层）
   ```

   🔹阶段2: 程序结束时

   ```code
      进程退出
         → OS（操作系统内核）自动关闭所有 socket（相当于调用 close）【只是“兜底”机制，❌此时会积累很多fd，大量 CLOSE_WAIT（典型 bug），连接堆积】
         → TCP 连接进入四次挥手流程
         → 主动关闭方进入 TIME_WAIT=2 × MSL（通常 1~4 分钟）【客服端、服务端都可能主动close】

      📌关键点:
         ✅ 文件描述符立即释放（退出时兜底）
         ⚠️ TCP 连接: 不会立刻消失【 内核仍然维护连接状态（如 TIME_WAIT）】
         ⚠️ 端口: 可能暂时无法复用: 【 特别是: 主动关闭的一方会进入 TIME_WAIT，占用 (ip, port)】

         不是所有 socket 都进入 TIME_WAIT
            主动关闭方 → TIME_WAIT
            被动关闭方 → CLOSE_WAIT → LAST_ACK → CLOSED
   ```

5. 网络\_socket套接字工作流程

   ![网络_socket套接字工作流程](./img/网络_socket套接字工作流程.png)

   ```code
      【服务端】:   socket → bind → listen →（等待）

      【客户端】:               connect()
                                 ↓
                              三次握手
                                 ↓
      【服务端内核】:   SYN队列 → Accept队列
                                 ↓
      【服务端】:                accept()  从 Accept队列取连接
                                 ↓
                              得到 conn_fd（新socket）
                                 ↓
                              read / write
   ```

   1. socket → 创建“通信端点”
      - 创建一个 socket 结构体；
      - 分配一个 文件描述符 fd；
      - 此时: ❗ 还没有地址；❗ 还不能通信

   2. bind → 绑定“地址和端口”
      - 把 socket 和 IP + 端口 绑定
      - 告诉操作系统: 这个 socket 负责监听哪个地址

   3. listen → 进入“可接收连接状态”（建立队列）
      - 把 socket 变成“监听 socket”
      - 1、创建两个队列【SYN队列（半连接队列），Accept队列（全连接队列）】； 2、状态变化

   4. accept → 从“全连接队列” 取出一个“已完成连接”
      - 本质: 返回一个 新的 socket（conn_fd），这个 socket: 已经建立 TCP 连接，可以 read/write
      - ❗注意: 原来的 fd（listen socket）不变 → 继续负责接收新连接
      - 📌 如果没有连接: accept 会阻塞

```python
#  =======TCP============== 服务端 ========= 简版: 每次发送小于1024字节的数据；单线程（一次只能处理一个链，多个链接需要等待） =================
# 1.一直提供服务
# 2.并发地提供服务
import socket
import subprocess
import struct
# 1. 创建套接字
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM) # 流式协议==》TCP协议  【不写默认TCP协议】
# 2-1. 允许端口复用（避免重启时报错）
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
# 2. 绑定
server.bind(('127.0.0.1', 8080)) # 0-65535,1024以前的都被系统保留使用
# 3. 监听
server.listen(5) # 最多允许挂起5个客户端【已完成连接队列 + 半连接队列的上限（实现相关）】；
print("服务端启动...")

# 第一件事:循环地从“Accept 队列”中 拿 链接对象
while True:
    # 4. 等待客户端连接
    conn_fd, client_addr = server.accept()
    print('客户端ip与端口:', client_addr)
    try:
      #第二件事:拿到链接对象后，与其进行循环通信
      while True:
        # 5. 接收数据
        data = conn_fd.recv(1024) # 1024字节，最大接收的数据量为1024Bytes,收到的是bytes类型【从本地缓存中读取数据】
        if not data:
          print("客户端断开") # 👉 表示: 对方调用了 close()（正常断开）
          break
        print('recv:', data.decode('utf-8'))

        # 6. 发送数据
        obj = subprocess.Popen(data.decode('utf-8'),shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        stdout_data = obj.stdout.read()
        stderr_data = obj.stderr.read()
        total_size = len(stdout_data) + len(stderr_data)

        # 6-1、先发头信息(固定长度的bytes):对数据描述信息
        header = struct.pack('i',total_size)
        conn_fd.send(header) # 【先发给本地缓存】

        # 6-2、再发真实的数据
        conn_fd.send(stdout_data)
        conn_fd.send(stderr_data)


    except Exception as e:
          print("连接异常:", e)
    finally:
          # 7. 关闭连接(❗必须关闭)
          conn_fd.close()
          print("连接关闭")
# 关闭套接字（一般不考虑）
# server.close()
# ====================== 客户端 ===============================
import socket
# 1.初始化
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
  # 2.建立连接
  client.connect(('127.0.0.1', 8080))
  while True:
    # 3.发送数据
    msg = input("输入指令>>: ")
    if msg == 'exit':
          break
      client.send(msg.encode('utf-8'))

    # 4.接收数据
    # 4-1、先收固定长度的头:解析出数据的描述信息，包括数据的总大小total_size
    header = client.recv(4) # 打包‘i’模式，占4个字节
    total_size = struct.unpack('i', header)[0]
    # 4-2、根据解析出的描述信息，接收真实的数据
    recv_size=0
    while recv_size < total_size:
      data = client.recv(1024)
      recv_size += len(data)
      print('data:', data.decode('utf-8'))
finally:
  # 5.关闭连接（❗必须关闭）
  client.close()
```

#### UDP 专属

UDP 是无连接、面向数据报的协议，不保证可靠性，但开销小、延迟低，不存在粘包和连接状态。

```python
# =======UDP============== 服务端 =========
import socket
# 1.初始化
server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# 2-1. 端口复用
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
# 2.绑定
server.bind(('127.0.0.1', 8080))
print("UDP 服务端启动...")
try:
    while True:
      # 3.接收数据
      data, client_addr = server.recvfrom(1024)
      print(f"客户端: {client_addr}")
      print('recv:', data.decode('utf-8'))
      # 4.发送数据
      server.sendto(data.upper(), client_addr)
except Exception as e:
  print("异常:", e)
finally:
  # 5.关闭套接字
  server.close()

# =======UDP============== 客户端 =========
import socket
# 1.初始化
client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
  while True:
    msg = input("输入消息: ")
    if msg == 'exit':
      break
    # 2.发送数据
    client.sendto(msg.encode('utf-8'), ('127.0.0.1', 8080))
    # 3.接收数据
    data, server_addr = client.recvfrom(1024) # 👉 相当于: 从内核 socket buffer 取一个完整数据报（datagram）
    print("recv:", data.decode('utf-8'))
finally:
  # 5.关闭连接（必须关闭）
  client.close()
```

#### TCP VS UDP 区别

1. send / recv vs sendto / recvfrom
   - TCP: send / recv（基于连接）
   - UDP: sendto / recvfrom（必须带地址）

2. 粘包问题
   - TCP: 会粘包（流式）
   - UDP: 不会粘包（报文边界天然存在）

3. TIME_WAIT
   - TCP: 有（主动关闭方）
   - UDP: 没有

4. accept()
   - TCP: 必须 accept
   - UDP: 没有 accept（直接收包）

5. 连接数量 vs 并发
   - TCP: 每个连接一个 socket（重）
   - UDP: 一个 socket 可服务所有客户端（轻）

   👉 这就是: 为什么 DNS / 游戏 / 直播用 UDP

- 🔥 一句话本质区别
  - TCP: 维护“连接状态”（stateful）
  - UDP: 无状态（stateless）

### socketserver模块 -- 服务器【实现并发】

Python 特有: GIL（重点🔥）

- 在 CPython:
  - 👉 同一时刻: 只能有 1 个线程执行 Python 字节码
  - 👉 结果:
    1. 多线程 ≠ 并行（CPU密集）
    2. 多线程适合 IO（网络、文件）

#### socketserver -- TCP

```code -- 生命周期
  client.connect()
     ↓
  server.accept()
     ↓
  创建线程
     ↓
  handle()
     ↓
  while recv/send
     ↓
  客户端关闭 → recv=0
     ↓
  break → close
```

```python
# ================ TCP 服务器 ===========================
import socketserver
class MyTCPHandler(socketserver.BaseRequestHandler):
  def handle(self):
    print("原来的conn_fd:", self.request)
    print("客户端:", self.client_address)
    try:
      while True:
          data = self.request.recv(1024)
          if not data:
            print("客户端断开")
            break
          print("收到:", data)
          self.request.send(data.upper())
    except Exception as e:
        print("异常:", e)
    finally:
      self.request.close() # 对方主动关闭、网络异常、业务逻辑结束、超时 等
      print("连接关闭:", self.client_address)

# 1. 初始化
server = socketserver.ThreadingTCPServer(('127.0.0.1', 8080), MyTCPHandler)
# 2. 启动
print("服务器启动...")
server.serve_forever()
# 等同于
# while True:
#     conn_fd, client_addr = server.accept()
#     创建新线程(handle(conn))
# ============= TCP 客户端 ===========================
import socket
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('127.0.0.1', 8080))
try:
  while True:
    msg = input("输入消息: ")
    if msg == 'exit':
      break
    client.send(msg.encode('utf-8'))
    data = client.recv(1024)
    print("recv:", data.decode('utf-8'))
except Exception as e:
  print("异常:", e)
finally:
  client.close()
  print("连接已关闭")
```

#### socketserver -- UDP

👉 UDP 编程 = “一包一处理”，没有连接、没有循环、没有状态

```python
  # ================ UDP 服务器 ===========================
  import socketserver
  class MyUDPHandler(socketserver.BaseRequestHandler):
    def handle(self):
      data, sock = self.request
      client_addr = self.client_address
      print("客户端:", client_addr)
      print("收到:", data)

      try:
          sock.sendto(data.upper(), client_addr)
      except Exception as e:
        print("异常:", e)

# 1. 创建服务器
server = socketserver.ThreadingUDPServer(('127.0.0.1', 8080), MyUDPHandler)
# 2. 启动
print("服务器启动...")
server.serve_forever()
# 等同于
# while True:
#   conn_fd, client_addr = server.recvfrom(1024)
#   print("收到:", data)
#   server.sendto(data.upper(), client_addr)

# ============= UDP 客户端 ===========================
import socket
client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
  while True:
    msg = input("输入消息: ")
    if msg == 'exit':
      break

    client.sendto(msg.encode('utf-8'), ('127.0.0.1', 8080))
    data, server_addr = client.recvfrom(1024)
    print("recv:", data.decode('utf-8'))
    print("来自:", server_addr)
except Exception as e:
  print("异常:", e)
finally:
  client.close()
  print("客户端关闭")
```

## ------ 接下来课程安排 ------

- 并发编程(3~4d)
- 小项目(2~3d)
- 数据库(MySQL)5d
- 前端7d
- django框架(10d)
- bbs项目(3~5d)
- 代码发布(5d)
- CMDB(5d)


## 队列 与 管道

- 队列（Queue）: 高级封装，安全、好用（推荐）
  1. 👉 Queue = Pipe + 锁 + 缓冲 + 封装

     ```code
       Queue.put() --> pickle序列化 --> 写入 Pipe --> 另一端读取 --> 反序列化

       Queue
        ├── Pipe（管道）
        ├── Lock（锁）
        ├── Buffer（缓冲区）
        └── pickle（序列化）
     ```

- 管道（Pipe）: 底层通信工具，更轻量但更原始
  1. Pipe 本质就是: 👉 两个端点的连接（socket/管道）  
     `parent_conn  ⇄  child_conn`

- Queue 是基于 Pipe 的进程安全通信队列，而 Pipe 是更底层的双向通信通道。
- IPC（进程间通信）

| 对比           | Queue              | Pipe             |
| -------------- | ------------------ | ---------------- |
| 抽象层级       | 高级               | 低级             |
| 是否安全       | ✅ 安全            | ❌ 不安全        |
| 是否支持多进程 | ✅ 多生产者/消费者 | ❌ 只适合2个端点 |
| 是否有锁       | ✅ 有              | ❌ 没有          |
| 性能           | 较慢               | 更快             |
| 使用难度       | 简单               | 稍复杂           |

### 队列 Queue -- 会 阻塞

- 🔥 Python3 中的两种 Queue:
  1. 线程用的队列;
  2. 进程用的队列

  | 对比           | queue.Queue | multiprocessing.Queue |
  | -------------- | ----------- | --------------------- |
  | 用途           | 线程间通信  | 进程间通信            |
  | 是否跨进程     | ❌ 不可以   | ✅ 可以               |
  | 是否需要序列化 | ❌ 不需要   | ✅ 需要（pickle）     |
  | 性能           | 快          | 相对慢                |

```python
# ===== 进程队列=======================================
from multiprocessing import Queue
q = Queue(5) # 括号内可以放数字来限制队列的大小; 不传则，默认32767个
q.put(111) # 放数据: 当队列满了，继续放会阻塞，直到有位置让出来， ❗不会报错；
q.get() # 取数据: 当队列空了，继续取会阻塞；
q.get(timeout=3) # 取数据: 没有数据之后原地等待三秒,之后再报错 queue.Empty

# *********** 以下方法 ❗不精确，不是实时的 ************
q.empty() # 判断队列是否为空（❗不精确，不是实时的）
q.get_nowait() # 取数据: 不会阻塞，如果队列中没有数据，直接报错queue.Empty（❗不精确，不是实时的）
# ===== 线程队列=======================================
from queue import Queue, LifoQueue, PriorityQueue

q2 = Queue()
q2.put(1)
q2.get()

q3 = LifoQueue(4)  # 后进先出


q4 = PriorityQueue(4)  # 优先级高的先执行
# put括号内放一个元祖;第一个放数字表示优先级; 需要注意的是: 数字越小优先级越高!!!
q4.put((11, "111"))
q4.put((22, "222"))
q4.put((0, "0"))
q4.put((-5, "-5"))
print(q4.get())  # (-5,'-5')
```

- 📌 特点:
  - ✅ 线程/进程安全
  - ✅ FIFO（先进先出）
  - ✅ 自动加锁
  - ✅ 自动处理并发
  - ❗ 底层用 pickle（有开销）

- 👉推荐场景:
  - 多个生产者 + 多个消费者
  - 任务调度
  - 并发安全要求高

#### 进程间通信IPC机制

```python
  def task(q):
     q.put('呼叫！呼叫！')
     prtint('hahahah')

  if __name__ == '__main__':
    q = Queue()
    p = Process(target=task, args=(q,))
    p.start()
    print(q.get()) # 呼叫！呼叫！
```

#### 生产者-消费者模型（Queue）

```python
from multiprocessing import Process, Queue

def producer(q):
    for i in range(5):
        q.put(i)

def consumer(q):
    while True:
        print(q.get())

if __name__ == "__main__":
    q = Queue()

    Process(target=producer, args=(q,)).start()
    Process(target=consumer, args=(q,)).start()

```

#### JoinableQueue

JoinableQueue: 是'带任务完成确认机制'的队列，通过 task_done() 和 join() 实现任务同步。

```python

from multiprocessing import Process, JoinableQueue
import time

def worker(q):
    while True:
        task = q.get()
        if task is None:
            break

        print(f"处理任务: {task}")
        time.sleep(1)

        q.task_done()  # 🔥 完成任务（消费者调用）

if __name__ == "__main__":
    q = JoinableQueue() # 👉  内部维护一个: “未完成任务计数器”

    # 启动消费者
    for _ in range(2):
        p = Process(target=worker, args=(q,))
        p.daemon = True
        p.start()

    # 生产任务
    for i in range(5):
        q.put(i) # 放任务

    q.join()  # 🔥 等待所有任务完成（生产者调用）
    print("所有任务完成")
```

流程:

```code
  put()        → +1
  task_done()  → -1
  join()       → 等待计数器变为 0
```

### 管道 Pipe -- 多个进程同时send(): 数据错乱/崩溃

- 📌 特点:
  - ✅ 双向通信
  - ✅ 速度更快（比 Queue）
  - ❌ 不安全（多进程同时用会出问题）
  - ❌ 没有锁

- 👉 推荐场景:
  - 只有两个进程通信
  - 对性能要求极高
  - 你能控制并发（不会同时写）

```python
  from multiprocessing import Process, Pipe

  def worker(conn):
      conn.send("hello")
      conn.close()

  if __name__ == "__main__":
      parent_conn, child_conn = Pipe()

      p = Process(target=worker, args=(child_conn,))
      p.start()

      print(parent_conn.recv())
      p.join()
```


## 协程(Coroutine) -- asyncio模块（内置标准库）、gevent模块（第三方） -------------

🔥 协程本质是: 协作式切换（cooperative），不是抢占式;

asyncio 的本质 = 事件循环 + epoll（IO多路复用） + 协程（状态机）

把 asyncio 想成: 一个调度中心（事件循环） + 一堆任务;

async/await 不是消灭回调，而是把“回调逻辑”隐藏进编译器和事件循环里，让你用顺序代码表达异步流程。

```python
import asyncio

async def task(name):  # 定义协程函数
    print(f"{name} 开始")
    await asyncio.sleep(2)  # 含义不是“阻塞”，而是❗“我现在要等，可以切去执行别的任务”
    print(f"{name} 结束")

async def main():
    t1 = asyncio.create_task(task("A"))  # 把协程放进“调度队列”，并发执行
    t2 = asyncio.create_task(task("B"))
    await asyncio.gather(t1, t2)

asyncio.run(main())  # 启动事件循环（event loop）

# 任务执行
#   ↓
# 遇到 await（IO/等待）
#   ↓
# 主动让出控制权
#   ↓
# 事件循环去执行别的任务
```

❗不是所有函数都能 await: `await time.sleep(2)` ❌  
必须是: `await asyncio.sleep(2)` ✅

👉 原因: 只有“异步函数”才能被调度

- 线程/进程 → 抢占式并发
- Condition → 线程协作
- asyncio/gevent → 协程并发

### 演进链路: 阻塞 → select → epoll → 事件循环 → asyncio ------------------------

asyncio 的本质 = 事件循环 + epoll（IO多路复用/IO注册机制） + 协程（状态机）；

asyncio 基于事件循环，通过 epoll/select 监听 IO 事件，在协程遇到 await 时挂起任务，等内核通知后再恢复执行，本质上是通过状态机和回调机制实现的单线程高并发模型。

1. 1️⃣ 阻塞 IO（最原始）
   - 一个连接在等 → 整个线程卡住
   - 并发能力极差

2. 2️⃣ select（多路复用）
   - 一次性监听多个 socket
   - ❗ 每次都要全量扫描（O(n)）
   - ❗ 连接数大时性能差

   👉 本质: 轮询

3. 3️⃣ epoll（Linux独有）  
   👉 核心升级:
   - ✅ 事件驱动（不是轮询）
   - ✅ 只返回“有事件的 socket”
   - ✅ 注册一次，长期监听

   epoll 本质: 内核级事件通知器（IO多路复用）

   epoll 负责什么？
   - 告诉你: 哪些 socket 可读/可写
   - ❗不执行你的代码
   - ❗不负责调度

4. 事件循环（Event Loop）:
   - 解决的问题: “拿到事件之后，谁来调度执行？”
   - 本质: 一个任务调度器
   - 事件循环在干嘛？

     ```bash
       while True:
          1. 等 IO 事件（epoll/select）
          2. 拿到就绪 socket
          3. 执行对应任务（协程）
          4. 遇到 await → 挂起
     ```

5. 协程关键特性
   - async def: 可暂停函数
   - await: 主动让出执行权

6. 🔥 核心执行流程（必须掌握）

   ```bash
      1. 执行协程
      2. 遇到 await reader.read()

      3. asyncio:
         - 注册 socket 到 epoll
         - 告诉内核: 有数据再通知

      4. 当前协程挂起（让出 CPU）

      5. 事件循环执行其他协程

      6. 某一刻: socket 有数据

      7. epoll 通知事件循环

      8. 事件循环: 找到对应协程 → 恢复执行

      9. await 返回数据 → 继续执行
   ```

   一句话总结: await = “先挂起，等 IO 好了再回来继续”

7. async/await 的本质: 语法糖（回调 + 状态机）
   本质拆解:
   - 异步流程 = 回调链
   - async/await = 把回调写成顺序代码

   👉 等价思想:
   - await 前 → 发起 IO
   - await 后 → IO 完成后的回调

8. 协程本质: 可暂停 + 可恢复的函数（状态机）
   - 核心一句话: async/await 不是消灭回调，而是隐藏回调

9. 完整链路（终极版🔥）

   ```bash
     socket（网络 IO）
         ↓
     epoll（谁准备好了）
         ↓
     event loop（调度执行）
         ↓
     coroutine（执行任务）
         ↓
     await（挂起 & 恢复）
   ```

10. 把“角色分清楚”（非常关键）

    | 组件       | 作用         |
    | ---------- | ------------ |
    | epoll      | 通知谁有数据 |
    | event loop | 调度执行     |
    | asyncio    | 提供编程模型 |
    | coroutine  | 执行任务     |

11. 记忆口诀
    - epoll: 负责看
    - loop: 负责转
    - await: 负责让
    - 协程: 负责干

### 协程实现TCP服务端的并发效果(了解)

## IO模型

- IO 的两个阶段
  1. 阶段1: 等待数据准备好（wait data）;
     - 例: 等客户端发数据、等网卡收到数据（网卡 -> 内核 socket buffer）、等磁盘把数据读到“内核缓冲区（内存）”
     - ❗此时: 数据还在内核里
     - ❗程序最常卡在这里

  2. 阶段2: 把数据从内核拷贝到用户空间（copy data）;
     - 例: 内核buffer -> 用户进程buffer（例: Python进程内存）
     - 这个阶段通常比较快。

- 五种IO Model
  1. 阻塞IO(blocking IO): “等待数据”和“拷贝数据” 两个阶段 线程都被阻塞;
  2. 非阻塞IO(non-blocking IO): 疯狂轮询 内核缓冲区(kernel) 数据准备好了没有,如果数据未准备好，立即返回。
     - 若单独使用，通常需要不断轮询，会造成 CPU 浪费（busy polling）；因此通常会配合 IO 多路复用（select/poll/epoll）一起使用。

  3. 多路复用IO(multiplexing IO)/事件驱动IO(event driven IO): 内核负责: 帮你监视哪些连接有事件，而不是程序自己疯狂轮询。
     - select: 每次都全量扫描，有最大连接数限制;
     - poll: 每次都全量扫描，解决了最大连接数限制;
     - epoll：1. 红黑树：管理所有监听fd; 2. 就绪队列：只保存有事件的fd; 3. 有事件才通知用户程序
     - epoll 本质仍然是"同步IO"；因为: 最后数据复制，仍然需要用户程序自己 recv()，内核只是: 通知你“可以读了”；
     - asyncio = 事件循环 + IO多路复用 + 协程调度
     - 真正解决 IO 等待的是 epoll/kqueue/IOCP；协程解决的是："用户态"任务切换成本低(即: 线程切换成本)。

  4. 异步IO(asynchronous IO): 真·异步
     - 内核: 1、等待数据 + 2、接收数据 + 3、完成数据拷贝 + 4、完成后通知用户程序；
     - Linux：POSIX AIO（较弱）io_uring（现代高性能）；Windows：IOCP（成熟且强大）

  5. 信号驱动IO（signal driven IO）: 【不常用-了解】

- 五种 IO Model 本质区别: 这两个阶段谁在等？谁在通知？谁负责拷贝？”

- ”同步/异步“和”阻塞/非阻塞“: 是两个完全不同维度。

- 同步/异步: 描述的是“IO完成方式”。
- 同步IO：用户程序必须主动参与IO过程（如主动recv/read）,(内核通知用户程序“数据已就绪（readable）”，随后用户程序主动调用 recv/read 获取数据。);
- 异步IO：内核完成整个IO后主动通知用户程序,( 内核帮你完成 “网络数据接收 + 数据拷贝（recv + copy）“);

- 阻塞IO: 傻等
- 非阻塞IO: 疯狂问
- 阻塞/非阻塞: 调用期间线程会不会挂起；

- IO多路复用: 等通知
- 异步IO: 全自动
- 信号驱动IO: 发短信通知你

- 就绪（ready）vs 完成（completion）: 这是epoll 和 AIO 的本质区别
  1. IO 多路复用: 通知的是：ready（可读了）即：“现在你可以 recv 了”; 但：数据可能还没拷贝到用户空间, 所以：你还得：recv();
  2. 异步IO: 通知的是：completion（完成了）即：“数据已经放你buffer里了”,你不用再主动读。

- Reactor（反应堆） vs Proactor（完成端口）
  1. Reactor（反应堆）: 核心：“事件来了，你自己处理”; 流程：epoll_wait --> 事件就绪 -->用户程序 recv;
     - 本质：同步IO模型

  2. Proactor（完成端口）: 核心：“IO完成了，我通知你”;流程：提交异步IO --> 内核完成IO --> 通知用户程序
     - 本质：异步IO模型

- 用户态/内核态切换：用户程序调用系统调用（如 recv/read/write）时，CPU需要从用户态切换到内核态；频繁切换会带来较大性能开销。
- 零拷贝（Zero Copy） 目标：
  1. 减少数据复制次数
  2. 减少用户态/内核态切换

- DMA（Direct Memory Access - 直接内存访问）:
  1. 为什么网卡/磁盘速度能快？
     - 因为：数据不是CPU一字节一字节搬运, 而是：DMA控制器直接搬运;
     - 例：磁盘 → 内存,网卡 → 内存;
     - 很多时候：CPU只是“指挥”,不是亲自复制数据。

  2. 所以真正昂贵的是： kernel buffer ↔ user buffer 因为：这通常需要：
     - CPU参与
     - 内存copy
     - 上下文切换

- 📌数据流向：
  1. 磁盘文件发送到网络（send）:
     - 传统IO: 特点：1. 存在多次数据拷贝; 2. 以及多次用户态/内核态切换

       ```bash
         磁盘
          ↓
         kernel buffer（Page Cache）
          ↓ copy_to_user
         user buffer【属于：用户空间（user space）】
          ↓ copy_from_user
         socket buffer【属于：内核空间（kernel space）】
          ↓ DMA
         网卡
       ```

     - ❗零拷贝: 特点：1、绕过 user buffer; 2、减少 copy 和上下文切换

       ```hash
         磁盘
          ↓
         kernel buffer
          ↓
         socket buffer
          ↓ DMA
         网卡
       ```

  2. 网络数据接收（recv）:

     ```hash
          网卡
           ↓ DMA
          kernel socket buffer
           ↓ copy_to_user
          user buffer
     ```

     ❗注意：数据先进入内核 socket buffer；在 copy_to_user 之前，用户程序无法直接访问数据。

- 对比

  | 模型       | 等待阶段         | 拷贝阶段      | 通知类型       | 是否主动read/recv | 是否阻塞         | 本质       |
  | ---------- | ---------------- | ------------- | -------------- | ----------------- | ---------------- | ---------- |
  | 阻塞IO     | 阻塞等待         | 阻塞拷贝      | 无             | 是                | 是               | 同步阻塞   |
  | 非阻塞IO   | 轮询             | 阻塞拷贝      | 无             | 是                | 不阻塞等待       | 同步非阻塞 |
  | IO多路复用 | epoll/select等待 | 用户read/recv | ready通知      | 是                | 可阻塞在事件等待 | 同步非阻塞 |
  | 信号驱动IO | SIGIO通知        | 用户read/recv | ready通知      | 是                | 不阻塞等待       | 同步非阻塞 |
  | 异步IO     | 内核完成         | 内核完成      | completion通知 | 否                | 不阻塞           | 异步非阻塞 |

- Linux高性能编程五大核心优化方向
  1. 不阻塞线程
  2. 减少线程切换
  3. 减少数据拷贝
  4. 减少系统调用
  5. 减少用户态/内核态切换

- “高并发”真正解决的不是“处理数据快”，而是: “不要让线程傻等IO”；
  本质都在解决：不要让CPU把时间浪费在“等待IO”上
  因为: CPU其实很快
  真正慢的是:
  1. 网络
  2. 磁盘
  3. 数据库

- 高性能服务器本质上都在做：
  1. 把“等待”交给内核
  2. 把CPU时间留给真正的业务处理

- 现代高性能 IO 的核心目标：
  1. 不让线程阻塞等待IO
  2. 不做无意义的数据拷贝
  3. 不频繁切换用户态/内核态
  4. 不频繁创建和切换线程
  5. 让CPU只处理真正有价值的任务

  这其实就是：Linux高性能网络编程的主线。

| 技术     | 本质                         |
| -------- | ---------------------------- |
| Redis    | Reactor + epoll              |
| Nginx    | 多Reactor + epoll + sendfile |
| asyncio  | Reactor + 协程               |
| Go       | netpoll + GMP调度            |
| Netty    | Reactor                      |
| Kafka    | page cache + sendfile        |
| io_uring | 新一代异步IO                 |
| IOCP     | Proactor                     |
