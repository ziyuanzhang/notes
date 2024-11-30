## webpack 热更新的实现原理 (Hot Module Replacement)？[参考](https://blog.csdn.net/weixin_44116302/article/details/137911381)

```
   "scripts": {
    "dev": "webpack-dev-server --config webpack.dev.js"
   },
   "devDependencies": {
     "webpack": "^5.90.3",
     "webpack-cli": "^5.1.4",
     "webpack-dev-server": "^5.0.2"
   }
```

```webpack.dev.js
   'use strict';
   const path = require('path');
   module.exports = {
       entry: './src/index.js', // 入口文件
       output: {
   			path: path.resolve(__dirname, 'dist'), // 输出到哪个文件夹
   			filename: 'output.js' // 输出的文件名
       },
       mode: 'development', // 开发模式
       devServer: {
         static: path.resolve(__dirname, "dist");
         hot: true // 多了这一行
       }
   };
```

```index.js
   if (module.hot) {
       module.hot.accept();
   }
   ======================
   if (module.hot) {
     module.hot.accept('./child', () => {
       console.log('child.js文件进行了更新')
     });
   }
```

![](./img/webpack-HMR.png)

- 上图底部红色框内是服务端，而上面的橙色框内是浏览器端。

* 绿色填充的方框是 webpack 代码控制的区域。
* 深蓝色填充的方框是 webpack-dev-server 代码控制的区域。
* 洋红色填充的方框是文件系统，文件修改后的变化就发生在这。
* 青色填充的方框是应用本身。

上图显示了我们修改代码到模块热更新完成的一个周期，通过深绿色的阿拉伯数字符号已经将 HMR 的整个过程标识了出来。

1. 在 webpack 的 watch 模式下，文件系统中某一个文件发生修改，webpack 监听到文件变化，根据配置文件对模块重新编译打包。

2. webpack-dev-server 和 webpack 之间的接口交互，而在这一步，主要是 webpack-dev-server 的中间件 webpack-dev-middleware 和 webpack 之间的交互，webpack-dev-middleware 调用 webpack 暴露的 API 对代码变化进行监控，并且告诉 webpack 将代码打包到内存中。

3. webpack-dev-server 对文件变化的一个监控，这一步不同于第一步，并不是监控代码变化重新打包。当我们在配置文件中配置了 static 属性时，webpack-dev-server 会监听这些文件夹中静态文件的变化，变化后会通知浏览器端对应用进行 window.location.reload()。注意，这儿是浏览器刷新，和 HMR 是两个概念。

4. webpack-dev-server 代码的工作，主要是通过 sockjs（webpack-dev-server 的依赖）在浏览器端 webpack-dev-server/client 和服务端之间建立一个 websocket 长连接，将 webpack 编译打包的各个阶段的状态信息告知浏览器端，同时也包括第三步中 Server 监听静态文件变化的信息。浏览器端根据这些 socket 消息进行不同的操作。当然服务端传递的最主要信息还是新模块的 hash 值，后面的步骤根据这一 hash 值来进行模块热替换。

5. webpack-dev-server/client 端并不能够请求更新的代码，也不会执行热更新模块操作，而把这些工作又交回给了 webpack，webpack/hot/dev-server 的工作就是根据 webpack-dev-server/client 传给它的信息以及 webpack-dev-server 的配置决定是刷新浏览器呢还是进行模块热更新。当然如果仅仅是刷新浏览器，也就没有后面那些步骤了。

6. HotModuleReplacement.runtime 是客户端 HMR 的中枢，它接收到上一步传递给他的新模块的 hash 值，它通过 webpack_require.hmrM 向 server 端发送 fetch 请求，服务端返回一个 json，该 json 包含模块变更的信息的 json 文件，模块名与 hash 进行组合获取到更新列表后，该模块再次通过 jsonp 请求，获取到最新的模块代码。这就是上图中 7、8、9 步骤。

7. 而第 10 步是决定 HMR 成功与否的关键步骤，在该步骤中，HotModuleReplacement.runtime 将会对新旧模块进行对比，决定是否更新模块，在决定更新模块后，检查模块之间的依赖关系，更新模块的同时更新模块间的依赖引用。最后一步，当 HMR 失败后，回退到 window.location.reload() 操作，也就是进行浏览器刷新来获取最新打包代码。
