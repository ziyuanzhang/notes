# CentOS—— 关机重启命令

## jenkins 自动构建 shutdown 命令

命令格式： shutdown  [选项]    时间
   - -c：取消前一个关机命令
   - -h：关机
   - -r：重启
     shutdown  -r  now 立即重启
     shutdown  -h  now 立即关机

## 接下来我们就来看几个常见的处理目录的命令吧

- ls: 列出目录
- cd：切换目录
- pwd：显示目前的目录
- mkdir：创建一个新的目录
- rmdir：删除一个空的目录
- cp: 复制文件或目录
- rm: 移除文件或目录
- mv: 移动文件与目录，或修改文件与目录的名称

## Linux 系统中使用以下命令来查看文件的内容

- cat  由第一行开始显示文件内容
- tac  从最后一行开始显示，可以看出 tac 是 cat 的倒著写！
- nl    显示的时候，顺道输出行号！
- more 一页一页的显示文件内容
- less 与 more 类似，但是比 more 更好的是，他可以往前翻页！
- head 只看头几行
- tail 只看尾巴几行
- 你可以使用  man [命令]来查看各个命令的使用文档，如 ：man cp。
- ip 地址：ip addr

## linux 下删除文件夹及下面所有文件

- 使用 rm -rf 目录名字 命令即可
- -r 就是向下递归，不管有多少级目录，一并删除
- -f 就是直接强行删除，不作任何提示的意思
- rm 不带参数 只能删除文件
- rm test.txt

## jenkins 安装

1. jenkins 启动一直显示 Jenkins 正在启动,请稍后...
      cd /var/lib/jenkins/updates
2. jenkins 添加对应 jdk 支持
      vim /etc/init.d/jenkins
      candidates="
      /usr/java/jdk1.8.0_171/bin/java
      /etc/alternatives/java
      /usr/lib/jvm/java-1.8.0/bin/java
      /usr/lib/jvm/jre-1.8.0/bin/java
      /usr/lib/jvm/java-1.7.0/bin/java
      /usr/lib/jvm/jre-1.7.0/bin/java
      /usr/bin/java
      "
3. 默认用户名(admin)、 密码
      cd /var/lib/jenkins/secrets
      vim initialAdminPassword(a2ea5110bfd04166874ca908201277df)
      zzy123
4. 默认端口：
      vim /etc/sysconfig/jenkins
5. jenkins -》系统管理-》
      - 插件配置 : nodejs Plugin
      - 全局工具配置: nodejs （填别名，以后用到，jenkins 同时支持多个版本的 node）
      - 系统配置（Configure System）：Publish over SSH【在配置服务器之前需要安装 Publish over SSH 插件】 --》SSH Servers --》
        SSH Server name : 目标服务器名字
        Hostname：目标服务器 IP
        Username：root(用户)
        Remote Directory：/（根目录）
         高级：Passphrase / Password （用户密码）
         高级：Port 端口号

## jenkins 构建

### 自由风格

1. 新建任务（item）
2. 名字 -->自由风格
3. General：
       参数化构建过程(This project is parameterized) --> boolean parameter（还有其他类型可选）
      - 名称：npm_install ；
      - 描述：是否强制安装 npm 依赖包
4. 源码管理 :git
      - url:git 地址；
      - 用户名密码；(添加按钮新增)
      - 分支
