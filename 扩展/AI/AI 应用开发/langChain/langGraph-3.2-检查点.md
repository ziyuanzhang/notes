# langGraph-3.2-检查点 Checkpointers

Checkpointer 不是简单地把对话保存到数据库，而是保存图执行过程中的状态快照及节点写入记录，让工作流能够恢复、暂停、回放和查看历史。

核心区别：Checkpoint 记录完整状态；Writes 记录 节点执行过程中 已经成功完成的写入，以支持恢复。
