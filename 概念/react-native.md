# react native

## 安装

1. 直接整个电脑代理（翻墙），不要在 android studio 中配代理
2. 下载安装 openJDK 或 javaJDK ，配置环境变量（半小时）
3. 下载安装 android studio（半小时）
4. 下载安装 android SDK 和依赖，最好先改路径（settings / languages&Frameworks / android SDK）
   - 运气好 2 小时能下载完;
   - 修改 android 依赖源；“项目/android/build.gradle/buildscript-repositories 和 allprojects-repositories” 都需要改
5. react native 英文官网，找 “Guides/ 环境设置 / get started without a framework”，安提示安装
6. 执行`npx @react-native-community/cli@latest init myProject --version X.XX.X`
7. 先`npm install` ； 安卓原生可能会出错，再用 android studio 安装
8. 启动 `npm start`，大概率会报错；
9. 报错提示`npx react-native start`, 需要先安装 react-native 的 cli `npm install -g react-native-cli`，再执行`react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`
10. 启动 `npm start`，大概率能正常启动

## 调试 -- 模拟器

1. 服务默认端口号：8081
2. cmd: netstat -aon|findstr "8081" 看端口被占用没？被占用能杀死不？不能杀死，修改 package.json 中的端口`--port 8088`
3. 模拟器 settings -> debugging->debug server host & port for device, 写电脑 IP + 端口号（默认 8081）
4. 飘红的话，换端口号

## patch-package 修复包
