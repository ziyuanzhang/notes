# 一文吃透 Webpack5 核心原理 [原文](https://zhuanlan.zhihu.com/p/363928061)

将 webpack 整个庞大的体系抽象为三方面的知识：

1. 构建的核心流程；
2. loader 的作用；
3. plugin 架构与常用套路；

某种程度上可以将 webpack 架构简化为 compiler（编译者） + compilation（编译-名词） + plugins ，  
webpack 运行过程中只会有一个 compiler ；  
而每次编译 —— 包括调用 compiler.run 函数或者 watch = true 时文件发生变更，都会创建一个 compilation 对象。

## 核心流程：也就是将各种类型的资源，包括图片、css、js 等，转译、组合、拼接、生成 JS 格式的 bundler 文件

这个过程核心完成了 “内容转换 + 资源合并” 两种功能，实现上包含三个阶段：

1. 初始化阶段：

   1. 初始化参数：从配置文件、 配置对象、Shell 参数中读取，与默认配置结合得出最终的参数。
   2. 创建编译器对象：用上一步得到的参数创建 `Compiler 对象`。
   3. 初始化编译环境：包括注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等。
   4. 开始编译：执行 `compiler 对象`的 `run` 方法。
   5. 确定入口：根据配置中的 `entry` 找出所有的入口文件，调用 `compilation.addEntry` 将“入口文件”转换为 `dependence 对象（依赖对象）`。

2. 构建阶段：

   1. 编译模块(make)：根据 entry 对应的 dependence 创建 `module 对象`，调用 `loader` 将模块转译为标准 JS 内容，调用 JS 解释器将内容转换为 `AST 对象`，从中找出该模块依赖的模块，再 `递归` 本步骤直到所有入口依赖的文件都经过了本步骤的处理。
   2. 完成模块编译：上一步递归处理所有能触达到的模块后，得到了每个模块`被翻译后的内容`以及它们之间的 `依赖关系图`。

3. 生成阶段：

   1. 输出资源(seal)：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 `Chunk`，再把每个 Chunk 转换成一个单独的文件加入到输出列表；这步是可以修改输出内容的最后机会。
   2. 写入文件系统(emitAssets)：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

**技术名词**:

- Entry：编译入口，webpack 编译的起点;
- Compiler：编译管理器，webpack 启动后会创建 compiler 对象，该对象一直存活知道结束退出;
- Compilation：单次编辑过程的管理器，比如 watch = true 时，运行过程中只有一个 compiler 但每次文件变更触发重新编译时，都会创建一个新的 compilation 对象;
- Dependence：依赖对象，webpack 基于该类型记录模块间依赖关系;
- Module：webpack 内部所有资源都会以“module”对象形式存在，所有关于资源的操作、转译、合并都是以 “module” 为基本单位进行的;
- Chunk：编译完成准备输出时，webpack 会将 module 按特定的规则组织成一个一个的 chunk，这些 chunk 某种程度上跟最终输出一一对应;
- Loader：资源内容转换器，其实就是实现从内容 A 转换 B 的转换器;
- Plugin：webpack 构建过程中，会在特定的时机广播对应的事件，插件监听这些事件，在特定时间点介入编译过程;

### 初始化阶段

![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-1-%E5%88%9D%E5%A7%8B%E5%8C%96%E9%98%B6%E6%AE%B5.jpg "初始化阶段流程图")

解释一下：

1. 将 process.args + webpack.config.js 合并成用户配置
2. 调用 validateSchema 校验配置
3. 调用 getNormalizedWebpackOptions + applyWebpackOptionsBaseDefaults 合并出最终配置
4. 创建 compiler 对象
5. 遍历用户定义的 plugins 集合，执行插件的 apply 方法
6. 调用 new WebpackOptionsApply().process 方法，加载各种内置插件

主要逻辑集中在 WebpackOptionsApply 类，webpack 内置了数百个插件，这些插件并不需要我们手动配置，WebpackOptionsApply 会在初始化阶段根据配置内容动态注入对应的插件，包括：

- 注入 EntryOptionPlugin 插件，处理 entry 配置
- 根据 devtool 值判断后续用那个插件处理 sourcemap，可选值：EvalSourceMapDevToolPlugin、SourceMapDevToolPlugin、EvalDevToolModulePlugin
- 注入 RuntimePlugin ，用于根据代码内容动态注入 webpack 运行时

到这里，compiler 实例就被创建出来了，相应的环境参数也预设好了，紧接着开始调用 compiler.compile 函数

### 构建阶段

构建阶段从 entry 开始递归解析资源与资源的依赖，在 compilation 对象内逐步构建出 module 集合以及 module 之间的依赖关系，核心流程：

![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-2-%E6%9E%84%E5%BB%BA%E9%98%B6%E6%AE%B5.webp "构建阶段流程图")

解释一下，构建阶段从入口文件开始：

