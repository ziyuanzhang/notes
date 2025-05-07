http://ask.dcloud.net.cn/article/182
https://blog.csdn.net/qq_31093755/article/details/81668924

# uniapp 开发注意事项：

- 开发 app 时：input 有默认 mix-height；
- 用 sqlite 插入多条数据时：用“；”必要用字符串数组；

- 背景图 :style="'background:url('+imageSrc+')'"
- 全屏：plus.navigator.setFullscreen(true);
- 推送： 1. app SDK 配置打钩 2.app 模块权限打钩 3.客户端监听函数 4.后台发送（必须打包）

## 推送通道选择逻辑

- Android 平台:

  1. APP 在线（个推推送通道可用）

     - 推送通知 (显示在通知栏)、透传消息(显示在 app 内部 )都使用个推。

  2. APP 离线（个推推送通道不可用）
     - 推送通知：用个推，离线消息会存在消息离线库，等 APP 上线后在推送。
     - 透传消息：配置了手机厂商推送参数并且在对应厂商的手机上，使用厂商推送；否则使用个推的离线推送通道（上线后显示在 app 内部）。

- iOS 平台:

  - 推送通知：uniPush 后台管理界面不支持，个推提供的服务端 API 支持（设置 APN 参数则通过苹果的 APNS 通道，否则使用个推通道）。
  - 透传消息：设置 APN 参数则通过苹果的 APNS 通道，否则则使用个推。

- 厂商推送：必须先绑定厂商 在云打包，云打包的包名 == 厂商的包名（应用名不管）
