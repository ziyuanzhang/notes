# celery

- Celery的架构由三部分组成，消息中间件（message broker），任务执行单元（worker）和任务执行结果存储（task result store）组成。
  1. 消息中间件: Celery本身不提供消息服务，但是可以方便的和第三方提供的消息中间件集成。包括，RabbitMQ, Redis等等
  2. 任务执行单元: Worker是Celery提供的任务执行的单元，worker并发的运行在分布式的系统节点中。
  3. 任务结果存储: Task result store用来存储Worker执行的任务的结果，Celery支持以不同方式存储任务的结果，包括AMQP, redis等

- 我们通常使用Celery来实现异步任务（async task）和定时任务（crontab）。
  1. 异步任务：将耗时操作任务提交给Celery去异步执行，比如发送短信/邮件、消息推送、音视频处理等等
  2. 定时任务：定时执行某件事情，比如每天数据统计
