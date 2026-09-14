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

- JWT 默认不是加密的，是签名的。
- OAuth2 ≠ JWT
  1. OAuth2: 一种授权框架/规范
  2. JWT: 一种 Token 格式
  3. Bearer Token: 一种携带 Token 的方式

- OAuth2 和 OpenID Connect

  OpenID Connect（OIDC）是建立在 OAuth2 之上的另一套规范，用来解决身份认证方面的一些问题。
  - OAuth2
    │
    └── 重点：授权
    “你允许这个应用访问什么？”

  - OpenID Connect
    │
    └── 建立在 OAuth2 上
    “这个用户是谁？”

- OIDC、OAuth2、JWT、Access Token、ID Token: 不要把它们全部理解成“登录”。它们处在不同层次。

## HTTP Basic Auth：最简单的用户名/密码认证方式

- HTTP Basic Auth: 每次请求都带用户名和密码。
- JWT Bearer Token: 初次登录后生成token返回，每次请求都带一个 Token(身份证)。

## OAuth2 scopes：在 JWT/OAuth2 认证之上增加细粒度“权限控制”

OAuth2 Scopes 才开始进入“权限控制”；
Scope = 一个权限字符串；
