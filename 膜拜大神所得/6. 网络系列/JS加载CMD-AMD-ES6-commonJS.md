## CMD-AMD-commonjs-ES6 module 区别

```
|--------- 编程(我们写的) -------------|----- commonjs ----- | ----- es6 module -----------------|

|--- 转义/传输（babel/webpack打包） ---|------------------ cmd/amd -------------------------------|

|------------ 浏览器执行 -------------|--- require.js ---|--- webpack 模块加载器 --- |--- 其他 ---|
```

#### AMD ---Asynchronous Module Definition(异步模块定义)

1. 创建模块 a.js

```
define(['function/foo'],(foo)=>{
    console.log(foo())
})
```

2. 使用 a.js 模块

```
require(['jquery','a.js'],($,printFoo)=>{
    $("#foo").click(()=>{
        printFoo()
    })
})
```

#### CMD --- Common Module Definition(通用模块定义)

1. 创建模块 a.js

```
define((require,exports)=>{
    function printFoo(){
        const foo = require("./foo")
        console.log(foo())
    }
    exprots = printFoo
})
```

2. 使用 a.js 模块

```
use((require)=>{
    const $ = require('jquery');
    const printFoo =require('./a.js')
    $("#foo").click(()=>{
        printFoo()
    })
})
```

#### CommonJS

1.  创建模块 a.js

```
function A(){...}
module.exports = A
```

2. 使用 a.js 模块

```
const A = require("./a.js")
A()
```

#### ES6 Module

1.  创建模块 a.js

```
function A(){...}
exports default A
```

2.  使用 a.js 模块

```
import Afrom './a.js'
A()
```
