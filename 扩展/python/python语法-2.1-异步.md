# python语法-2.1-异步

asyncio-->AnyIO --> FastAPI、Starlette、HTTPX
FastAPI、Starlette、HTTPX 的异步底层都依赖 AnyIO;
AnyIO 本身也是构建在 asyncio 之上的抽象层;

## 上手 asyncio

核心是理解它的`三个基本动作`和`一个关键陷阱`。
它适合 I/O 密集型任务（如网络请求、文件读写），而不是 CPU 计算。

## 最小可用模板

用 async def 定义协程，用 asyncio.run() 启动。await 只能在 async def 函数内部使用。

```python
  import asyncio

  async def main():
      print("开始")
      await asyncio.sleep(1)   # 模拟 I/O 等待，不会阻塞其他任务
      print("结束")

  asyncio.run(main())
```

asyncio.sleep() 是异步版本的 time.sleep()。如果你在协程里直接写 time.sleep(1)，整个事件循环会被冻结，所有并发任务都会卡住。

## 并发执行多个任务

如果你想同时跑多个协程，不要一个个 await，而是用 asyncio.gather() 或 asyncio.create_task()。

### 方式一：gather（最直接）

```python
  async def fetch(name, delay):
      await asyncio.sleep(delay)
      return f"{name} 完成"

  async def main():
      results = await asyncio.gather(
          fetch("A", 2),
          fetch("B", 1),
      )
      print(results)  # ['A 完成', 'B 完成']，总耗时约 2 秒
```

gather 并发调度所有协程，并按传入顺序返回结果。

### 式二：TaskGroup（Python 3.11+，更推荐）

它提供了结构化并发：如果其中一个任务出错，其余任务会被自动取消。

```python
  async def main():
      async with asyncio.TaskGroup() as tg:
          tg.create_task(fetch("A", 2))
          tg.create_task(fetch("B", 1))
      # 退出 with 块时，所有任务都已完成
```

注意：用 asyncio.create_task() 创建的后台任务，一定要保存返回的 Task 对象引用，否则它可能在执行过程中被垃圾回收。

## 必须避开的坑：不要在协程里调用阻塞函数

- 错误的写法：

```python
  async def bad():
      time.sleep(1)          # 事件循环被冻结 1 秒
      requests.get(url)      # 同样会阻塞
```

- 如果实在要用同步阻塞函数，用 asyncio.to_thread() 把它丢到线程池执行：
  `await asyncio.to_thread(blocking_io_function, arg)`这样事件循环不会被阻塞，可以继续调度其他任务。