1. 调用 handleModuleCreate ，根据文件类型构建 module 子类
2. 调用 loader-runner 仓库的 runLoaders 转译 module 内容，通常是从各类资源类型转译为 JavaScript 文本
3. 调用 acorn 将 JS 文本解析为 AST
4. 遍历 AST，触发各种钩子

   1. 在 HarmonyExportDependencyParserPlugin 插件监听 exportImportSpecifier 钩子，解读 JS 文本对应的资源依赖
   2. 调用 module 对象的 addDependency 将依赖对象加入到 module 依赖列表中

5. AST 遍历完毕后，调用 module.handleParseResult 处理模块依赖
6. 对于 module 新增的依赖，调用 handleModuleCreate ，控制流回到第一步
7. 所有依赖都解析完毕后，构建阶段结束

这个过程中数据流 module => ast => dependences => module ，先转 AST 再从 AST 找依赖。这就要求 loaders 处理完的最后结果必须是可以被 acorn 处理的标准 JavaScript 语法，比如说对于图片，需要从图像二进制转换成类似于 export default "data:image/png;base64,xxx" 这类 base64 格式或者 export default "http://xxx" 这类 url 格式。

compilation 按这个流程递归处理，逐步解析出每个模块的内容以及 module 依赖关系，后续就可以根据这些内容打包输出。

- Webpack 编译过程会将源码解析为 AST 吗？webpack 与 babel 分别实现了什么？

  1. 构建阶段会读取源码，解析为 AST 集合。
  2. Webpack 读出 AST 之后仅遍历 AST 集合；babel 则对源码做等价转换

- Webpack 编译过程中，如何识别资源对其他资源的依赖？

  Webpack 遍历 AST 集合过程中，识别 require/ import 之类的导入语句，确定模块对其他资源的依赖关系

- 相对于 grant、gulp 等流式构建工具，为什么 webpack 会被认为是新一代的构建工具？

  Grant、Gulp 仅执行开发者预定义的任务流；而 webpack 则深入处理资源的内容，功能上更强大

### 生成阶段

构建阶段围绕 module 展开，生成阶段则围绕 chunks 展开。
经过构建阶段之后，webpack 得到足够的模块内容与模块关系信息，接下来开始生成最终资源了。代码层面，就是开始执行 compilation.seal 函数
seal 原意密封、上锁，我个人理解在 webpack 语境下接近于 “将模块装进蜜罐” 。seal 函数主要完成从 module 到 chunks 的转化;

![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-3-%E7%94%9F%E6%88%90%E9%98%B6%E6%AE%B5.jpg "生成阶段流程图")

简单梳理一下：

1. 构建本次编译的 ChunkGraph 对象；
2. 遍历 compilation.modules 集合，将 module 按 entry/动态引入 的规则分配给不同的 Chunk 对象；
3. compilation.modules 集合遍历完毕后，得到完整的 chunks 集合对象，调用 createXxxAssets 方法
4. createXxxAssets 遍历 module/chunk ，调用 compilation.emitAssets 方法将资 assets 信息记录到 compilation.assets 对象中
5. 触发 seal 回调，控制流回到 compiler 对象

这一步的关键逻辑是将 module 按规则组织成 chunks ，webpack 内置的 chunk 封装规则比较简单

- entry 及 entry 触达到的模块，组合成一个 chunk
- 使用动态引入语句引入的模块，各自组合成一个 chunk

chunk 是输出的基本单位，默认情况下这些 chunks 与最终输出的资源一一对应，那按上面的规则大致上可以推导出一个 entry 会对应打包出一个资源，而通过“动态引入语句”引入的模块，也对应会打包出相应的资源，我们来看个示例。

### SplitChunksPlugin 的作用

将重复用到的 模块 抽出来；

### 写入文件系统

经过构建阶段后，compilation 会获知资源模块的内容与依赖关系，也就知道“输入”是什么；而经过 seal 阶段处理后， compilation 则获知资源输出的图谱，也就是知道怎么“输出”：哪些模块跟那些模块“绑定”在一起输出到哪里。

```code
   compilation = {
   // ...
   modules: [
      /* ... */
   ],
   chunks: [
      {
         id: "entry name",
         files: ["output file name"],
         hash: "xxx",
         runtime: "xxx",
         entryPoint: {xxx}
         // ...
      },
      // ...
   ],
   };
```

seal 结束之后，紧接着调用 compiler.emitAssets 函数，函数内部调用 compiler.outputFileSystem.writeFile 方法将 assets 集合写入文件系统

### 资源形态流转

![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-4-%E8%B5%84%E6%BA%90%E5%BD%A2%E6%80%81%E6%B5%81%E8%BD%AC.jpg "资源形态流转")

1. compiler.make 阶段：
   - entry 文件以 dependence 对象形式加入 compilation 的依赖列表，dependence 对象记录有 entry 的类型、路径等信息
   - 根据 dependence 调用对应的工厂函数创建 module 对象，之后读入 module 对应的文件内容，调用 loader-runner 对内容做转化，转化结果若有其它依赖则继续读入依赖资源，重复此过程直到所有依赖均被转化为 module
2. compilation.seal 阶段：
   - 遍历 module 集合，根据 entry 配置及引入资源的方式，将 module 分配到不同的 chunk
   - 遍历 chunk 集合，调用 compilation.emitAsset 方法标记 chunk 的输出规则，即转化为 assets 集合
