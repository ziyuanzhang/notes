# 3. Redis 的异步客户端

- redis.asyncio = Redis 的异步客户端；Redis 命令本身基本不变，只是需要 await，并且连接池、生命周期、并发模型需要正确处理。
- lazy connection / 惰性连接
- ❗redis.Redis() 本身就已经管理连接池: 一个 Redis client 实例已经创建并管理自己的 connection pool。

## 异步流程

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

## 同步 vs 异步

```python
    import redis.asyncio as redis
    async def basic_example():
        r = redis.Redis(   # 创建 Redis 客户端对象 --> 准备连接池 --> 暂时不真正建立 socket 连接
            host='localhost',
            port=6379,
            decode_responses=True,
            max_connections=10 # 默认1000， 并发数量，最多能"排队"10个请求；
        )
        await r.set('foo', 'bar')  # 这时候，才会从连接池获取/建立连接
        value = await r.get('foo')
        print(value)
        await r.aclose()
```

- 并发 = 一个线程交替处理多个任务（靠切换）
- 并行 = 多个线程/进程同时执行（靠多核）
- Redis 是单线程模型（核心命令处理始终是单线程的），它天然就是靠并发（而非并行）来处理请求的。

```python
# ===== 同步客户端 =========================================================
import redis # 同步客户端
@app.get("/user/{id}")
async def get_user(id: int): # async没用，
    # 使用同步 Redis 客户端：网络请求期间，CPU 并没有什么事情可做。
        # 调用会卡住整个线程，事件循环也跟着停转
    user = redis.get(f"user:{id}") # ❌ 添加 await 会报错（await 不能用在非协程上）
    return user
# ====== 异步客户端 ========================================================
import redis.asyncio as redis # 异步客户端
@app.get("/user/{id}")
async def get_user(id: int):
    # 使用异步 Redis 客户端：异步 Redis 的命令返回的是：coroutine（协程对象），而不是："bar"
    user = await redis.get(f"user:{id}")
    return user
```

## 连接池

长时间运行的异步应用应该在启动时创建一个 Redis client，然后在所有请求和任务之间共享，在关闭时释放。

```python
# ==== ❌ 错误思路 =========================================================
@app.get("/user/{id}")
async def get_user(id: int):
    r = redis.Redis(...)
    value = await r.get(f"user:{id}")
    await r.aclose()
    return value

# 请求1 → 创建 Redis → 查询 → 关闭
# 请求2 → 创建 Redis → 查询 → 关闭
# 请求3 → 创建 Redis → 查询 → 关闭
# ....
# ==== ✅ 正确的 FastAPI 思路 ==================================================================
FastAPI 启动
     ↓
创建 Redis Client
     ↓
Redis Client
     ↓
内部 Connection Pool
     ↓
所有请求共享
     ↓
FastAPI 关闭
     ↓
关闭 Redis Client

redis_client = redis.Redis(...) # 只创建一次。然后所有请求共用
await redis_client.get(...)
await redis_client.set(...)
```
