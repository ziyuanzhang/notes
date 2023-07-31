# js 问题

## array 与 string 方法

| array 与 string 共用方法         | string                                | array                                         |
| -------------------------------- | :------------------------------------ | :-------------------------------------------- |
| concat(" world","!");            | str.split(",") 分割                   | arr.join(",")  ---  arr.toString()            |
| slice(0, 3) --3 下标,返回截取的; | =================                     | =========================                     |
| length;                          | str.toUpperCase()                     | arr.splice(1,2,"d","e")                       |
| arr[0] / str[0];                 | str.toLowerCase()                     | ========================                      |
| indexOf('world');                | ================                      | arr.push('a','b') 添加                        |
| includes;                        | str.trim()                            | arr.pop() 删除最后一个                        |
|                                  | str.charAt()                          | arr.unshift("a","b") 添加                     |
|                                  | ===============                       | arr.shift() 删除第一个                        |
|                                  | str.substring(3,7) --7 为下标         | =======================                       |
|                                  | str.substr(0, 5)  ---5 为长度         | arr.sort()  ---  对数组进行排序               |
|                                  | ================                      | arr.reverse()  ---对数组进行反转              |
|                                  | str.match（找到一个或多个正则的匹配） | ========================                      |
|                                  | str.search(检索与正则匹配的值)        | arr.map()                                     |
|                                  | str.replace(替换与正则匹配的子串)     | arr.forEach()                                 |
|                                  | =========                             | arr.filter()                                  |
|                                  | =========                             | arr.some()                                    |
|                                  | =========                             | arr.every()                                   |
|                                  | =========                             | arr.reduce(callBack(prev,cur,index,arr),init) |

## 进程、线程：参考 “计算机基础系列 / 进程-线程-协程-纤程”

## 变量提升：javascript 代码是按顺序执行的吗

js 先编译后解析；

1. 在编译阶段，变量和函数会被存放到变量环境中，

   - 变量：默认值会被设置为 undefined；
   - 两个相同的函数：最终放在变量环境中的是最后定义的那个（后定义的覆盖先定义的）；

2. 在代码执行阶段，JavaScript 引擎会从变量环境中查找自定义的变量和函数；

## 块级作用域：var 缺陷以及为什么要引入 let 和 const

let、const 申明的变量不会被提升。在 js 引擎编译后，会保存在词法环境中。
词法环境内部维护一个小型的栈结构，作用域内部变量压入栈顶。作用域执行完，从栈顶弹出。

## this：从 JavaScript 执行上下文视角讲 this

当执行 new CreateObj 的时候，JavaScript 引擎做了四件事：

1. 首先创建一个控对象 tempObj；
2. 接着调用 CreateObj.call 方法，并将 tempObj 作为 call 方法的参数，这样当 createObj 的执行上下文创建时，它的 this 就指向 tempObj 对象；
3. 然后执行 CreateObj 函数，此时的 CreateObj 函数执行上下文中的 this 指向 tempObj 对象；
4. 最后返回 tempObj 对象。

- 直接调用函数，在严格模式下，this 值是 undefined，非严格模式下 this 指向的是全局对象 window；
- 箭头函数没有自己的执行上下文，this 是外层函数的 this；
- 谁调用函数，this 指向谁；

## 调用栈：为什么 js 代码会出现栈溢出

js 代码出现栈溢出错误: 通常是由于递归调用或者嵌套函数调用过多导致的。

每当 JavaScript 代码执行到一个函数时，引擎会创建一个“执行上下文对象”，该对象包含了当前函数的所有变量、函数参数、作用域链以及其他执行相关的信息。执行上下文对象保存在一个称为“执行栈”或“调用栈”中。

如果函数递归调用（即函数内部调用自己）并且递归深度很长 或者 存在大量的嵌套函数调用 调用链很长，调用栈可能会不断增长。当调用栈超过其最大容量时，就会发生栈溢出错误。

“执行上下文对象”包含以下重要的属性和组成部分：
变量环境（Variable Environment）：用于存储声明的变量、函数声明和函数参数。
词法环境（Lexical Environment）：包含变量环境，并构成了作用域链（Scope Chain）。
外部环境（Outer Environment）：指向外部（父级）执行上下文的词法环境，用于处理作用域链和词法嵌套。
this 值：指向当前函数执行的上下文对象内部的 this 关键字。
闭包函数：如果当前函数是一个闭包，执行上下文对象中还会包含闭包的引用和相关信息。

当函数执行完毕后，执行上下文对象将被销毁，从执行栈中弹出。但是，如果函数是一个闭包并且被外部引用，它的执行上下文可能会被保留在内存中，以供后续访问和使用。

## 作用域链和闭包

根据词法作用域的规则，内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使外部函数已经执行结束了，但是内部函数引用外部函数的变量依旧保存在内存中，把这些变量的集合称为闭包；

## 栈、堆、队列之间的区别是？

动态语言：在使用时需要检查数据类型的语言。
弱类型语言：支持隐式转换的语言。

1. 栈：基本数据类型，上下文切换之后，栈顶的空间会自动被回收（像 桶 先进后出）
2. 堆：引用数据类型，需要垃圾回收机制不定时回收；变量存储的是指针，指向堆中（书架中的书，知道书名就可以拿到书，可以无序）
3. 队列只能在队头做删除操作,在队尾做插入操作。（先进先出）
   理解队列数据结构的目的主要是为了清晰的明白事件循环机制

## JQ 中类似 promise

// $.when().done().fail().then()

## JQ 中 prop 和 attr 的区别

prop 方法: 对于元素本身就带有的固有属性
attr 方法: 对于元素我们自己自定义的 DOM 属性

## 排序：参考计算机基础系列 / 数据结构与算法

## RegExp 对象方法

RegExpObject.exec(string) // 匹配到，返回值，否则返回 null。

RegExpObject.test(string) // 匹配到，返回 true ，否则返回 false。

## AMD/CMD/CommonJs/ES6

1. AMD---Asynchronous Module Definition（异步模块定义）， 特点是：依赖前置
2. CMD---Common Module Definition（通用模块定义），特点是：依赖就近，同步。
3. CommonJs 规范，module.exports / require，特点是 : nodeJs 后台采用的规范，可以多次加载，只在第一次运行，结果被缓存；
4. ES6 特性 export / import，特点是：成对出现. 只有导出才能导入。

## 迭代与递归

迭代：for 循环 ；
递归：调用自身或 间接调用自身 ；
递归中一定有迭代，但是迭代中不一定有递归；
能用迭代的不用递归；递归调用函数，浪费空间，并且递归太深容易造成堆栈的溢出。

## for -- setTimeout

1. --添加个闭包
           for (var i = 1; i <= 5; i++) {
               (function (j) {
                   setTimeout(function timer() {
                       console.log(j)
                   }, 0)
               })(i)
           }
2. --传第三个参数----
           for (var i = 1; i <= 5; i++) {
               setTimeout(function timer(j) {
                   console.log(j)
               }, 0, i)
           }
3. --let---
           for (let i = 0; i < 3; ++i) {
               setTimeout(function () {
                   console.log("let", i);
               }, 100);
           }
4. ***
   for (var i = 0; i < 3; ++i) {
               setTimeout(console.log("var", i), 100);
           }