5. 构建环境-->Provide Node & npm bin/ folder to PATH
6. 构建--执行 shell（excute shell）

   ```code
      ----------------------start---------------------------
      #!/bin/bash
      echo ${host}
      if ${npm*install} || [ ! -d "node_modules" ];then
          echo "you are using npm install"
          npm install
      fi #构建
      rm -rf ./dist/\*
      npm run build #标记版本
      gitVersion=`git rev-list --tags --max-count=1`
      version=`git describe --tags $gitVersion`
      echo "your version is : $version"
      echo "$version" > ./dist/version.html #打包
      tar -zcvf dist.tar.gz ./dist
      #------打包完成----
      cd /usr/local/tomcat2/webapps/  #进入 web 项目根目录
      if [ ! -d "kds" ];then
        mkdir kds
      fi
      mv /var/lib/jenkins/workspace/kds/dist.tar.gz /usr/local/tomcat2/webapps/kds  #移动刚刚打包好的项目到 web 项目根目录
      cd kds
      rm -rf static
      rm -rf index.html
      tar -zxvf dist.tar.gz -C ./  #解压 dist 到当前目录
      mv dist/* ./
      #------移动 dist 下的文件到当前目录----------
      rm -rf dist
      rm -rf version.html
      rm -rf dist.tar.gz    #删除压缩包
      -----------------------------end-------------------------------------
   ```

   注：全局配置 node；git 版本过低
   tar -zxvf /usr/local/nginx/html/ship-front/dist.tar.gz -C /usr/local/nginx/html/ship-front
   \cp -r /usr/local/nginx/html/ship-front/dist/\_ /usr/local/nginx/html/ship-front
   文件夹名字和压缩后的包名字不是同一个：包里面是文件夹
   tar -zcvf zzWechatEdit_build.tar.gz -C ./build . 【加-C、最后面的“.” 打压缩包时不带文件夹那层】

### 流水线风格 -- Groovy 语法

1. 新建任务（item）
2. 名字 -->流水线
3. General：
       参数化构建过程(This project is parameterized) --> boolean parameter
      - 名称：npm_install ；
      - 描述：是否强制安装 npm 依赖包
4. 流水线：pipeline script
    - 选择 使用 Groovy 沙盒
    - 流水线语法--》 示例步骤——》
   1、git:Git --》 url -->分支-->凭据（添加凭据） --》生成的 git 流水线语法
   git branch: "${branch}", credentialsId: "${git_auth}", url: "${git_url}"
   2、sshPublisher: Send build artifacts over SSH
   SSH Server Name：目标服务器
   Transfer Set Source files：要放到目标服务器的文件【jenkins 流水线打包后的文件，例如 dist/\*\*】
   Remote directory: 目标服务器的文件夹
   Exec command：放到目标文件夹后执行的 shell 脚本

   ```code
   pipeline {
       agent any
       tools {nodejs "node14.17.5"}
       environment {
           // git 凭证 ID
           def git*auth = "xxxxxxxx"
           // git 的 url 地址
           def git_url = "xxxxxxxx"
           // 分支
           def branch = "dev"
       }
       stages {
           stage('拉取代码') {
               steps {
                   git branch: "${branch}", credentialsId: "${git_auth}", url: "${git_url}"
                   echo '拉取成功'
               }
           }
           stage('node版本') {
               steps {
                   sh "node -v"
                   sh "npm -v"
               }
           }
           stage('执行构建') {
               steps {
                   script{
                       echo "npm_install:${npm_install}"
                       if("${npm_install}"=="true"){
                        // sh "rm -rf node_modules"
                         echo "安装依赖"
                         sh "npm install"
                       }
                   }
                   sh "npm run buildTest"
                   echo '构建完成'
               }
           }
           stage('压缩') {
               steps {
                   sh "tar -zcvf xxx.tar.gz -C ./build ."
                   echo '压缩完成'
               }
           }
           stage('放置到目标服务器') {
               steps {
                   echo "放置到目标服务器"
                   sshPublisher(publishers: [sshPublisherDesc(
                       configName: 'pre-node2',
                       transfers: [sshTransfer(
                           cleanRemote: false,
                           excludes: '',
                           execCommand: '''cd /tmp/html-test
   if [ -d "xxx" ]; then
                               tar -czvf xxx*$(date +%Y.%m.%d-%H:%M:%S).tar.gz xxx
                              rm -rf xxx
   fi
                              mkdir xxx
                              tar -xzvf xxx_build.tar.gz -C xxx
                              rm -rf xxx_build.tar.gz''',
                           execTimeout: 120000,
                           flatten: false,
                           makeEmptyDirs: false,
                           noDefaultExcludes: false,
                           patternSeparator: '[, ]+',
                           remoteDirectory: '/tmp/html-test',
                           remoteDirectorySDF: false,
                           removePrefix: '',
                           sourceFiles: 'xxx_build.tar.gz')],
                       usePromotionTimestamp: false,
                       useWorkspaceInPromotion: false,
                       verbose: false)])
               }
           }
       }
   }
   ```
