# babel[原文链接](https://zhuanlan.zhihu.com/p/60150672)

## es6+的代码 => es6+的 AST 语法树 => es5 的 AST 语法树 => es5+的代码

babel 在 6.0 的时候把项目拆分成了多个小项目，包括 babel-core, babel-cli, babel-register, babel-polyfill

babel7 的时候把 babel 里的东西名字都改成@babel/xxx 了，比如 babel-core 叫做@babel/core

## 1. @babel/core : 是 babel 最核心的代码,提供很多方法供我们来转化代码

主要是 transform（转化字符串），transformFile（转化文件），transformAst（转化 ast 语法树）；
然后每个方法会带着两个额外的方法 transformAsync（异步转化） 和 transformSync（同步转化）

```code
// transform.js
const babel = require('@babel/core')
const fs = require('fs')

const result = babel.transformFileSync('index.js')
fs.writeFileSync('./main.js', result.code)

// index.js
const a = () => {
  console.log('hello world')
}
a()
```

## 2. babel-cli -- 使用@babel/cli 需要加一个.babelrc 的配置文件。这样才能读取配置

所以需要先创建一个.babelrc 文件然后输入一个{}表示空的配置。

执行 babel-cli index.js --out-file main.js

## 3. .babelrc

.babelrc 负责 babel 的配置，除了写在.babelrc 文件中，也可以在 package.json 中写一个 babel 的配置项
.babelrc 为什么要以点开头呢，因为.意味着文件是工具配置文件，  
为什么加个 rc 呢，rc 的意思是 run command，就是说这个文件会作用在项目运行阶段，  
比如.eslintrc 还有.prettierrc 都是这个意思，属于工具配置文件还会跟着项目一起跑。

**.babelrc** 主要有 plugin, preset 配置项。

- plugin: 是 babel 进行 transform 的基本单位，每一种 plugin 可以一种特定的语法(转换一个：es6 的每个新特性)

```code
{
  "plugins": ["@babel/plugin-transform-arrow-functions"]
}
```

- preset（预制）：一个一个添加 plugin 比较麻烦，preset 是把多个 plugin 集合起来

```code
{
  "presets": ["@babel/preset-env"]
}
```

**注：**babel7 对"@babel/preset-stage-1，2，3，4，5" 支持不好

## 4. @babel/polyfill ---es6,7,8,9 （API 不兼容和新语法不支持）用 polyfill 转化

polyfill 是直接打包进入代码中的，所以应该安装在 dependencies 里而不是 devDependencies 里。
**注：**
1.node 环境用 babal 开发插件不能引用@babel/polyfill  
2.transform： 语法转化，把新的语法转化为浏览器可以兼容的语法;  
 polyfill :兼容新的特性，增加 polyfill 代码，让新的 API 可以正常工作浏览器缺某个 api

## 5. @babel/node --node 端---babel-node 和 babel-cli 类似

node10 支持大多数 es6 的语法，低版本需要转换；  
node 支持 commonJs 但不支持 es6 module 需要转换；

```code
"scripts": {
   "dev": "babel-node index.js"
 },
```

## 6.@babel/runtime --- 可以让工具函数不被重新定义，而是从 helper 文件里去取

babel 在转化的时候会引入一些工具函数，叫做 helper
