# fastApi RBAC:用户 - 角色 - 权限

FastAPI + PostgreSQL + Redis + JWT + RBAC + AI/RAG

- RBAC 是一种“权限管理思想/模型”；
- Role 是角色；
- Permission 是实际权限；
- Scope 是 OAuth2 用来表示“访问范围/权限”的机制。

## 流程

```bash
                    用户
                     │
             username/password
                     │
                     ↓
                  登录接口
                     │
                     ↓
                 身份认证
              Authentication
                     │
                     ↓
                  JWT Token
                     │
              ┌──────┴──────┐
              ↓             ↓
             sub          scopes
          “你是谁”       “你能干什么”
              │             │
              └──────┬──────┘
                     ↓
                Bearer Token
                     │
                     ↓
                API 请求
                     │
                     ↓
              FastAPI Security
                     │
              ┌──────┴──────┐
              ↓             ↓
          身份验证         权限验证
          JWT有效？       scope存在？
              │             │
              └──────┬──────┘
                     ↓
                   API
```

## RBAC: Role-Based Access Control = 基于角色的访问控制

```bash
                    User
                     │
                     ↓
                    Role
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Admin       Editor     Viewer
          │          │          │
          ↓          ↓          ↓
      Permissions / Scopes
          │
          ├── users:read
          ├── users:write
          ├── products:read
          ├── devices:read
          ├── devices:control
          ├── rag:query
          ├── rag:write
          └── model:execute
```

- 授权过程:

  ```bash
    Token
     ↓
    找到用户张三
     ↓
    张三的角色 = admin
     ↓
    admin 拥有 user:delete
     ↓
    允许
  ```

## 整个知识体系

```bash
                    FastAPI Security
                            │
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
 Authentication                            Authorization
   “你是谁？”                                  “你能干什么？”
        │                                       │
        ↓                                       ↓
 OAuth2 / JWT                                  RBAC (基于角色管理权限)
        │                                       │
        ↓                                       ↓
  access_token                                 Role (例 admin/operator)
        │                                       │
        ↓                                       ↓
  current_user                             Permission (例 device:control)
                                                │
                                  ┌─────────────┴──────────────┐
                                  ↓                            ↓
                        OAuth2 Scope (拥有的权限)           其他权限机制
                           (例 device:control)
                                  │
                                  ↓
                               API 要求的权限
                                  │
                            ┌─────┴─────┐
                            ↓           ↓
                          允许         403
```

- Permission 可以通过 Scope 来表达，而不是一定存在严格的上下级关系
- Scope/Permission 负责把“能做什么”细化到具体 API 权限。
