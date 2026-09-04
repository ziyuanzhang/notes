# 3. Redis 的异步客户端

- redis.asyncio = Redis 的异步客户端；Redis 命令本身基本不变，只是需要 await，并且连接池、生命周期、并发模型需要正确处理。
- lazy connection / 惰性连接

```python
    import redis.asyncio as redis
    async def basic_example():
        r = redis.Redis(   # 创建 Redis 客户端对象 --> 准备连接池 --> 暂时不真正建立 socket 连接
            host='localhost',
            port=6379,
            decode_responses=True
        )
        await r.set('foo', 'bar')  # 这时候，才会从连接池获取/建立连接
        value = await r.get('foo')
        print(value)
        await r.aclose()
```

```python
import redis # 同步客户端
@app.get("/user/{id}")
async def get_user(id: int): # async没用，
    # 使用同步 Redis 客户端：网络请求期间，CPU 并没有什么事情可做。
        # 调用会卡住整个线程，事件循环也跟着停转
    user = redis.get(f"user:{id}") # ❌ 添加 await 会报错（await 不能用在非协程上）
    return user
# ==============================================================
import redis.asyncio as redis # 异步客户端
@app.get("/user/{id}")
async def get_user(id: int):
    # 使用异步 Redis 客户端：异步 Redis 的命令返回的是：coroutine（协程对象），而不是："bar"
    user = await redis.get(f"user:{id}")
    return user
```

```bash
请求 A
  ↓
Redis 查询
  ↓
await
  ↓
暂时让出事件循环
             ↓
       请求 B 开始执行
             ↓
       请求 C 开始执行
             ↓
Redis 返回
  ↓
请求 A 继续
```

I/O 密集型场景适合 async；简单脚本、CPU 密集型任务、没有事件循环的项目，通常同步客户端更简单。
