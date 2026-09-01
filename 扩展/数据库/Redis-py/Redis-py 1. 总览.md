# Redis-py 1. 总览

Redis 是数据库/服务端，redis-py 是 Python 程序连接 Redis 的客户端。
python 通过 redis-py 连接 Redis

- 把整篇文档浓缩成一张图

```bash
                    Redis
                     │
             ┌───────┴────────┐
             │                │
          Server           数据结构
             │                │
          6379          ┌─────┼─────┐
             │          │     │     │
             │        String Hash   List ...
             │
             ▲
             │
         redis-py
             │
      ┌──────┴──────┐
      │             │
   同步API       异步API
      │             │
   Redis()     redis.asyncio
      │             │
      └──────┬──────┘
             │
          Python
             │
           FastAPI
```

- MySQL 与 Redis

```bash
                    FastAPI
                       │
             ┌─────────┴─────────┐
             │                   │
           MySQL               Redis
             │                   │
        持久化数据              高速数据
             │                   │
      用户、订单、商品       缓存、Session、锁、
      业务核心数据           计数器、临时状态
```

- 一个典型请求可能是

```bash
客户端
  │
  ▼
FastAPI
  │
  ├── Redis.get("user:1001")
  │       │
  │       ├── 有 → 直接返回
  │       │
  │       └── 没有
  │
  └── MySQL查询
          │
          ▼
       得到数据
          │
          ▼
   Redis.set(...)
          │
          ▼
       返回客户端
```

```bash
redis-py
   ↓
连接池
   ↓
String / Hash / List / Set / ZSet
   ↓
TTL / EXPIRE (失效时间)
   ↓
Pipeline (管道 -- 减少 Python ↔ Redis 之间的网络往返次数)
   ↓
Transaction (事务)
   ↓
SCAN (Scan iteration -- 逐步遍历 Redis 中的数据)
   ↓
Pub/Sub
   ↓
Stream
   ↓
分布式锁
   ↓
缓存设计
   ↓
Redis + FastAPI
   ↓
Redis + MySQL
   ↓
主从 / Sentinel(哨兵) / Cluster(集群)
   ↓
生产环境
```
