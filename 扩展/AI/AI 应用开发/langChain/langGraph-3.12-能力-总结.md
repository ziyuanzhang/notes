# langGraph-3.12-能力-总结

| 机制               | 何时触发                          | 状态存哪                           | 如何恢复                         | 关键坑                                   |
| ------------------ | --------------------------------- | ---------------------------------- | -------------------------------- | ---------------------------------------- |
| Interrupt          | 节点调用 interrupt()              | Checkpointer                       | Command(resume=…) + 同 thread_id | 节点整段重跑，副作用要幂等               |
| Time Travel-Replay | invoke(None, 历史 config)         | Checkpointer                       | 自动续跑后续节点                 | 可能重触发 interrupt；结果未必与原跑一致 |
| Time Travel-Fork   | update_state(历史 config, values) | 新 Checkpoint 分支                 | invoke(None, fork_config)        | 不删原历史；as_node 控归属               |
| delete_thread      | 显式调用                          | Checkpointer 数据被删              | 不可恢复该线程                   | 不删 Store 长期记忆                      |
| Retry              | 节点抛可重试异常                  | 清除本次失败写入                   | 自动再试                         | 清除 State 写入 ≠ 撤销外部副作用         |
| Timeout            | run/idle 超限 → NodeTimeoutError  | 清除本次写入                       | 交由 Retry/ErrorHandler          | 仅异步节点、需 langgraph≥1.2             |
| ErrorHandler       | 重试耗尽                          | Command 更新 State 改路由          | 由 handler 决定                  | handler 自身异常向外传播                 |
| Graceful Shutdown  | control.request_drain()           | Super-step 边界存可恢复 Checkpoint | invoke(None, 同 thread_id)       | 停机耗时须 < 容器宽限期，否则 SIGKILL    |
