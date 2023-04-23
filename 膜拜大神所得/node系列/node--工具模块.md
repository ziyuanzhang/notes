# node--工具模块

## Util-- Node.js 的工具模块

常用的判断属性，在 util.types 对象

1. isDate：判断是否是日期格式的变量
2. isAnyArrayBuffer：判断是否是 buffer
3. isAsyncFunction：判断函数是否是异步的

```code
    let util = require('util');
    // types: 判断变量/函数的一些类型
    const {isAnyArrayBuffer,isAsyncFunction,isDate} = util.types
    // isDate
    const is_date = isDate(new Date())
```

常用的方法和属性

1. format:格式化字符串
2. inspect: 将对象转为字符串
3. isDeepStrictEqual：判断两个字符是否强相等，相当于===
4. deprecate：将函数包装为弃用

```code
    // inspect
    const obj = {name:'inspect',date:'2022-09-01'}
    const str = util.inspect(obj)
    console.log('str: ', str);
```

## DNS -- Node.js DNS 模块用于解析域名

## OS -- Node.js OS 模块提供了一些基本系统操作函数

常用的方法和属性

1. networkInterfaces 获取网络信息
2. cpus：获取系统的 CPU 内核细腻，返回个数组
3. totalmem：系统总共内存容量
4. freemem：系统空余内存变量
5. hostname：系统主机名
6. version: 系统内核版本的字符串
7. platform: 主机操作系统平台
8. type: 主机的操作系统平台名称,可能的值为'aix'、'darwin'、'freebsd'、'linux'、'openbsd'、'sunos'、以及 'win32'。
9. uptime: 操作系统正常运行时间

## Path -- nodejs 用来处理文件路径的工具模块，主要处理绝对路径，相对路径
