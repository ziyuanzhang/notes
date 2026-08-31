# redis (Remote Dictionary Server -- 远程字典服务器)

[中文文档](https://redis.com.cn/)

Redis = “超级快的内存数据库 + 数据结构工具箱”
本质上：Redis是“基于 epoll 的事件驱动服务器”

Redis = “加速层”，MySQL = “最终存储”

## 安装后的结构

- redis-benchmark: 性能测试工具，服务启动后运行该命令，看看自己本子；
- redis-check-aof: 修复有问题的AOF文件，rdb和aof后面讲；
- redis-check-dump: 修复有问题的dump.rdb文件；
- redis-cli: 客户端，操作入口；
- redis-sentinel: redis集群使用；
- redis-server: Redis服务器启动命令；

## Redis 数据结构

| 类型                   | 用途       |
| ---------------------- | ---------- |
| string                 | 缓存、计数 |
| hash                   | 对象       |
| list                   | 队列       |
| set (集合)             | 去重       |
| zset（有序集合）       | 排行榜     |
| GEO (地理空间)         | 地图       |
| HyperLogLog (基数统计) | 去重统计   |
| bitmap (位图)          | 存         |
| bitfield (位域)        |            |
| 等。。。               |            |

String:可以存：字符串、数字、JSON

## Redis 键（key）

- `keys *`: 查看当前库所有的key;
- exists key: 判断某个key是否存在;
- type key: 查看你的key是什么类型;
- del key: 删除指定的key数据;
- unlink key: 非阻塞删除，仅仅将keys从keyspace元数据中删除，真正的删除会在后续异步中操作;
- ttl key: 查看还有多少秒过期，-1表示永不过期，-2表示已过期;
- expire key秒钟: 为给定的key设置过期时间;
- move key dbindex【0-15】: 将当前数据库的key移动到给定的数据库db;
- select dbindex: 切换数据库【0-15】，默认为0;
- dbsize: 查看当前数据库key的数量；
- flushdb: 清空当前库；
- fluichall: 通杀全部库；

## Redis 命令

help@类型

### string

- 最常用: get、key
- 同时设置/获取多个键值
  1. mset key value [key value ... ]: 批量设置key-value,可以存在不成功的
  2. mget key [key ... ]
  3. msetnx key value [key value ... ]: 批量设置key-value，所有key都成功才返回1，否则返回0

- 获取指定区间范围内的值: getrange/setrange（截取、替换）
  1. set k abcd1234
  2. getrange k 0 2: 获取下标0-2的值 -->ab
  3. setrange k 2 5678: 替换下标2的值 -->ab5678d1234

- 数值增减（一定要是数字才能进行加减）
  1. 递增数字 INCR key
  2. 增加指定的整数 INCRBY key increment
  3. 递减数值 DECR key
  4. 减少指定的整数 DECRBY key decrement

- 获取字符串长度和内容追加
  1. strlen key: 获取字符串长度
  2. append key value: 追加到末尾，如果不存在，就相当于set key value

- 分布式锁□
- getset(先get再set)

### list: 双端队列

- lpush/rpush/lrange ：（push多个，也是一个一个插）
  1. lpush key value [value ...]: 批量插入，从左到右
  2. rpush key value [value ...]: 批量插入，从右到左

- lpop/rpop
- lindex: 按照索引下标获得元素(从上到下)
- llen: 获取列表中元素的个数
- lrem key 数字N 给定值v1: 解释(删除N个值等于v1的元素)
- ltrim key 开始index 结束index: 截取指定范围的值后再赋值给key
- rpoplpush 源列表目的列表
- lset key index value
- linsert key before/after 已有值 插入的新值

### hash: KV模式不变，但V是一个键值对

- hset/hget/hmset/hmget/hgetall/hdel
  1. hset key field value [ field value ... ]: 设置字段值,❗这里 key 为 “user:001”中的冒号（:）不是必须的，是约定的
  2. hmset/hmget: 都成功,才返回ok

- hlen
- hexists key: 在key里面的某个值的key
- hkeys/hvals
- hincrby/hincrbyfloat
- hsetnx: 是 "Hash SET if Not eXists" 的缩写，作用是：当 hash 中某个 field 不存在时，才设置它的值；如果已存在，则不做任何操作。

### set: 无序不重复集合

“单 key 对应多个 value，且 value 不重复”的无序集合

- sadd key member [member ...]: 添加元素
- smembers key: 遍历集合中的所有元素
- sismember key member: 判断元素是否在集合中
- srem key member [member ...]: 删除元素; ---->srem --> 是 Set Remove Member 的缩写，强调的是移除集合中的某个元素。
- scard: 获取集合里面的元素个数
- srandmember key[数字]: 从集合中随机展现"设置的数字个数"元素，元素不删除
- spop key[数字]: 从集合中随机弹出一个元素，出一个删一个
- smove key1 key2 在key1里已存在的某个值, 将key1里已存在的某个值赋给key2
- 集合运算: SADD s1 a b c; SADD s2 b c d
  1. SUNION s1 s2 : 并集s1 u s2 → a b c d
  2. SINTER s1 s2 : 交集s1 n s2 → b c
     - sintercard numkeys key [key ...]: 获取并集的元素个数
  3. SDIFF s1 s2 : 差集s1 - s2 → a（s1 有但 s2 没有的）

### zset: 有序集合

在set基础上，每个val值前加一个score分数值; 之前set是k1 v1 v2 v3,现在zset是k1 score1 v1 score2 v2

- ZADD key score member [score member ...]: 添加元素
- ZRANGE key start stop [WITHSCORES]: 按照元素分数从小到大的顺序,返回索引从start到stop之间的所有元素
- zrevrange
- ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]: 获取指定分数范围的元素
  1. withscores: 不包含
  2. limmit 作用是返回限制

