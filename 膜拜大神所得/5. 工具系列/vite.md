# vite

1、开发环境（ESbuild）； 2、正式环境（Rollup）

## 为什么需要预编译 & 预构建?

1. 支持 非 ESM 格式的依赖包：Vite 是基于浏览器原生支持 ESM 的能力实现的，因此必须将 commonJs 的文件提前处理，转化成 ESM 模块并缓存入 node_modules/.vite；
2. 减少模块和请求数量：Vite 将有许多内部模块的 ESM 依赖关系转换为单个模块，以提高后续页面加载性能。
3. 如果不使用 esbuild 进行预构建，浏览器每检测到一个 import 语句就会向服务器发送一个请求，如果一个三方包被分割成很多的文件，这样就会发送很多请求，会触发浏览器并发请求限制；

## vite 对比 webpack ，优缺点在哪?

1. 更快的冷启动:No Bundle（“不捆绑”或“无捆绑”） + esbuild 预构建；
2. 更快的热更新:基于 ESM 的 HMR，同时利用浏览器缓存策略提升速度；
3. 真正的按需加载: 利用浏览器 ESM 支持，实现真正的按需加载

## 为什么说 vite 比 webpack 要快?

1. vite 不需要做全量的打包，产物小，加载运行快，没有 runtime，没有模板代码，这是比 webpack 要快的最主要的原因；
2. vite 在解析模块依赖关系时，利用了 esbuild，更快（esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍）；

   esbuild 预编译第三方依赖，一方面将第三方包转换为 ESM 规范；另一方面，合并多个包解决请求瀑布流问题。

3. 按需加载；模块之间的依赖关系的解析由浏览器实现。Vite 只需要在浏览器请求源码时进行转换并按需提供源码。根据情景动态导入代码，即只在当前屏幕上实际使用时才会被处理。

   按需加载，按需编译，无需提前编译打包，从而达到冷启动

4. 充分利用缓存；Vite 利用 HTTP 头来加速整个页面的重新加载（再次让浏览器为我们做更多事情）：源码模块的请求会根据 304 Not Modified 进行协商缓存，而依赖模块请求则会通过 Cache-Control: max-age=31536000,immutable 进行强缓存，因此一旦被缓存它们将不需要再次请求。

## 应用场景

1. vite 的目标场景是 web；node 没法用(可以直接用 esbuild)；
2. Next 和 Gatsby 已经跟 webpack 强耦合，没法用 vite;

- next.js : react 的 SSR 框架；
- nuxt.js : vue 的 SSR 框架；
- nest.js : node 的后台框架；

## 环境变量处理

vite 对环境变量的处理是借助于第三方库 dotenv 实现的，执行命令的时候，dotenv 会去读取.env 文件，然后注入到 process 对象当中。当然用户配置大于默认，我们可以在 vite.config.js 里面配置 envDir 去指定环境变量的文件地址。

可以在代码中获取到 import.meta.env 的内容，如果要想获取到环境变量，则需要命名`VITE_`为前缀的值，否则 vite 访问不到，原因是因为 vite 做了一层拦截，把没有带 VITE 前缀的变量，不会注入到 import.meta.env 中。
