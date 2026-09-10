# fastApi\_认证、权限、安全、授权

Authentication(认证) --> JWT --> Scope --> Security --> Dependency Tree --> Authorization(授权)

认证确认身份 → JWT 携带身份 → Scope 声明权限 → 纳入安全体系 → 通过依赖树组织配置 → 最终完成授权决策。

```bash
Authentication(认证)
       │
       ▼ 使用什么来证明身份？
JWT (JSON Web Token)
       │
       ▼ Token 里包含什么信息？
  Scope (权限范围)
       │
       ▼ 这一切属于哪个大领域？
Security (安全体系)
       │
       ▼ 安全配置如何组织？
Dependency Tree (依赖树)
       │
       ▼ 最终目的是什么？
Authorization(授权)
```

| 阶段            | 核心问题            | 关键产物            |
| --------------- | ------------------- | ------------------- |
| Authentication  | 你是谁？            | 身份凭证            |
| JWT             | 如何传递身份？      | Token               |
| Scope           | 能做什么？          | 权限声明            |
| Security        | 如何整体保护？      | 安全框架            |
| Dependency Tree | 配置/依赖如何组织？ | Filter链 / 依赖分析 |
| Authorization   | 允许访问吗？        | 访问决策            |

## 逐层解释

- 1️⃣ Authentication（认证）: 验证用户身份的过程。常见方式：
  - 用户名 + 密码
  - OAuth2 / SSO
  - 生物识别
- 2️⃣ JWT（JSON Web Token）: 认证通过后，发一个"身份证"

  ```json
  {
    "sub": "user123",
    "scope": "read:orders write:orders",
    "exp": 1725926400
  }
  ```

  - 无状态、可自包含
  - 由 Header + Payload + Signature 组成
  - 客户端携带 Token 访问资源

- 3️⃣ Scope（权限范围）: Token 里声明了"能做什么"

  `scope: "read:user write:user admin:system"`
  - 定义 Token 的权限边界
  - 是 认证 到 授权 的桥梁
  - 服务端根据 scope 判断请求是否合法

- 4️⃣ Security（安全体系）: 整体框架
  涵盖：

  | 层面     | 内容         |
  | -------- | ------------ |
  | 传输安全 | HTTPS / TLS  |
  | 身份认证 | JWT / OAuth2 |
  | 授权控制 | RBAC / ABAC  |
  | 数据安全 | 加密 / 脱敏  |

- 5️⃣ Dependency Tree（依赖树）: 安全配置的组成结构

  两种理解：
  - A. 框架层面（如 Spring Security）: 每个 Filter 是一个依赖节点，形成处理链。
  - B. 供应链安全层面: 依赖树分析可以发现安全漏洞（如 npm audit、mvn dependency:tree）。

- 6️⃣ Authorization（授权）: "你能做什么？"