- ZSCORE key member: 获取元素的分数
- ZCARD keye: 获取集合中元素的数量
- zrem key 某score下对应的value值，作用是删除元素
- ZINCRBY key increment member: 增加某个元素的分数

### bitmap: 位图

- setbit key offset val: 给指定key的值的第offset赋值val
- getbit key offset:获取指定key的第offset位
- bitcount key start end: 返回指定key中[start,end]中为1的数量
- bitop operation destkey key: 对不同的二进制存储数据进行位运算(AND、OR、NOTXOR)

### hyperloglog: 基数统计

- pfadd key element [element ...]: 添加元素
- pfcount key: 获取key的基数个数
- pfmerge destkey key [key2 ...]: 合并多个key的基数统计值，并赋给destkey

### geo: 地理位置

- GEOADD: 添加经纬度坐标
- GEOPOS: 返回经纬度
- GEOHASH: 返回坐标的geohash表示
- GEODIST: 两个位置之间距离
- GEORADIUS
- GEORADIUSBYMEMBER

## Redis 为什么这么快？

| 原因                | 重要程度   |
| ------------------- | ---------- |
| 内存操作            | ⭐⭐⭐     |
| 单线程避免锁        | ⭐⭐⭐⭐   |
| IO多路复用🔥(epoll) | ⭐⭐⭐⭐⭐ |
| 高效数据结构        | ⭐⭐⭐⭐   |
| C语言实现           | ⭐⭐       |

## Redis 的核心思想: IO 多路复用

- Redis 单线程模型;

- Redis 6 又引入多线程:
  因为：
  1. 网络IO已经成为瓶颈
  2. 命令执行没必要并行

## Redis 网络模型

```bash
    客户端
     ↓
    socket
     ↓
    epoll
     ↓
    Redis事件循环
     ↓
    命令执行
```

本质上：Redis 就是：“基于 epoll 的事件驱动服务器”

## Redis 能干什么？（重点）

1. 1️⃣ 缓存（最常见）
2. 2️⃣ 计数器（点赞 / 浏览量）
3. 3️⃣ 分布式锁（非常重要）：防止多个服务同时操作同一资源：
4. 4️⃣ 排行榜（ZSET）：比如抖音点赞榜：
5. 5️⃣ 消息队列（轻量版）

## Redis 常见问题

1. 1️⃣ 数据丢失
2. 2️⃣ Redis 适合存什么？

   适合：
   - 热数据
   - 临时数据
   - 高频访问数据

   不适合：
   - 超大文件
   - 冷数据归档

3. 3️⃣ 缓存穿透 / 缓存雪崩
   - ❌ 缓存穿透： 查不存在的数据 → 一直打 MySQL

     解决： 空值缓存， 布隆过滤器

   - ❌ 缓存雪崩：大量 key 同时过期

     解决：随机过期时间
