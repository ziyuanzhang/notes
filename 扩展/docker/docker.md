# docker

[docker 部署前端项目](https://blog.csdn.net/weixin_42907150/article/details/135942906)

## 服务器

1. 腾讯的按流浪计费（便宜）
2. 不用时关机，每次开机公网 IP 会变化
3. 安全组添加端口号，不加无法访问
4. ls:
5. cat index.html：查看 index.html 内容
6. echo 2222 > index.html： 写入
7. exit：退出容器

## 概念

1. 镜像（image）：一个只读模板，包含运行应用程序所需的所有内容：代码、运行时、库、环境变量和配置文件。

   - 例：雕版印刷的雕版

2. 容器（container）：镜像的运行实例。

   - 容器是轻量、可移植、隔离的运行环境。
   - 同一镜像可以启动多个容器，彼此隔离。
   - 例：用雕版印出的书页；

3. Dockerfile：一个文本文件，包含一系列指令，用于自动构建镜像。

4. Volume(卷，又称：逻辑卷、存储卷)：用于持久化容器数据；卷独立于容器生命周期，即使容器删除，数据仍保留。

   - docker 以干净文件系统开始，可以在容器中创建、修改数据，容器停止后，容器中的所有数据都会丢失；
   - 卷：可以把容器中的目录 映射到 宿主机中的目录上，可以把数据保存到宿主机的磁盘上；
   - 支持命名卷、绑定挂载（bind mount）等。

5. 网络（Network）: 解决容器与外界、与容器之间通信；

   - Docker 提供多种网络驱动（bridge、host、overlay 等）。
   - 默认使用 bridge 网络，容器间可通过名称通信（需自定义网络）。

6. Docker Compose：用于定义和运行多容器 应用程序的工具。

   - 使用 docker-compose.yml 文件配置服务(容器)、网络、卷等；
   - 通过 docker-compose up 一条命令，就可以启动整个应用栈；（前端、后端、数据库、缓存 redis、负载均衡等多个服务器）

7. Docker Daemon 与 Client:

   - Docker Client(Docker 客户端)：用户使用的命令行工具，客户端通过 REST API 与守护进程通信，并指示它该做什么。
   - Docker Daemon（Docker 守护进程）：一个长期运行在后台的进程（dockerd），负责管理镜像、容器、网络和卷。
     1. 接受客户端的请求，将结果返回给客户端；
     2. 进程名：dockerd

8. Docker Desktop: 面向开发者的一体化桌面应用程序，用于在 Windows 和 macOS 上轻松使用 Docker。

   包含组件：

   - Docker Client（docker CLI）
   - Docker Daemon（运行在后台 VM 中，如 WSL2 或 Hyper-V）
   - Docker Compose
   - Kubernetes（可选）
   - GUI 界面（查看容器、镜像、资源使用等）

9. Docker Hub / Registry（镜像仓库）：用于存储和分发镜像的服务。

   - Docker Hub 是官方公共仓库（https://hub.docker.com）
   - 也可以搭建私有 Registry。

10. Namespace 与 Cgroups（底层技术）
    - Namespaces：实现进程、网络、用户、挂载点等的隔离。
    - Cgroups（Control Groups）：限制、记录和隔离资源使用（CPU、内存等）。

## 开发流程

1. 编写 Dockerfile。
2. 使用 docker build 命令根据 Dockerfile 构建出一个镜像。
3. 使用 docker run 命令从镜像 运行一个或多个容器。
4. 使用 卷 来持久化容器中的数据。
5. 使用 Docker Compose 来编排和管理多个相关联的容器。
6. 将构建好的镜像 推送到 Registry，以便在其他环境拉取和部署。

## 流程

1. 下载镜像

   - 检索：docker search xxx
   - 下载：docker pull xxx
   - 列表：docker images == 查看镜像
   - 删除：docker rmi xxx == 删除镜像

2. 启动容器

   - 运行：docker run xxx == 运行镜像

     1. docker run -d --name mynginx -p 88:80 nginx
     2. -d： 后台运行；
     3. --name mynginx： 自定义容器名；
     4. -p 88:80： 暴露端口，把宿主机的 88 端口映射到单个 docker 容器的 80 端口

   - 查看：docker ps == 查看容器
   - 停止：docker stop xxx == xxx（容器名字/id）
   - 启动：docker start xxx == （停止的）再次启动
   - 重启：docker restart xxx == （运行的/停止的）再次启动
   - 状态：docker stats xxx == 查看占用内存情况
   - 日志：docker logs xxx ==
   - 进入：docker exec == 进入容器内修改

     1. `docker exec -it mynginx /bin/bash`
     2. -it：以交互模式进入（容器名/id）
     3. /bin/bash：以哪种方式交互，以 bash 控制台

   - 删除：docker rm == 删除容器（先停止，后删除）

3. 修改页面
4. 保存镜像修改

   - 提交：docker commit == 改变后的容器打包成一个镜像

     1. `docker commit -m "update index.html" mynginx mynginx:v1.0`
     2. mynginx：容器名
     3. mynginx:v1.0：打包后的 镜像名:版本号

   - 保存：docker save == 把镜像保存成文件（给他人用）

     1. `docker save -o mynginx.tar mynginx:v1.0`
     2. -o mynginx.tar：打压缩包并给其命名；

   - 加载：docker load == 加载压缩包中的镜像

     1. `docker load -i mynginx.tar`
     2. -i：加载压缩包地址

5. 分享社区

   - 登录：docker login
   - 命名：docker tag

     1. `docker tag mynginx:v1.0 zzy/mynginx:v1.0`
     2. mynginx:v1.0：打包后的 镜像名:版本号
     3. zzy/mynginx:v1.0：用户名/镜像名:版本号

   - 推送：docker push

     1. `docker push zzy/mynginx:v1.0`

## 存储：容器数据不再丢失

2 种实现：目录挂载 / 券映射

- 目录挂载：用宿主机的空间存储，挂载到 docker 空间对应位置；

  1. docker 启动时：宿主机没有初始化文件夹会自动创建（不会创建具体文件）；
  2. docker 启动后：docker 内部修改，会同步到外部（宿主机）；外部（宿主机）修改，会同步到 docker 内部；

  - `docker run -d -p 89:80 -v /app/nghtml:/usr/share/nginx/html --name app01 nginx`
  - `-v /app/nghtml:/usr/share/nginx/html`：挂载内容
  - 特性：

- 卷映射： 起卷名，docker 会自动创建存储在“宿主机的位置”；

  1. docker 启动时：把 docker 内部的指定文件夹及所有内容，映射到外部（宿主机）中的文件夹中；
  2. docker 启动后：docker 内部修改，会同步到外部（宿主机）；外部（宿主机）修改，会同步到 docker 内部；
  3. 与挂载路径的区别：不以“/”或“./”开始；

  - `docker run -d -p 89:80 -v /app/nghtml:/usr/share/nginx/html -v ngconf:/etc/nginx --name app01 nginx`
  - 卷映射： `-v ngconf:/etc/nginx`：ngconf：卷名；
  - 保存在宿主机的位置：`/var/lib/docker/volumes/<volume-name>`
  - 查看卷列表： `docker volume ls`
  - 创建卷：`docker volume create ngconf`
  - 查看卷详情：`docker volume inspect ngconf`

## 网络: 自定义网络 / Redis 主从集群

- 自定义网络

  1. 查看容器细节：`docker container inspect xxx`
  2. docker 为每个容器分配唯一 IP，使用“容器 IP+容器端口”可以互相访问；
  3. 容器迁移、重启、删除 IP 会变；创建自定义网络，容器名就是稳定的域名；
  4. docker0 默认不支持主机域名；

  - 帮助：`docker network --help`
  - 创建自定义网络`docker network create mynet`
  - 查看：`docker network ls`
  - 容器使用自定义网络：`docker run -d -p 88:80 --name app1 --network mynet nginx`
  - “容器内部”访问“兄弟容器”：`docker exec -it app1 bash`；`curl http://app2:80`

- 主从集群

## 最佳实践（命令）: 网络、存储、环境变量

## docker Compose：docker 批量管理容器的工具

compose.yaml ：代替命令行

- 上线：docker compose up -d （创建容器并启动）
- 下线：docker compose down （移除容器及相关的资源）
- 启动：docker compose start x1 x2 x3 （x1 x2：yaml 中配置的应用名字）
- 停止：docker compose stop x1 x2
- 扩容：docker compose scale x2=3（应用的实例启动 3 份）

* 顶级元素：

  1. version：版本
  2. services：服务
  3. networks：网络
  4. volumes：卷
  5. configs：配置
  6. secrets：密钥

  [docker-compose.yaml](./img/docker-compose.yaml)

## Dockerfile：制作镜像 / 镜像分层机制

1. 镜像包含：基础环境、软件包、启动命令
2. 本地文件上传 Linux，Linux 中的 docker 命令 copy 文件到镜像中；
3. 常见指令：

   - FROM：基础环境；例：node:14-alpine
   - LABEL：author=xiaoming （打标签）
   - RUN：在镜像内执行命令（例: RUN apt-get update && apt-get install -y python3）。
   - COPY/ADD：xx /yy （xx：linux 中的软件包；/yy：镜像中的位置）
   - WORKDIR：设置后续指令的工作目录。
   - ENV：设置环境变量。
   - EXPOSE：声明容器运行时监听的端口。
   - CMD / ENTRYPOINT：指定容器启动时运行的默认命令。

   alpine:基于 linux 的 alpine 发行版构建的，小几十 M

   ```Dockerfile demo
     FROM python:3.9
     COPY . /app
     WORKDIR /app
     RUN pip install -r requirements.txt
     CMD ["python", "app.py"]
   ```

4. 构建镜像：`docker build -f Dockerfile -t myapp:v1.0 .` 最后的点（.）指当前文件夹，相对应 COPY 中的 xx

![容器与镜像存储机制-1](./img/docker-容器与镜像存储机制-1.png)
![容器与镜像存储机制-2](./img/docker-容器与镜像存储机制-2.png)
![docker-应用](./img/docker-应用.png)

## 本地安装

1. windows 需要先开启 Hyper-V 功能；docker 才能正常工作（wsl 安装 ubuntu 也可以）；
2. Hyper-V 与其他虚拟机冲突，例如 Android Studio 中的虚拟机；
3. docker 使用 client-server 架构模式；docker version 看到 2 个才算启动成功；
