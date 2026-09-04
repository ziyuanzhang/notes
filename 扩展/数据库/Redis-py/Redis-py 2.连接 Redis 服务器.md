# 2. 连接 Redis 服务器

- 最基础的 Redis 连接 → 集群连接 → TLS 安全连接 → 客户端缓存 → 连接池 → 重试 → 云 Redis 的故障迁移
- 一个 Redis client 实例已经创建并管理自己的 connection pool。
- redis.Redis 不是 Redis 数据库本身。它是：Python 程序访问 Redis 的客户端对象。

## 最基础的 Redis 连接

```python
    import redis
    r = redis.Redis(
        host="localhost",
        port=6379,
        decode_responses=True  #  可以让返回结果从 bytes 转成 Python str
        username="default",
        password="secret",
        ssl=True, # TLS 安全连接(加密)
    )
```

- Python → redis.Redis → TCP连接 → Redis Server

## Redis Cluster（集群连接 -- 服务端的）

```python
    from redis.cluster import RedisCluster
    rc = RedisCluster(
        host="localhost",
        port=16379
    )
```

```bash
                  Redis Cluster
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
   Primary 1       Primary 2       Primary 3
       │               │               │
   Replica 1       Replica 2       Replica 3



```

- RedisCluster 会知道： 这个 key 属于哪个节点 → 应该连接哪个 Redis;
  - 客户端会根据 Redis Cluster 的槽位规则找到正确节点。

## 客户端缓存

```python
  protocol=3  # Redis 有不同的通信协议版本。表示使用：RESP3, 客户端缓存需要 RESP3。
  cache_config=CacheConfig()
  # ======================

  cache = r.get_cache()
  cache.delete_by_redis_keys(["person:1"]) # 删除‘客户端缓存’中与 person:1 相关的缓存；不是服务端。

  cache.flush() # 清空客户端缓存。

  r.flushdb() # 清空 Redis 当前 DB
```

## Connection Pool（连接池 -- 程序端的）

Connection Pool 是生产环境非常重要的机制，用来复用 Redis TCP 连接。
❗共用一个连接池

```bash
连接池
  │
  ├── connection 1
  ├── connection 2
  └── connection 3

r1.close()
  ↓
connection 1 → 回池(把连接归还给连接池)

pool.close()
  ↓
连接池真正关闭
```

## 重试

生产环境一般需要：有限次数 + 退避时间 + 超时

##

```bash
                    Python Application
                           │
                           ▼
                      redis-py
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         Redis()       RedisCluster   ConnectionPool
              │            │            │
              │            │            │
              ▼            ▼            ▼
           单机 Redis    Redis Cluster   连接复用
              │            │
              │            ├── Primary
              │            └── Replica
              │
              ▼
        ┌──────────────┐
        │ Redis Data   │
        │              │
        │ String       │
        │ Hash         │
        │ List         │
        │ Set          │
        │ ZSet         │
        └──────────────┘
```

```python
                     Python
                       │
                   redis-py
                       │
              ┌────────┴────────┐
              │                 │
          Connection Pool      Retry
              │                 │
              └────────┬────────┘
                       │
                      TLS
                       │
                       ▼
                    Redis
```

##

```bash
① Redis 基础
   ↓
② redis-py 基本连接
   ↓
③ String
   ↓
④ Hash
   ↓
⑤ List
   ↓
⑥ Set
   ↓
⑦ Sorted Set
   ↓
⑧ Key / TTL / Expire
   ↓
⑨ Redis 原子操作
   ↓
⑩ Pipeline / Transaction
   ↓
⑪ Lua Script
   ↓
⑫ Pub/Sub
   ↓
⑬ Stream
   ↓
⑭ Redis 持久化
   ↓
⑮ RDB / AOF
   ↓
⑯ 主从复制
   ↓
⑰ Sentinel
   ↓
⑱ Cluster
   ↓
⑲ Python Connection Pool
   ↓
⑳ FastAPI + Redis
   ↓
㉑ 缓存设计
   ↓
㉒ 缓存穿透 / 击穿 / 雪崩
   ↓
㉓ 分布式锁
   ↓
㉔ 高并发与生产实践
```
