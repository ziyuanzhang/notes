- lagngraph+llamaindex+mcp 开发agent， llamaindex做为RAG；
- 公司有多个部门 例：人事，行政，产品研发部，每个部门有自己的文档，别的部门不以访问，各部门的文档有 多模态、pdf（简单和复杂）、网页；
  1. 一个index(索引)是一个知识库吗？怎么先构建知识库，在查询？
  2. 怎么做RAG？怎么区分访问？怎么做向量库，每个文件一个知识库？
  3. 构建索引和查询是分开的吧？实际应用时怎么把他们关联起来，怎么确定用哪个索引查询？
  4. 中大型公司，怎么跨部门查询？例如老板
  5. 行政的文件有的只能部门访问，有的给公司成员访问，有的对外全部公开，怎么设计？

  ❌ 不要「每个文件一个知识库」
  ❌ 不要「每个部门一个 VectorDB 实例」
  ✅ 要「统一向量库 + 严格 Metadata + Policy 控制」
  ✅ 访问控制不在向量库，而在 RAG Query 层 & Agent 层
  ✅ 知识库 = 数据 + 索引 + 权限 + 治理 + 生命周期

普通员工--》部门负责人--》老板--》法务--》审计

```bash
# 知识库实体
KnowledgeBase = {
    "kb_id": "kb_hr",
    "name": "人事知识库",
    "owner_dept": "hr",
    "allowed_depts": ["hr"],
    "status": "active"
}

```

```bash
Node.metadata = {
    "department": "hr",                # 部门
    "doc_id": "hr_policy_2025.pdf",     # 原始文档
    "doc_type": "pdf|image|html",
    "visibility": "internal",
    "acl": ["hr"],                      # 可访问部门
    "owner_dept": "hr",
    "created_at": "2026-01-01"
    # ===================
    "owner_dept": "admin",         # 归属部门
    "visibility": "dept|internal|public",
    "acl_depts": ["admin"],        # 部门白名单（可为空）
    "acl_roles": ["employee"],     # 角色白名单
    "kb_id": "kb_admin"
}
```

```bash
用户
 ↓
Agent Gateway（FastAPI）
 ↓
Auth / SSO / JWT
 ↓
LangGraph Agent
 ├─ Policy Node（权限判定）
 ├─ Router Node（是否走 RAG / 哪个部门）
 ├─ RAG Node（LlamaIndex）
 │    ├─ Retriever（带访问过滤）
 │    └─ PostProcessor（再过滤）
 └─ MCP Tool（写操作 / 系统查询）
 ↓
LLM
```

```bash
# 用户身份结构（JWT / Session）
{
  "user_id": "ceo_001",
  "roles": ["ceo"],
  "departments": ["hr", "admin", "rd"],
  "rag_scope": {
    "mode": "multi_domain",
    "allowed_domains": ["hr", "admin", "rd"]
  }
}

```
