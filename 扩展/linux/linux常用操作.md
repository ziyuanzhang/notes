# linux 常用操作

- 云服务器(Elastic Compute Service, ECS)是一种简单高效、安全可靠、处理能力可弹性伸缩的计算服务。

1. sudo(管理员权限)

   - sudo -i(切换管理员账号)
   - sudo apt update(更新软件包索引)
   - sudo apt upgarde(更新软件包)
   - sudo apt install git 软件包的名字(下载安装软件包)

2. ls(查看当前目录下文件)

   - ls-a(查看隐藏文件)

3. cd(切换目录)

   - cd .. (返回上一级)
   - cd ~ (返回根目录也就是 root 目录)

4. vi(vi 编辑器)

   - iv 文件名 (查看文件内容，没有则新建)
     1. i(插入-可以编辑)
     2. sec 键 + :wq(保存并退出)

5. rm(删除文件)

   - rm(删除文件)
   - rm -r 文件夹 (删除目录和里面的所有文件)

6. mkdir(新建目录)
7. git(git 工具)

   - sudo apt install git-lfs(安装 git-lfs)
   - git lfs install(安装完后，初始化)

   * git clone(克隆项目，也就是复制别人的代码)
   * git lfs pull(拉取大文件)
   * git lfs ls-files(检查文件完整性)

8. conda(虚拟环境工具)

   - conda create -name xxx python=(创建虚拟环境)
   - conda init(初始化)
   - conda activate(激活环境)

9. docker(docker 工具)

   - docker ps (查看运行中的服务)
   - docker images (查看拉取好的服务，包含运行中的和未运行的)
   - docker-compose up -d (用 docker-compose 启动服务)
   - docker-compose down (停止服务)
   - docker-compose restart (重启服务 -- 必须在对应目录下)
   - docker restart (重启 docker 服务 -- 无视目录)
   - docker run (运行一个新的 docker 容器)
   - docker start (启动服务)
   - docker stop (停止服务)
   - docker --version，docker-compose --version（查看版本，也可以用来查看是否安装）
   - docker rm (删除服务)
   - docker restart$(docker ps -q)(重启所有服务)

10. ssh -CNg -L 6006:127.0.0.1:9001 root@connect.westb.seetacloud.com -p 12933（ssh 隧穿命令）

## 服务器 购买

1. 腾讯的按流浪计费（便宜）
2. 不用时关机，每次开机公网 IP 会变化
3. 安全组添加端口号，不加无法访问
4. ls:
5. cat index.html：查看 index.html 内容
6. echo 2222 > index.html： 写入
7. exit：退出容器

- python 教程中服务器购买
- docker 教程中服务器购买
