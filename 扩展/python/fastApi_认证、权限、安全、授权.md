# fastApi 认证、权限、安全、授权

Authentication(认证) --> JWT(签名) --> Scope --> Security --> Dependency Tree --> Authorization(授权)

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

1. 1️⃣ Authentication（认证）: 验证用户身份的过程。常见方式：
   - 用户名 + 密码
   - OAuth2 / SSO
   - 生物识别

2. 2️⃣ JWT（JSON Web Token）: 认证通过后，发一个"身份证"

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

3. 3️⃣ Scope（权限范围）: Token 里声明了"能做什么"

   `scope: "read:user write:user admin:system"`
   - 定义 Token 的权限边界
   - 是 认证 到 授权 的桥梁
   - 服务端根据 scope 判断请求是否合法

4. 4️⃣ Security（安全体系）: 整体框架
   涵盖：

   | 层面     | 内容         |
   | -------- | ------------ |
   | 传输安全 | HTTPS / TLS  |
   | 身份认证 | JWT / OAuth2 |
   | 授权控制 | RBAC / ABAC  |
   | 数据安全 | 加密 / 脱敏  |

5. 5️⃣ Dependency Tree（依赖树）: 安全配置的组成结构

   两种理解：
   - A. 框架层面（如 Spring Security）: 每个 Filter 是一个依赖节点，形成处理链。
   - B. 供应链安全层面: 依赖树分析可以发现安全漏洞（如 npm audit、mvn dependency:tree）。

6. 6️⃣ Authorization（授权）: "你能做什么？"

## 流程图

- 认证图 + 验证图

  ```bash
                      ┌──────────────────┐
                      │     用户登录      │
                      └────────┬─────────┘
                               │
                      username + password
                               │
                               ↓
                      ┌──────────────────┐
                      │    POST /token   │
                      └────────┬─────────┘
                               │
                               ↓
                      authenticate_user()
                               │
                     ┌─────────┴─────────┐
                     ↓                   ↓
                查找用户             verify password
                     │                   │
                     └─────────┬─────────┘
                               ↓
                      create_access_token()
                               │
                               ↓
                             JWT
                               │
                               ↓
                         前端保存 token
                               │
                               │
                 Authorization: Bearer <JWT>
                               │
                               ↓
                      ┌──────────────────┐
                      │   GET /users/me  │
                      └────────┬─────────┘
                               │
                               ↓
                      OAuth2PasswordBearer
                               │
                               ↓
                            token
                               │
                               ↓
                      get_current_user()
                               │
                               ↓
                          jwt.decode()
                               │
                      ┌────────┴────────┐
                      ↓                 ↓
                     签名               exp
                      │                 │
                      └────────┬────────┘
                               ↓
                           sub=user
                               │
                               ↓
                          get_user()
                               │
                               ↓
                             User
                               │
                               ↓
                    get_current_active_user()
                               │
                        disabled == True?
                         /             \
                       是               否
                       ↓                ↓
                     400              User
                                        │
                                        ↓
                                  业务 Endpoint
  ```

- 依赖树

  ```bash
    路由 # 真正执行业务
     │
     │ Depends(get_current_active_user)
     ↓
    get_current_active_user # 检查用户是否 active
     │
     │ Depends(get_current_user)
     ↓
    get_current_user # 验证 JWT + 找用户
     │
     │ Depends(oauth2_scheme)
     ↓
    oauth2_scheme # 从 Header 提取 Bearer Token
     │
     ↓
    token
  ```

- 验证token

  ```python

    # ------------ 获取信息 ---------------------------------------------------
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
    # tokenUrl 是“告诉 FastAPI/OpenAPI 去哪里获取 token”的声明，不负责真正获取 token；它可以叫 login、auth/login 等，但最好与真实登录接口保持一致。

    # 流程: HTTP Request --》Authorization Header --》Bearer abc123 --》OAuth2PasswordBearer --》 "abc123" --》 token 参数
    # 作用: OAuth2PasswordBearer: 检查 Authorization Header，并把 Bearer 后面的 token 作为 str 返回；它本身还没有验证 token 是否有效。
    # 如果没有 Authorization Header，或者不是 Bearer：`401 Unauthorized`

    class TokenData(BaseModel):
        username: str | None = None

    async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
      credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Could not validate credentials",headers={"WWW-Authenticate": "Bearer"},)
      try:
          payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
          username = payload.get("sub")
          if username is None:
              raise credentials_exception
          token_data = TokenData(username=username) # 把字符串转换为数据结构，方便后面扩展（统一数据）；直接用 字符串username也行
      except InvalidTokenError:
          raise credentials_exception

      user = get_user(fake_users_db, username=token_data.username)
      if user is None:
          raise credentials_exception
      return user

    async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)] ):
      if current_user.disabled:
          raise HTTPException(status_code=400,detail="Inactive user")
      return current_user

    @app.get("/users/me/")
      async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)],) -> User:
          return current_user
  # ------------ 创建token -------------------------------------------------------
  def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
  # ----------- 登录 ----------------------------------------------------
      def authenticate_user(fake_db, username, password):
        user = get_user(fake_db, username)
        if not user:
            verify_password(password, DUMMY_HASH) # 生产安全意识，防攻击者根据时间
            return False
        if not verify_password(password,user.hashed_password):
            return False
        return user

     # OAuth2PasswordBearer:它是 FastAPI Security Scheme。
     # OAuth2PasswordRequestForm: 它本质上只是一个方便使用的 Dependency Class。
     @app.post("/token")
      async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
        # form_data.username
        # form_data.password
        # form_data.scopes
        user = authenticate_user(fake_users_db, form_data.username, form_data.password)

        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Incorrect username or password",headers={"WWW-Authenticate": "Bearer"},)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
        return Token(access_token=access_token, token_type="bearer")

  ```
