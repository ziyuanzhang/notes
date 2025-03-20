# webpack 的核心能力就是“静态模块打包能力” -- 包括图片、css、js 等，转译、组合、拼接、生成 JS 格式的 bundler 文件

## Webpack 有以下几个核心概念

- Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
- Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
- Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
- Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
- Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。

Webpack 启动后会从 Entry 里配置的 Module 开始递归解析 Entry 依赖的所有 Module。 每找到一个 Module， 就会根据配置的 Loader 去找出对应的转换规则，对 Module 进行转换后， 再解析出当前 Module 依赖的 Module。 这些模块会以 Entry 为单位进行分组，一个 Entry 和其所有依赖的 Module 被分到一个组也就是一个 Chunk。 最后 Webpack 会把所有 Chunk 转换成文件输出。 在整个流程中 Webpack 会在恰当的时机执行 Plugin 里定义的逻辑。

- name: hash / chunkhash / contenthash
  1. hash：和整个项目的构建有关；只要有文件更改，整个项目的 hash 值都会更改；
  2. chunkhash：和 webpack 打包的 chunk 有关；不同的 entry 生成不懂的 chunkhash；
  3. contenthash:根据文件内容来定义；文件内容不变，contenthash 不变；（js,css）分开；

## 构建流程

Webpack 底层的工作流程大致可以总结为这么几个阶段：

1. 初始化阶段：

   - 初始化参数：从配置文件、 配置对象、Shell 参数中读取，与默认配置结合得出最终的参数；
   - 创建编译器对象 （Compiler）：用上一步得到的参数创建 `Compiler 对象`, 其中存储了配置信息，挂载了许多生命周期 hook。
   - 初始化编译环境：包括注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等；
   - 开始编译：执行 `compiler 对象`的 `run 方法`，创建 `Compilation 对象`，调用 `compiler.compile` 方法开始执行构建。
   - 确定入口：根据配置中的 `entry` 找出所有的入口文件，调用 `compilation.addEntry` 将“入口文件”转换为 `dependence 对象（依赖对象）`。把入口文件的绝对路径添加到依赖数组，记录此次编译依赖的模块。

2. 构建阶段：

   - 编译模块(make)：从 entry 文件开始，调用 loader 将模块转译为标准 JS 内容，调用 JS 解析器将内容转换为 `AST 对象`，从中找出该模块依赖的模块，再 `递归` 处理这些依赖模块，直到所有入口依赖的文件都经过了本步骤的处理；
   - 完成模块编译：上一步递归处理所有能触达到的模块后，得到了每个模块被翻译后的内容以及它们之间的 `依赖关系图（ModuleGraph）`。构建阶段经历了 `module => ast => dependences => module` 的流转，先将源码解析为 AST 结构，再在 AST 中遍历 import 等模块导入语句，收集模块`依赖数组dependences`，最后遍历 dependences 数组将 `Dependency` 转换为 `Module` 对象，之后递归处理这些新的 Module，直到所有项目文件处理完毕。

3. 封装阶段：

   - 合并(seal)：根据入口和模块之间的依赖关系，模块转译，收集运行时依赖（其实在上一阶段就已经进行了，基于静态代码分析的方式收集运行时依赖），将模块代码与运行时代码合并，组装成一个个包含多个模块的 `Chunk`；
   - 优化(optimization)：对上述 Chunk 施加一系列优化操作，包括：tree-shaking、terser、scope-hoisting、压缩、Code Split 等；
   - 写入文件系统(emitAssets)：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统，生成 Bundle IIFE。

三个阶段环环相扣，「初始化」的重点是根据用户配置设置好构建环境；「构建阶段」则重在解读文件输入与文件依赖关系；最后在「生成阶段」按规则组织、包装模块，并翻译为适合能够直接运行的产物包。三者结合，实现 Webpack 最核心的打包能力，其它功能特性也几乎都是在此基础上，通过 Hook 介入、修改不同阶段的对象状态、流程逻辑等方式实现。

**编译过程用到的 Webpack 基础对象：**

- Entry：编译入口；
- compiler 对象: 全局编译管理器，Webpack 启动后会创建 compiler 对象，该对象一直存活直到构建结束进程退出。Compiler 暴露许多钩子，插件根据不同的生命周期，在不同的 hook 中处理不同的事情。

  负责管理配置信息、Loader、Plugin 等

