# webpack 2-loader [原文](https://juejin.cn/post/7145804033037434894)

**要求**：loader 机制告诉我们在函数处理结果返回的时候，必须是一段 JavaScript 可执行的代码。

## 为什么 webpack 建议我们在 js 文件中引入其他资源

1. 便于统一资源管理

   - 如果我们单独去打包某个与 js 产生依赖的 css、图片、字体等，那么我们将会有额外的对 html 页面的操作。
   - 如果这一部分功能废弃掉了，那么我们有必须要去操作 html 页面，把不需要的模块资源移除掉，增加了额外操作。

2. 防止必要文件丢失

   通过依赖关系，可以最大程度上保证资源文件不会丢失，在生产环境下可以避免重要经济损失。

## loader 特性

1. loader 支持链式传递，一组链式的 loader 将按照相反的顺序执行。
   loader 链中的第一个 loader（最后一个位置的） 返回值给下一个 loader。在最后一个 loader，返回 webpack 所预期的 JavaScript。
2. loader 可以是同步的，也可以是异步的。
3. loader 运行在 Node.js 中，并且能够执行任何可能的操作。
4. loader 接收查询参数。用于对 loader 传递配置。
5. loader 也能够使用  options  对象进行配置。
6. 除了使用  package.json  常见的  main  属性，还可以将普通的 npm 模块导出为 loader，做法是在  package.json  里定义一个  loader  字段。
7. 插件(plugin)可以为 loader 带来更多特性。
8. loader 能够产生额外的任意文件。

## 有哪些常⻅的 Loader

1. file-loader：把⽂件输出到⼀个⽂件夹中，在代码中通过相对 URL 去引⽤输出的⽂件
2. url-loader：和 file-loader 类似，但是能在⽂件很⼩的情况下以 base64 的⽅式把⽂件内容注⼊到代码中去
3. source-map-loader：
4. image-loader：
5. babel-loader：
6. css-loader：
7. style-loader：
8. eslint-loader：

## 开发一个 loader 常用的 Api

1. this.async ：获取一个 callback 函数，处理异步。
2. this.callback ：同步 loader 中，返回的方法。
3. this.emitFile ：产生一个文件。
4. this.getOptions ：根据传入的 schema 获取对应参数，在 webpack5 中，schema 已经不用再写了，getOptions 可以获取到上下文中的配置参数。
5. this.importModule ：用于子编译器在构建时编译和执行请求。
6. this.resourcePath ：当前资源文件的路径。
