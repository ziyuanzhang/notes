#### webWorker - 宿主环境（浏览器）提供的，js 没有支持多线程功能

宿主环境很容易提供多个 js 引擎实例；各自运行在自己的线程上；

1. worker 内部无法访问主程序的任何资源，不能访问全局变量、页面的 DOM、其他资源（这是一个完全独立的线程）
2. 但可以执行网络操作（ajax,websockets）,定时机器；可以访问 navigato、location、json、applicationCache；
3. 可以通过 importScipts 加载 js 脚本(同步的)；例：importScipts("a.js","b.js")

## 应用：

- 处理密集型数学计算
- 大数据集排序
- 处理数据（压缩、音频分析、图像处理等）
- 高流量网络通信
