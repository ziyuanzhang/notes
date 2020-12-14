## 事件循环机制 -- nodeJS 端（由 libuv 库实现）

**重要重要：**

1.  事件循环机制由宿主环境实现, js 引擎（V8）只负责执行代码；
2.  事件循环机制有多个队列参与（多个）；任务队列是一组任务（task）

把“JS 引擎源码"编辑成文件,作为库引进 C 中，异步则执行死循环挂起，回调

![node事件循环](./img/nodeEventLoop.jpg)

- 图片中的不同的盒子代表不同的阶段，每个阶段执行特定的工作。每个阶段都有一个队列，Javascript 可以在任何一个阶段执行（除了 idle & prepare）。
- 你在图片中也能看到 nextTickQueue 和 microTaskQueue，它们不是循环的一部分，它们的回调可以在任意阶段执行。它们有更高的优先级去执行。nextTickQueue 的优先级高于 microTaskQueue。