- compilation 对象: 单次构建过程的管理器，比如 watch = true 时，运行过程中只有一个 compiler，但每次文件变更触发重新编译时，都会创建一个新的 compilation 对象。Compilation 负责构建编译模块并生成 chunk，并利用插件进行优化。

  负责遍历模块，执行编译操作；当 watch = true 时，每次文件变更触发重新编译，都会创建一个新的 compilation 对象；

- Dependence：依赖对象，记录模块间依赖关系；dependence 对象记录了 entry 的类型、路径等信息。
- Module：Webpack 内部所有资源都会以 Module 对象形式存在，所有关于资源的操作、转译、合并都是以 Module 为单位进行的；
- Chunk：编译完成准备输出时，将 Module 按特定的规则组织成一个一个的 Chunk。Chunk 是一个或多个 Module 的集合。Chunk 又分为 Entry Chunk（入口文件作为单独的 chunk）、Async Chunk（异步模块作为单独 chunk）、Runtime Chunk（收集的运行时作为单独的 chunk）

某种程度上可以将 webpack 架构简化为 compiler + compilation + plugins；  
webpack 运行过程中只会有一个 compiler， 而每次编译（包括调用 compiler.run 函数 或 watch = true 时文件发生变更）都会创建一个 compilation 对象。

- Note:

  通过阅读 webpack 源码，可以发现一个有意思的设计，webpack 的核心是 webpack 的 compiler 对象，而 compiler 对象本身就是一个 Tapable 实例。compiler 对象的职责是编译 webpack 的配置对象，并返回一个 Compilation 实例。当 Compilation 实例运行时，它会创建所需的 bundle（也就是编译结果了）。

## [compiler 事件钩子](https://webpack.docschina.org/api/compiler-hooks/#entryoption)

| 事件钩子      | 触发时机                                            | 得到的内容       | 类型   |
| ------------- | --------------------------------------------------- | ---------------- | ------ |
| entry-option  | 初始化 option                                       | -                | 同步   |
| run           | 开始编译                                            | compiler         | 异步 > |
| compile       | 真正开始的编译，在创建 compilation 对象之前         | compilation 参数 | 同步   |
| compilation   | 生成好了 compilation 对象，可以操作这个对象啦       | compilation      | 同步   |
| make          | 从 entry 开始递归分析依赖，准备对每个模块进行 build | compilation      | 并行 = |
| after-compile | 编译 build 过程结束                                 | compilation      | 异步 > |
| emit          | 在将内存中 assets 内容写到磁盘文件夹之**前**        | compilation      | 异步 > |
| after-emit    | 在将内存中 assets 内容写到磁盘文件夹之**后**        | compilation      | 异步 > |
| done          | 完成所有的编译过程                                  | stats            | 同步   |
| failed        | 编译失败的时候                                      | error            | 同步   |

## Tapable & Tapable 实例 (Tapable 类似于 NodeJS 的 EventEmitter 类，专注于自定义事件的触发和操作。)

## Tapable 官方文档提供了这九种钩子

```code
    const {
        SyncHook, //同步基础钩子
        SyncBailHook, //同步--保险类型钩子
        SyncWaterfallHook,//同步--瀑布类型的钩子
        SyncLoopHook,//同步--循环类型钩子

        AsyncParallelHook, // 异步并行钩子
        AsyncParallelBailHook, // 异步并行钩子

        AsyncSeriesHook, //异步串行
        AsyncSeriesBailHook, //异步串行
        AsyncSeriesWaterfallHook //异步串行
    } = require("tapable");

```

1. Basic Hook(基本类型钩子) : 它仅仅执行钩子注册的事件，不关心每个被调用的事件(函数)返回值如何。

   ![](./img/webpack-tapable-basehook.webp "markdown")

2. Waterfall(瀑布类型钩子) : 瀑布类型的钩子和基本类型的钩子基本类似，唯一不同的是瀑布类型的钩子会在注册的事件执行时将事件函数执行非 undefined 的返回值传递给接下来的事件函数作为参数。

   ![](./img/webpack-tapable-Waterfall.webp "markdown")

3. Bail(保险类型钩子) : 保险类型钩子在基础类型钩子上增加了一种保险机制，如果任意一个注册函数执行返回非 undefined 的值，那么整个钩子执行过程会立即中断，之后注册事件函数就不会被调用了。

   ![](./img/webpack-tapable-Bail.webp "markdown")

