# DeepAgents-4.3-执行环境-沙箱

建议把本章放进 Execution Environment（执行环境）→ Sandbox（沙箱）→ Tools（工具）→ Security（安全） 这条主线上理解。

Backend 决定 Agent 在哪里读写文件、如何执行命令；
Sandbox 通过隔离的执行环境，限制这些操作对宿主机造成的影响。

❗注意：沙箱不是绝对安全的保险箱。它主要隔离执行环境，并不能自动防止提示词注入、网络数据外泄或 Agent 在沙箱内部执行危险操作。

## Sandbox 与 Backend 是什么关系？

Backend 和 Sandbox 不是同一个层次的概念。
Backend 是 Agent 访问资源的接口抽象；Sandbox 是执行环境及其隔离边界。Sandbox Backend 把二者连接起来。

## 沙箱生命周期：一个线程一个，还是多个线程共用？

- Thread-scoped（线程级沙箱）: 线程结束或 TTL 到期后，环境可以被清理。
- Assistant-scoped（助手级沙箱）: 生命周期与 Assistant 一致，多个线程共享同一个环境。

## 沙箱位置

1. 整个agent 放沙箱，通过http、websocket、grpc 等协议访问外部资源。
2. 按需执行的部分，比如执行命令、读写文件，放在沙箱内执行。

## Sandbox 到底能防住什么？

1. Context Injection（上下文注入）
2. Network Exfiltration（网络外泄）
3. Secrets Exposure（凭证泄露）
