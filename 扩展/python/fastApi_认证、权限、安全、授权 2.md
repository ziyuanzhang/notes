# fastApi - 安全

- Security 的地图

```bash
                    FastAPI Security
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
     Authentication   Authorization    Security Scheme
        身份认证          权限控制          安全方案
          │                │
          │                │
     “你是谁？”       “你能干什么？”
          │                │
          └────────┬───────┘
                   ↓
             API Security
```

## OIDC、OAuth2、JWT、Access Token、ID Token 到底是什么？

OAuth2 是一个定义多种 authentication 和 authorization 处理方式的规范。
OAuth2 是一套关于“如何获得/使用访问权限”的标准。

- OAuth2 ≠ JWT
  1. OAuth2: 一种授权框架/规范；
  2. JWT: 一种具体 Token 格式（默认不是加密的，是签名的）；
  3. Bearer Token: 一种携带 Token 的方式；

- OAuth2 和 OpenID Connect

  OpenID Connect（OIDC）是建立在 OAuth2 之上的另一套规范，用来解决身份认证方面的一些问题。
  - OAuth2
    └── 重点：授权
    “你允许这个应用访问什么？”

  - OpenID Connect
    └── 建立在 OAuth2 上
    “这个用户是谁？”

- OIDC、OAuth2、JWT、Access Token、ID Token: 不要把它们全部理解成“登录”。它们处在不同层次。

## HTTP Basic Auth：最简单的用户名/密码认证方式

- HTTP Basic Auth: 每次请求都带用户名和密码。
- JWT Bearer Token: 初次登录后生成token返回，每次请求都带一个 Token(身份证)。

## OAuth2 scopes：在 JWT/OAuth2 认证之上增加细粒度“权限控制”

OAuth2 Scopes 才开始进入“权限控制”；
Scope = 一个权限字符串；
客户端的scopes：不是用户数据库权限，只是告诉 FastAPI：系统定义了哪些 OAuth2 Scope。

## Security() 和 Depends()

Security 实际上是 Depends 的子类，只增加了与 Scope 相关的能力

Depends: 依赖注入

Security: 依赖注入 + OAuth2 Scope + OpenAPI Security 文档

```python
@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[
        User,
        Security(
            get_current_active_user,
            scopes=["items"]
        )
    ],
):

# 访问 /users/me/items/，必须通过 get_current_active_user，并且 Token 必须拥有 items Scope。
```

```bash
/users/me/items/
        ↓
Security(get_current_active_user, scopes=["items"])
        ↓
get_current_active_user
        ↓
Security(get_current_user, scopes=["me"])
        ↓
get_current_user
        ↓
读取 JWT
        │
        ├── sub
        │
        └── scope
             │
             ↓
       ["me", "items"]
# -------------------------
required scopes:
["items", "me"]

Token scopes:
["me", "items"]

检查：
me     ✓
items  ✓

→ 允许
```

================================

```python
async def get_current_user(
    security_scopes: SecurityScopes,
    token: Annotated[str, Depends(oauth2_scheme)]
):


# 这里：security_scopes不是 Token。它代表：当前 API 请求所要求的 Scope。
# 当前 API --> items , 子依赖 --> me
# FastAPI 最终把它们收集起来：security_scopes.scopes 得到：["items", "me"]; 而：security_scopes.scope_str得到：items me
```

## 把整个登录流程串起来

```bash
                 用户登录
                    │
                    ↓
            username/password
                    │
                    ↓
             authenticate_user
                    │
                    ↓
               用户是否合法
                    │
                    ↓
             用户真实权限
                    │
                    ↓
              创建 JWT Token
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
        sub                 scope
      johndoe              me items
          │                   │
          └─────────┬─────────┘
                    ↓
                  JWT
                    │
                    ↓
              客户端保存 Token
                    │
                    ↓
       Authorization: Bearer JWT
                    │
                    ↓
              FastAPI API 请求
                    │
                    ↓
             jwt.decode()
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       username             scopes
          │                   │
          │              me / items
          │                   │
          └─────────┬─────────┘
                    ↓
             Scope 检查
                    │
             ┌──────┴──────┐
             ↓             ↓
           有权限         无权限
             ↓             ↓
            API           401
```

| 技术               | 解决什么                                     |
| ------------------ | -------------------------------------------- |
| HTTP Basic Auth    | 最简单的用户名密码认证                       |
| OAuth2             | 一套标准化的授权/认证相关机制                |
| JWT                | 常见的 Token 格式                            |
| Bearer Token       | 携带 Access Token 的方式                     |
| OAuth2 Scope       | 细粒度权限                                   |
| OpenAPI            | 描述 Security Scheme，并让 Swagger UI 理解它 |
| FastAPI `Depends`  | Dependency Injection                         |
| FastAPI `Security` | Dependency Injection + OAuth2 Scope          |
| `SecurityScopes`   | 获取当前 API 所要求的 Scope                  |

- FastAPI Security 知识树

```bash
FastAPI Security
│
├── Authentication
│   │
│   ├── HTTP Basic
│   │
│   └── OAuth2
│       │
│       ├── Password
│       ├── Authorization Code
│       ├── Client Credentials
│       └── ...
│
├── Authorization
│   │
│   ├── Scope
│   ├── Role
│   └── Permission
│
├── Token
│   │
│   ├── JWT
│   └── Bearer
│
├── FastAPI
│   │
│   ├── Depends()
│   ├── Security()
│   └── SecurityScopes
│
└── OpenAPI
    │
    ├── Security Schemes
    └── Swagger UI
```

- Security 讲的是 FastAPI 安全体系的地图；
- HTTP Basic Auth 展示最简单的“用户名+密码认证”；
- OAuth2 Scopes 则进一步把“你是谁”与“你能做什么”结合起来，通过 JWT 中的 Scope + Security() + SecurityScopes 实现细粒度授权。

## Depends → Security → SecurityScopes → RBAC

```bash
① HTTP Basic
   ↓
理解 Depends + Security Scheme

② OAuth2 Password
   ↓
username/password → access_token

③ JWT
   ↓
sub / exp / token validation

④ OAuth2 Scope
   ↓
me / items / users:read / users:write

⑤ Security()
   ↓
API 声明需要什么权限

⑥ SecurityScopes
   ↓
统一检查 Token 权限

⑦ RBAC
   ↓
User → Role → Permission

⑧ PostgreSQL
   ↓
真正保存 User / Role / Permission

⑨ Redis
   ↓
Token blacklist / session / permission cache

⑩ 最终生产架构
   ↓
JWT + RBAC + Permission/Scope + Redis + Audit
```
