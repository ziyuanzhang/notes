# fastApi RBAC:用户 - 角色 - 权限

FastAPI + PostgreSQL + Redis + JWT + RBAC + AI/RAG

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
        ┌──────────────┴──────────────┐
        ↓                             ↓
 Authentication                  Authorization
   “你是谁？”                    “你能干什么？”
        │                             │
        ↓                             ↓
 OAuth2 / JWT                        RBAC (用户是什么角色？)
        │                             │
        ↓                             ↓
  access_token                       Role
        │                             │
        ↓                             ↓
  current_user                   Permission
                                      │
                                      ↓
                                    Scope (当前访问需要什么具体权限？)
                                      │
                                      ↓
                                   API权限
                                      │
                                ┌─────┴─────┐
                                ↓           ↓
                              允许         403
```

- Authentication 负责证明“你是谁”，
- RBAC 负责根据“你的角色”决定“你能做什么”，
- Scope/Permission 负责把“能做什么”细化到具体 API 权限。
