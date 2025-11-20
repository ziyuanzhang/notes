# linux 操作系统

## 发送、接受 消息流程

用户--》软件（微信）--》操作系统--》网卡驱动--》物理网卡--》【服务器】--》物理网卡--》网卡驱动--》操作系统--》软件（微信）--》用户

- 物理网卡：千千万种
- 网卡驱动：N 多种
- 操作系统：主要作用是协助用户调度硬件工作，充当用户和计算机硬件之间的桥梁

## Linux 系统组成

- Linux 系统有两部分组成： 1、Linux 系统内核： 2、系统级应用程序

  1. 内核提供系统最核心的功能，如: 调度 CPU、调度内存、调度文件系统、调度网络通讯、调度 I0 等；
  2. 系统级应用程序，可以理解为出厂自带程序，可供用户快速上手操作系统，如: 文件管理器、任务管理器、图片查看、音乐播放等。

## 虚拟机

## 容器化

## 命令行

- Linux 命令基础格式：

  无论是什么命令，用于什么用途，在 Linux 中，命令有其通用的格式：

  command [-options] [parameter]

  1. command：命令本身
  2. -options：[可选，非必填]命令的一些选项，可以通过选项控制命令的行为细节
  3. parameter：[可选，非必填]命令的参数，多数用于命令的指向目标等

  **注：**
  1、语法中的[]，表示可选的意思；
  2、默认在“/home/username”目录下操作，其他目录不可以（除非 root 权限）

1. ls : list(列出目录内容)

   ls [-a -l -h] [Linux 路径]

   - -a：显示全部（包括隐藏文件）
   - -l：显示文件详细信息（列表形式显示）
   - -h：显示文件大小（人性化显示）
   - 组合写法，如：ls -alh

2. cd : change directory(改变目录)

   cd [Linux 路径]

   - 特殊路径符:cd
     - cd 或者 cd /home/“username” ：表示当前用户目录
     - cd / ：表示根目录
     - cd . ：表示当前目录
     - cd ..：表示上一级目录
     - cd ~ ：表示 HOME 目录
     - cd -: 返回上一级目录

3. pwd : print work directory(打印当前目录，现示当前工作目录的绝对路径)
4. mkdir: make directory(创建目录)

   mkdir [ -p ] Linux 路径

   - -p 选项可选，表示自动创建不存在的父目录，适用于创建连续多层级的目录

5. touch : 创建空白文件

   touch Linux 路径（文件全名）；例 touch 1.txt

6. cat : concatenate(连锁 -- 查看文件内容)

   cat Linux 路径（文件全名）；例： cat 1.txt

   - cat 直接将内容全部显示出来

7. more : 查看文件内容

   more Linux 路径

   - more 支持翻页；内容过多，可以一页页的展示；
   - 使用空格翻页，使用 q 退出

8. cp : copy file(复制文件)

   cp [-r] 参数 1 参数 2

   - -r 选项，可选，用于复制文件夹使用，表示递归；
   - 参数 1，Linux 路径，表示被复制的文件或文件夹
   - 参数 2，Linux 路径，表示要复制去的地方

9. mv : move file (移动文件)

## 命令行=

1. 【目录|文件】
   ls : list(列出目录内容)

   pwd : print work directory(打印当前目录，现示当前工作目录的绝对路径)

   cd : change directory(改变目录)

   rmdir: remove directory(删除目录)

   mkdir: make directory(创建目录)

   rm : remove(删除目录或文件)

   mv : move file (移动文件)

   cp : copy file(复制文件)

   cat : concatenate(连锁)
   cat file 1 file 2 >> file 3(把文件 1 和文件 2 的内容联合起来放进 文件 3 中)

2. 【系统|权限】
   su : switch user(切换用户)

   uname: unix name(用于打印当前系统相关信息)

   chown: change owner(改变某和文件或目录所有者和所属的组，，)

   chgrp: change group(用于改变文件或所属的用户组)

   chmod: change mode(用于变更文件或目录的权限)

3. 【进程|磁盘】
   ps : process status(进程状态，类似于 wins 任务管理器)

   常用参数: -auxf ps -auxf (进程现示状态)

   df : disk free(显示磁盘可用空间数目信息及空间节点信息。换句话说，就是查看在任何安装的设备或目录中还剩多少自由空间)

   du : disk usage(查看已使用空间)

4. 【打包管理】
   rpm : redhat package manger(红帽子打包管理器)

   dpkg: debian package manager

   apt: advanced package tool

5. 【文件后缀】
   文件结尾的 rc: resource configratin(如 .xinitrc, .bashrc 等)

   knnxxx/snnxxx(位于 rcx.d 目录下):k(kill),s(service);nn(执行顺序号);xxx(服务标识)

   .a(扩展名 a): archive ,static library

   .s(扩展名 so): shared object,dynamically linked library

   .o(扩展名 o): olbject file, compiled result of c/c++ source file

6. 【部分 linux 目录|参数 缩写】
   bin = binarines

   /dev = devices

   /dev = etcetera

   /lib = library

   /proc = processes

   /sbin= superuser binaries

   /tmp= temporary

   /usr= unix shared resources

   /var= variable

   ? fifo= first in ,fitst out

   grub= grand unified bootloader

   ifs= internal field seperators

   lilo= linux loader

   mysql= my 是最初作者的女儿的名字，sql=structured query language

   php= personal home page tools=php hypertext preprocessor

   ps = prompt string

   perl= pratical extraction and report language=pathologically eclectic rubbish lister python 得名于电视剧 monty python's flying circus

   tcl= tool command language

   tk = toolkit

   vt = video terminal

   yast= yet another

7. 【other】
   insmod: install module(载入模块)

   lsmod: list modules(用于显示已加载到内核模块的状态信息)

   rmmod:remove module

   in -s : link -soft(创建一个软链接，相当于创建一个快捷方式)

   touch man:manual

   mkfs: make file system (创建 linux 系统文件)

   fsck: file system check(用于检查并试图修复文件系统中错误)

   ln : link file(用于文件创建连接分为硬盘连接和符号连接)

   fg : foreground(用于后台作业放到前台终端运行)

   bg : background(用于将作业放到后台运行)

   umount: unmount(用于卸载已经加载的系统文件)

   tar : tape archive

   ldd : list dynamic dependencies