4. Loop(循环类型钩子) : 循环类型钩子稍微比较复杂一点。循环类型钩子通过 call 调用时，如果任意一个注册的事件函数返回值非 undefeind ,那么会立即重头开始重新执行所有的注册事件函数，直到所有被注册的事件函数都返回 undefined。

   ![](./img/webpack-tapable-Loop.webp "markdown")

## HMR--Hot Module Replacement（模块热更新） 热更新 原理

Webpack HMR 特性的执行过程并不复杂，核心：

1. 使用 webpack-dev-server （后面简称 WDS）托管静态资源，同时以 Runtime 方式注入一段处理 HMR 逻辑的客户端代码；
2. 浏览器加载页面后，与 WDS 建立 WebSocket 连接；
3. Webpack 监听到文件变化后，增量构建发生变更的模块，并通过 WebSocket 发送 hash 事件；
4. 浏览器接收到 hash 事件后，请求 manifest 资源文件，确认增量变更范围；
5. 浏览器加载发生变更的增量模块；
6. 经过上述步骤，浏览器加载完最新模块代码后，HMR 运行时（Hot Module Replacement Runtime）会继续触发“变更模块的” module.hot.accept 回调，将最新代码替换到运行环境中
7. done。

当 HMR 失败后，回退到 live reload 操作，也就是进行浏览器刷新来获取最新打包代码。这就是 Webpack HMR 特性的执行过程

HMR 运行时（Hot Module Replacement Runtime）是 Webpack 在打包时注入到客户端代码中的一部分逻辑，它的主要职责包括：

- 监听服务端的更新通知：通过 WebSocket 接收服务端推送的模块更新信息。
- 检查更新的模块：确定哪些模块发生了变化。
- 处理模块的热替换：根据模块是否注册了 module.hot.accept，决定如何更新模块。

## 热更新原理

Webpack 的热更新（HMR）是 “客户端和服务端协同工作” 的结果，但触发热更新的核心逻辑是由 “客户端” 处理的。具体来说：

1. 服务端的作用

   Webpack 的开发服务器（通常是 webpack-dev-server 或 webpack-hot-middleware）负责以下工作：

   - 监听文件系统的变化（通过 webpack 的 watch 模式）。
   - 当文件发生变化时，重新编译模块。
   - 通过 WebSocket 将更新的模块信息（通常是一个 JSON 文件或 JavaScript 代码块）推送到客户端。

   服务端的职责是 “检测变化并推送更新”，但它并不直接决定如何处理这些更新。

2. 客户端的作用

   客户端（通常是浏览器中运行的 JavaScript 代码）负责以下工作：

   - 通过 WebSocket 接收服务端推送的更新信息。
   - 根据更新信息，决定是否接受热更新。
   - 调用 module.hot.accept 来注册热更新回调，处理模块的替换逻辑。

   客户端的职责是 “接收更新并决定如何处理”，这是热更新的核心逻辑所在。

3. module.hot.accept 的调用

   module.hot.accept 是 “客户端代码” 的一部分，它的调用是由客户端触发的。具体流程如下：

   - 服务端检测到文件变化并重新编译模块。
   - 服务端通过 WebSocket 通知客户端有新的更新。
   - 客户端接收到更新后，检查是否有对应的模块调用了 module.hot.accept。
   - 如果有，客户端会执行 module.hot.accept 中注册的回调函数，完成模块的热替换。

4. 总结

   - 服务端：负责检测文件变化、重新编译模块，并通过 WebSocket 推送更新信息。
   - 客户端：负责接收更新信息，调用 module.hot.accept 处理热更新逻辑。

   因此，module.hot.accept 是由 “客户端触发” 的，但它的执行依赖于服务端推送的更新信息。两者协同工作，才能实现完整的热更新功能。

5. 示例

   ```// index.js（入口文件）
   import App from './App';
   function render() {
     ReactDOM.render(<App />, document.getElementById('root'));
   }
   render();
   if (module.hot) {
     module.hot.accept('./App', () => {
       // 当 ./App 模块更新时，重新渲染
       render();
     });
   }
   ```

   - 服务端检测到 App.js 文件发生变化，重新编译模块，并通过 WebSocket 推送更新信息到客户端。
   - 客户端接收到更新信息后，HMR 运行时会检查 ./App 模块是否注册了 module.hot.accept。
   - 发现 index.js 中为 ./App 模块注册了 module.hot.accept，于是执行回调函数 render()，重新渲染应用。
