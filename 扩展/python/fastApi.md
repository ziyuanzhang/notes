# fastApi

https://blog.csdn.net/inuex/article/details/159608645
handler(source_type)：获取基础类型的核心 schema，继承基础类型的所有验证规则（如str的非空、int的数值验证）；
core_schema.chain_schema：按顺序执行多个 schema，先执行基础类型验证，再执行自定义验证；

## 第一阶段：Python基础

```bash

│
├── 数据类型
├── 函数
├── 面向对象(OOP)
│
├── 模块与包
├── 虚拟环境(venv)
├── 异常处理
│
├── 文件操作
├── JSON
├── 日志(logging)
│
├── 装饰器
├── 生成器(generator)
├── 迭代器(iterator)
├── 上下文管理器(with)
│
├── 类型注解(Type Hint)
│
├── 并发编程
│   ├── 多线程
│   ├── 多进程
│   ├── GIL
│   └── 协程
│
├── 异步编程
│    ├── asyncio
│    ├── async/await
│    ├── Event Loop
│    ├── Task
│    └── Future
│
▼
```

## 第二阶段：Web基础

```bash
│
├── HTTP协议
│   ├── Request
│   ├── Response
│   ├── Header
│   ├── Cookie
│   ├── Session
│   └── 状态码
│
├── RESTful API
├── JSON
├── HTTPS
├── JWT
├── OAuth2
│
▼
```

## 第三阶段：数据库（决定未来上限）

```bash
│
├── PostgreSQL
│
├── SQL
│   ├── SELECT
│   ├── INSERT
│   ├── UPDATE
│   ├── DELETE
│   ├── JOIN
│   ├── GROUP BY
│   ├── HAVING
│   └── 子查询
│
├── 索引(Index)
├── 事务(Transaction)
├── 锁(Lock)
├── MVCC
│
├── 数据库设计
│   ├── 主键
│   ├── 外键
│   ├── 唯一约束
│   └── 联合唯一
│
▼
```

## 第四阶段：FastAPI基础（能独立写CRUD接口）

```bash
│
├── 路由(APIRouter)
├── 请求(Request)
├── 响应(Response)
│
├── Query
├── Path
├── Header
├── Cookie
│
├── 文件上传
├── Form表单
│
├── Pydantic
│   ├── BaseModel
│   ├── Field
│   ├── Validator
│   ├── Schema
│   ├── 序列化
│   └── 响应模型
│
├── OpenAPI
│   └── Swagger
│
▼
```

## 第五阶段：FastAPI高级

```bash
│
├── Depends
├── Dependency Injection
├── 生命周期(Lifespan)
├── Middleware
├── Exception Handler
├── BackgroundTasks
├── WebSocket
├── StreamingResponse
├── SSE
├── 自定义路由
│
▼
```

## 第六阶段：ORM层

```bash
│
├── SQLAlchemy 2.0
│
├── ORM
│   ├── Engine
│   ├── Session
│   ├── Model
│   ├── Relationship
│   │
│   ├── OneToOne
│   ├── OneToMany
│   ├── ManyToMany
│   │
│   ├── Query
│   ├── CRUD
│   │
│   └── AsyncSession
│
├── Session
├── Alembic迁移
│   ├── migration
│   ├── revision
│   ├── upgrade
│   └── downgrade
│
▼
```

## 第七阶段：认证授权系统

```bash
│
├── Password Hash
├── OAuth2
├── JWT
├── Refresh Token
├── RBAC
├── Permission
├── 多角色系统
│
▼
```

## 第八阶段：项目工程化（写Demo/做项目 分接线）

```bash
│
├── 配置管理
│   ├── .env
│   ├── Settings
│   └── 多环境
│
├── 日志系统
├── 全局异常
├── 统一响应结构
├── API版本管理
├── 项目目录设计
├── 分层架构
│   ├── router
│   ├── service
│   ├── repository
│   └── model
│
▼
```

## 第九阶段：缓存与异步任务

```bash
│
├── Redis
│   ├── String
│   ├── Hash
│   ├── List
│   ├── Set
│   ├── ZSet
│   │
│   ├── 缓存
│   ├── 分布式锁
│   ├── 限流
│   └── Session
│
├── Celery
│   ├── Worker
│   ├── Task
│   ├── Beat
│   └── Retry
│
├── RabbitMQ/Kafka
│   ├── RabbitMQ
│   ├── Kafka
│   └── Redis Stream
│
▼
```

## 第十阶段：测试

```bash
│
├── pytest
├── 单元测试
├── 集成测试
├── API测试
├── Mock
├── Coverage
│
▼
```

## 第十一阶段：部署上线（能找工作了）

```bash
│
├── Linux
├── Docker
├── Docker Compose
├── Nginx
├── Uvicorn
├── Gunicorn
├── HTTPS
│
▼
```

## 第十二阶段：CI/CD

```bash
│
├── Git
├── GitHub Actions
├── GitLab CI
├── 自动测试
├── 自动构建
├── 自动部署
│
▼
```

## 第十三阶段：AI应用开发

```bash
│
├── OpenAI API
├── Embedding
├── Vector Database
│   ├── pgvector
│   ├── Milvus
│   └── Qdrant
│
├── RAG
├── MCP
├── Agent
├── LangChain
├── LangGraph
├── AI Workflow
│
▼
```

## 第十四阶段：微服务与云原生（架构师方向）

```bash
│
├── API Gateway
├── 微服务
│   ├── 服务拆分
│   ├── API Gateway
│   ├── 服务发现
│   ├── 配置中心
│   ├── 链路追踪
│   ├── Prometheus
│   ├── Grafana
│   ├── OpenTelemetry
│   └── ELK
│
└── Kubernetes
    ├── Pod
    ├── Deployment
    ├── Service
    ├── Ingress
    │
    ├── ConfigMap
    ├── Secret
    │
    ├── HPA
    ├── StatefulSet
    │
    └── Helm
```

## 理解架构

```理解架构：
        Browser
        ↓
        Nginx
        ↓
        Gunicorn
        ↓
        Uvicorn Worker
        ↓
        FastAPI
```

```典型架构
        User
        │
        ▼
        FastAPI
        │
        ├── PostgreSQL
        │
        ├── Redis
        │
        ├── Vector DB
        │
        └── LLM(OpenAI)
```

```Python后端 + AI应用开发
        1 Python核心
        2 HTTP/REST
        3 PostgreSQL + SQL
        4 FastAPI基础
        5 Pydantic
        6 Depends依赖注入
        7 SQLAlchemy
        8 Alembic
        9 JWT认证
        10 Redis
        11 项目工程化
        12 pytest
        13 Docker
        14 Linux
        15 Nginx
        16 GitHub Actions
        17 OpenAI API
        18 RAG
        19 MCP
        20 Agent
        21 LangGraph
        22 Kubernetes
```

前 17 步完成后，已经具备独立开发：

- 用户系统
- 管理后台 API
- 电商后端
- SaaS 系统
- AI 问答系统
- AI Agent 平台

的能力。
