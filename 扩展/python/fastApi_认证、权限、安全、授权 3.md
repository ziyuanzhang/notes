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