3. compiler.emitAssets 阶段：
   将 assets 写入文件系统

## Plugin 解析

学习插件架构，需要理解三个关键问题：

- WHAT: 什么是插件
- WHEN: 什么时间点会有什么钩子被触发
- HOW: 在钩子回调中，如何影响编译状态

### What: 什么是插件

从形态上看，插件通常是一个带有 apply 函数的类：

```code
   class SomePlugin {
      apply(compiler) {
      }
   }
```

apply 函数运行时会得到参数 compiler ，以此为起点可以调用 hook 对象注册各种钩子回调，
例如： compiler.hooks.make.tapAsync ，这里面 make 是钩子名称，tapAsync 定义了钩子的调用方式，
webpack 的插件架构基于这种模式构建而成，插件开发者可以使用这种模式在钩子回调中，插入特定代码。webpack 各种内置对象都带有 hooks 属性，比如 compilation 对象：

```code
   class SomePlugin {
      apply(compiler) {
         compiler.hooks.thisCompilation.tap('SomePlugin', (compilation) => {
               compilation.hooks.optimizeChunkAssets.tapAsync('SomePlugin', ()=>{});
         })
      }
   }
```

### When: 什么时候会触发钩子

钩子的三个学习要素：触发时机、传递参数、示例代码

1. compiler.hooks.compilation ：

   - 时机：启动编译创建出 compilation 对象后触发
   - 参数：当前编译的 compilation 对象
   - 示例：很多插件基于此事件获取 compilation 实例

2. compiler.hooks.make：

   - 时机：正式开始编译时触发
   - 参数：同样是当前编译的 compilation 对象
   - 示例：webpack 内置的 EntryPlugin 基于此钩子实现 entry 模块的初始化

3. compilation.hooks.optimizeChunks ：

   - 时机： seal 函数中，chunk 集合构建完毕后触发
   - 参数：chunks 集合与 chunkGroups 集合
   - 示例： SplitChunksPlugin 插件基于此钩子实现 chunk 拆分优化

4. compiler.hooks.done：

   - 时机：编译完成后触发
   - 参数： stats 对象，包含编译过程中的各类统计信息
   - 示例： webpack-bundle-analyzer 插件基于此钩子实现打包分析

- 参数查询: 传递参数与具体的钩子强相关，官网对这方面没有做出进一步解释;
  直接在源码里面搜索调用语句，例如对于 compilation.hooks.optimizeTree ，可以在 webpack 源码中搜索 hooks.optimizeTree.call 关键字

- compiler 对象逐次触发如下钩子：

![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-5-Plugin-compiler%E9%92%A9%E5%AD%90.jpg "compiler 对象逐次触发")

- compilation 对象逐次触发：
  ![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-6-Plugin-compilation%E9%92%A9%E5%AD%90.jpg "compilation 对象逐次触发")

- apply 虽然是一个函数，但是从设计上就只有输入，webpack 不 care 输出，所以在插件中只能通过调用类型实体的各种方法来或者更改实体的配置信息，变更编译行为。

例如：
compilation.addModule ：添加模块，可以在原有的 module 构建规则之外，添加自定义模块
compilation.emitAsset：直译是“提交资产”，功能可以理解将内容写入到特定路径

### How: 如何影响编译状态

webpack 的插件体系与平常所见的 订阅/发布 模式差别很大，是一种非常强耦合的设计，hooks 回调由 webpack 决定何时，以何种方式执行；而在 hooks 回调内部可以通过修改状态、调用上下文 api 等方式对 webpack 产生 side effect。

## Loader 介绍

runLoaders 会调用用户所配置的 loader 集合读取、转译资源，此前的内容可以千奇百怪，但转译之后理论上应该输出标准 JavaScript 文本或者 AST 对象，webpack 才能继续处理模块依赖。

理解了这个基本逻辑之后，loader 的职责就比较清晰了，不外乎是将内容 A 转化为内容 B，但是在具体用法层面还挺多讲究的，有 pitch、pre、post、inline 等概念用于应对各种场景。

## Module 与 Module 子类

![](./img/%E4%B8%87%E5%AD%97%E6%80%BB%E7%BB%93-7-Module%20%E4%B8%8E%20Module%20%E5%AD%90%E7%B1%BB.jpg "Module 与 Module 子类-webpack@5.26.3 ")

module 是 webpack 资源处理的基本单位，可以认为 webpack 对资源的路径解析、读入、转译、分析、打包输出，所有操作都是围绕着 module 展开的。有很多文章会说 module = 文件， 其实这种说法并不准确，比如子类 AsyncModuleRuntimeModule 就只是一段内置的代码，是一种资源而不能简单等价于实际文件。

Webpack 扩展性很强，包括模块的处理逻辑上，比如说入口文件是一个普通的 js，此时首先创建 NormalModule 对象，在解析 AST 时发现这个文件里还包含了异步加载语句，例如 requere.ensure ，那么相应地会创建 AsyncModuleRuntimeModule 模块，注入异步加载的模板代码。上面类图的 54 个 module 子类都是为适配各种场景设计的。
