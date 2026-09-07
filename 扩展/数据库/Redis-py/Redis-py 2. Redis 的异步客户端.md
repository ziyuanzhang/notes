# 3. Redis 的异步客户端

- redis.asyncio = Redis 的异步客户端；Redis 命令本身基本不变，只是需要 await，并且连接池、生命周期、并发模型需要正确处理。
- lazy connection / 惰性连接
- ❗redis.Redis() 本身就已经管理连接池: 一个 Redis client 实例已经创建并管理自己的 connection pool。

在 asyncio/FastAPI 中，Redis 是一个异步 I/O 资源；应用应该长期持有并共享一个 Redis Client，让 Client 内部的连接池负责并发连接管理；普通 Redis 操作 await，独立 I/O 可以用 gather 并发，而 Pipeline、PubSub 等有状态对象要按 task 隔离。

## 异步流程   redis-py 的 lazy connection（惰性连接）。

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

- 长时间运行的异步应用应该在启动时创建一个 Redis client，然后在所有请求和任务之间共享，在关闭时释放。
- ⚠️直接共享 Redis client，而不是多个 Redis client 共享同一个 ConnectionPool。

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
创建 Redis Client (内部 Connection Pool)
     ↓
整个应用共享
     ↓
处理所有请求
     ↓
FastAPI 关闭
     ↓
关闭 Redis Client / await redis.aclose()

redis_client = redis.Redis(...) # 只创建一次。然后所有请求共用
await redis_client.get(...)
await redis_client.set(...)

a, b, c = await asyncio.gather(
    r.get("a"),
    r.get("b"),
    r.get("c")
)
```

## Pipeline -- ❌ 不应该共享

```python
async with r.pipeline(transaction=True) as pipe:

    pipe.set("a", "1")
    pipe.set("b", "2")
    pipe.get("a")
    pipe.get("b")

    results = await pipe.execute()
```

- pipe.set(...): 实际上只是：把命令放进 pipeline,还没有真正执行 Redis 请求。
- execute() -> 真正发送执行

### asyncio.gather 🆚 Pipeline

gather强调：多个 Redis 操作并发执行；
Pipeline强调：把多个 Redis 命令组织成一批发送/执行

## WATCH：解决多个客户端同时修改同一个数据

乐观锁 Optimistic Locking

```python
await pipe.watch("counter") # 监视 counter
current = int(await pipe.get("counter"))
pipe.multi()
pipe.set("counter", str(current + 1))
await pipe.execute()
```

## PubSub -- ❌ 不应该共享

一个 PubSub 对象不能安全地在多个 task 之间共享。

## Cluster 也支持 async

```python
  # ===== 同步 ==========================================
      import redis
      r = redis.Redis(
          host="localhost",
          port=6379,
          decode_responses=True  #  可以让返回结果从 bytes 转成 Python str
          username="default",
          password="secret",
          ssl=True, # TLS 安全连接(加密)
      )
  # ===== 异步 ==========================================
  from redis.asyncio.cluster import RedisCluster
  rc = RedisCluster(
      host="localhost",
      port=16379,
      decode_responses=True
  )
  await rc.set("foo", "bar")
  value = await rc.get("foo")
  await rc.aclose()  # 或者 async with redis.Redis(...) as r:     ⚠️异步 Redis 使用完以后：关闭客户端。
```

## Timeout：异步 Redis 还能取消操作

##

```bash
              FastAPI
                 │
                 │
          asyncio Event Loop
                 │
       ┌─────────┼─────────┐
       │         │         │
     请求A      请求B      请求C
       │         │         │
       └─────────┼─────────┘
                 ↓
          Redis Client
                 │
           Connection Pool
        ┌────┬────┬────┬────┐
        ↓    ↓    ↓    ↓    ↓
       C1    C2   C3   C4   C5
        │    │    │    │    │
        └────┴────┴────┴────┘
                 ↓
               Redis
```

```bash
Redis Client
    │
    ├── 普通命令
    │      └── await
    │
    ├── gather
    │      └── 多个 I/O 并发
    │
    ├── Pipeline
    │      └── 批量命令
    │
    ├── Transaction
    │      └── MULTI / EXEC
    │
    ├── WATCH
    │      └── 乐观锁
    │
    ├── PubSub
    │      └── 发布/订阅
    │
    └── RedisCluster
           └── Redis 集群
```

整个学习路线

```bash
Redis
│
├── ① 基础连接
│     ├── redis.Redis
│     ├── host
│     ├── port
│     ├── password
│     └── decode_responses
│
├── ② 数据操作
│     ├── String
│     ├── Hash
│     ├── List
│     ├── Set
│     └── ZSet
│
├── ③ Python redis-py
│     ├── set/get
│     ├── hset/hget
│     ├── expire
│     └── delete
│
├── ④ asyncio ⭐ 当前这篇
│     ├── redis.asyncio
│     ├── async/await
│     ├── Connection Pool
│     ├── gather
│     └── lifecycle # 声明周期
│
├── ⑤ Redis 高级
│     ├── Pipeline
│     ├── Transaction
│     ├── WATCH
│     ├── Pub/Sub
│     └── Lua
│
├── ⑥ FastAPI + Redis ⭐
│     ├── lifespan
│     ├── 依赖注入
│     ├── Redis Client
│     ├── Cache
│     ├── Session
│     └── Rate Limit
│
└── ⑦ Redis 生产环境
      ├── Connection Pool
      ├── 主从
      ├── Sentinel
      ├── Cluster
      ├── 高可用
      └── 性能优化
```
