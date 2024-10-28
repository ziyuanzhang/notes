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

## js 数据类型及区别

共 8 中：是 Undefined、Null、Boolean、Number、String、Object、Symbol、BigInt；

- （基本/原始）数据类型 ：String、Number、Boolean、Null（空）、Undefined（未定义）、Symbol 、Bigint

  1. Symbol: ES6 引入的，表示独一无二的值。
  2. Bigint: ES6 引入的，表示任意大的整数--比 Number【2^53-1】 数据类型支持的范围更大的整数值

- 引用数据类型 对象(Object)【除了基本类型以外都是对象,数组,函数,正则表达式】

## null / undefined

- null：空值（主要用于赋值给一些可能会返回对象的变量，作为初始化。）
- undefined：变量未持有值（只声明未赋值,或者 =未赋值的变量）
- typeof bb -->（返回 undefined）

## 基本数据类型和复杂数据类型的区别

1. 存储位置不同（栈和堆）
2. 访问机制不同（按值，引用访问）
3. 变量赋值不同（值的副本，引用）
4. 参数传递不同（传值，引用）

## 栈、堆、队列之间的区别是？

动态语言：在使用时需要检查数据类型的语言。
弱类型语言：支持隐式转换的语言。

1. 栈（stack）：存（原始/基本）数据类型；占据空间小、大小固定，属于被频繁使用数据，所以放入栈中存储；  
   上下文切换之后，栈顶的空间会自动被回收【像 桶 先进后出】

2. 堆（heap）：存 引用数据类型（对象、数组和函数）；占据空间大、大小不固定。如果存储在栈中，将会影响程序运行的性能；

   引用数据类型在栈中存储了指针，该指针指向堆中该实体的起始地址。当解释器寻找引用值时，会首先检索其在栈中的地址，取得地址后从堆中获得实体。

   需要垃圾回收机制不定时回收；【书架中的书，知道书名就可以拿到书，可以无序】

3. 在操作系统中，内存被分为栈区和堆区：

   - 栈区内存：由编译器自动分配释放；存放函数的参数值，局部变量的
     值等。（上下文切换之后，栈顶的空间会自动被回收）
   - 堆区内存：一般由开发者分配释放，若开发者不释放，程序结束时可
     能由垃圾回收机制回收。

4. 队列只能在队头做删除操作,在队尾做插入操作。（先进先出）
   理解队列数据结构的目的主要是为了清晰的明白事件循环机制

## 进程、线程：参考 “计算机基础系列 / 进程-线程-协程-纤程”

## 变量提升：javascript 代码是按顺序执行的吗

js 先编译后解析；

1. 在编译阶段，变量和函数会被存放到变量环境中，

   - 变量：默认值会被设置为 undefined；
   - 两个相同的函数：最终放在变量环境中的是最后定义的那个（后定义的覆盖先定义的）；

2. 在代码执行阶段，JavaScript 引擎会从变量环境中查找自定义的变量和函数；

## 块级作用域：var 缺陷以及为什么要引入 let 和 const

let、const 声明的变量不会被提升。在 js 引擎编译后，会保存在词法环境中。

词法环境内部维护一个小型的栈结构，作用域内部变量压入栈顶。作用域执行完，从栈顶弹出。

## 调用栈：为什么 js 代码会出现栈溢出（内存泄漏）

js 代码出现栈溢出错误: 通常发生在递归调用过深 或者 无限循环的情况下。

这是因为 js 使用了一个有限大小的调用栈来跟踪函数调用。每次函数被调用时，都会有一个新的执行上下文被推入调用栈。当函数执行结束并返回时，其对应的执行上下文会被从栈中弹出。

由于调用栈的大小是有限的，当一个函数递归调用自身太多次而没有合适的退出条件时，或者在一个循环中反复调用函数却没有终止条件，调用栈最终会达到其最大容量。一旦超过这个限制，JavaScript 引擎就无法再往栈里添加更多的执行上下文，这时就会抛出一个“RangeError: Maximum call stack size exceeded”的错误，这也就是所谓的栈溢出。

- “执行上下文对象”包含以下重要的属性和组成部分：

  1. 变量环境：用于存储声明的变量、函数声明和函数参数。
  2. 词法环境：包含变量环境，并构成了作用域链（Scope Chain）。
  3. 外部环境：指向外部（父级）执行上下文的词法环境，用于处理作用域链和词法嵌套。
  4. this 值：指向当前函数执行的上下文对象内部的 this 关键字。
  5. 闭包函数：如果当前函数是一个闭包，执行上下文对象中还会包含闭包的引用和相关信息。

当函数执行完毕后，执行上下文对象将被销毁，从执行栈中弹出。但是，如果函数是一个闭包并且被外部引用，它的执行上下文可能会被保留在内存中，以供后续访问和使用。

## 作用域 / 作用域链 / 闭包

1. 作用域（词法环境）：是一套约定好的规则。我们写代码，应该按照这个规则写，JS 引擎对 JS 源码进行词法分析，也是按照这个规则来。
2. 作用域链是：在代码执行过程中"会动态变化的一条索引路径"。(由当前环境与上层环境的一系列变量对象组成，它保证了当前执行环境对“符合访问权限的变量和函数”的有序访问。)
3. 闭包：根据词法作用域的规则，内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使外部函数已经执行结束了，但是内部函数引用外部函数的变量依旧保存在内存中，把这些变量的集合称为闭包；

## 闭包： 一种特殊的对象，本质是当前环境中存在指向父级作用域的引用

它由两部分组成。执行上下文(代号 A)，以及在该执行上下文中创建的函数（代号 B）。
当 B 执行时，如果访问了 A 中变量对象中的值，那么闭包就会产生。（模块化是闭包最强大的一个应用场景）

闭包的问题在于，一旦有变量引用这个中间函数，这个中间函数将不会释放，同时也会使原始的作用域不会得到释放，作用域中产生的内存占用也不会得到释放。除非不再有引用，才会逐步释放。

## 原型（原型对象） / 原型链

1. 我们创建的每一个函数，js 引擎会为函数添加一个  prototype  属性，该属性指向一个对象。这个对象就是我们所说的原型。

2. 查找对象的某个属性，如果对象本身没有，会通过`__proto__`去它的构造函数的 prototype（原型对象）中查找；如果还没有找到，会继续通过原型对象的`__proto__`去【原型对象的原型】中查找，直到 Object.prototype 对象为止，这样就形成一个链式结构,  即原型链。

3. 每个对象都有`__proto__`属性，但只有函数对象才有 prototype 属性

## constructor /prototype /`__proto__`   <https://www.jianshu.com/p/dee9f8b14771>

1. 原型对象（Person.prototype）有一个 constructor 属性（指向构造函数）。
2. 实例没有 constructor,调用的是原型链上的 constructor

   ```code
      var person1 = new Person();
      person1.constructor == Person
      Person.prototype.constructor == Person
      person1.__proto__ == Person.prototype;
   ```

3. getProtypeOf 是 Object 对象自带的一个方法，能够拿到参数的原型对象
      Object.getPrototypeOf(person1)=== Person.prototype;

## hasOwnProperty / isPrototypeOf / for...in

1. Object 的 hasOwnProperty(key)方法返回一个布尔值，判断对象是否包含特定的自身（非继承）属性。
2. for...in 循环对象的所有枚举属性（包括继承的）,然后再使用 hasOwnProperty()方法来忽略继承属性。
3. isPrototypeOf 的字面意思就是谁的原型链中是否包含了 XX 的原型(例如:obj1.isPrototypeOf(obj2)  这个意思是，obj1 是否被包含在 obj2 的原型链中)

## typeof / Object.prototype.toString.call / instanceof

1. typeof

   - 数组、对象、null 都会被判断为 object，其他判断都正确
   - typeof (object、Function、Array、Date、Number、String、Bootlean)-->结果是:funciton

2. Object.prototype.toString:判断某个对象属于哪种内置类型；但不能判断自定义类型.  
   Object.prototype.toString.call(null); // "[object Null]"-- [Object type]，其中 type 为对象的类型。

3. instanceof：检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。

   - 1.自定义类型; 2.只能用来判断对象类型，原始类型不可以。并且所有对象类型 instanceof Object 都是 true。
   - [] instanceof Array; // true; ------ [] instanceof Object; // true
   - //语法：object instanceof constructor ，
   - 参数：object（实例对象）constructor（构造函数）
   - console.log(person instanceof Person); // true

4. Array.isArray()方法。  Array.isArray([1, 2, 3]); // true

## this 、 new 、 call / apply / bind

- this 的指向，是在函数被调用的时候确定的:

  1. 如果函数被某一个对象所拥有，那么该函数在调用时，内部的 this 指向该对象。
  2. 如果函数独立调用：在严格模式下，this 值是 undefined；非严格模式下 this 指向的是全局对象 window；
  3. 箭头函数没有自己的执行上下文，this 是外层函数的 this；
  4. 谁调用函数，this 指向谁；

- 当执行 new CreateObj 的时候，JavaScript 引擎做了四件事：

  1. 首先创建一个空对象 tempObj；
  2. 接着调用 CreateObj.call 方法，并将 tempObj 作为 call 方法的参数；
  3. 然后执行 CreateObj 函数，此时的 CreateObj 函数执行上下文中的 this 指向 tempObj 对象；
  4. 最后返回 tempObj 对象。

- call / apply / bind---改变 this 的指向

  它们在功能上是没有区别的，它们的区别主要是在于方法的实现形式和参数传递上的不同；

  1. 函数.call( 对象,arg1,arg2.... )  ----->会自执行
  2. 函数.apply( 对象,[ ] )  ----->会自执行
  3. var ss=函数.bind(对象,arg1,arg2,....)   ----->不会自执行，需要调用

## js 继承 <https://www.cnblogs.com/humin/p/4556820.html>

1. 原型链继承
2. 构造继承(Person.call(this,a,b))
3. 实例继承（new Person()）
4. 拷贝继承
5. extends

## JS 事件循环机制: 参考 “浏览器系列”

JavaScript 代码的执行过程中，除了依靠“函数调用栈”来搞定函数的执行顺序外，还依靠“任务队列(task queue)”来搞定另外一些代码的执行。

1. 一个线程中，事件循环是唯一的，但是任务队列可以拥有多个。

2. 任务队列又分为 macro-task（宏任务）与 micro-task（微任务）
   macro-task 大概包括：script(整体代码), setTimeout, setInterval。
   micro-task 大概包括: Promise.then, MutationObserver(html5 新特性-监听 DOM 节点变化)

3. setTimeout/Promise 等我们称之为任务源。而进入任务队列的是他们指定的具体执行任务。（setTimeout 作为一个任务分发器，这个函数会立即执行，而它所要分发的任务，也就是它的第一个参数，才是延迟执行）

4. 来自不同任务源的任务会进入到不同的任务队列。其中 setTimeout 与 setInterval 是同源的。

5. 事件循环的顺序，决定了 js 代码的执行顺序。它从 script(整体代码)开始第一次循环。之后全局上下文进入函数调用栈,直到调用栈清空(只剩全局)。然后执行所有的 micro-task(微任务中套微任务，执行)。当所有可执行的 micro-task 执行完毕之后。循环再次从 macro-task 开始，找到其中一个任务队列执行完毕，然后再执行所有的 micro-task，这样一直循环下去

6. 其中每一个任务的执行，无论是 macro-task 还是 micro-task，都是借助函数调用栈来完成

|                宏任务 | 浏览器 | node |     |                     微任务 | 浏览器 | node |
| --------------------: | :----: | :--: | --: | -------------------------: | :----: | :--: |
|            setTimeout |  支持  | 支持 |     | Promise.then catch finally |  支持  | 支持 |
|           setInterval |  支持  | 支持 |     |           MutationObserver |  支持  |  不  |
| requestAnimationFrame |  支持  |  不  |     |           process.nextTick |   不   | 支持 |
|          setImmediate |   不   | 支持 |     |                            |        |      |

## js defer 和 async 区别

defer(延迟脚本):立即下载，初始的 HTML 文档解析完成再执行（DOMContentLoaded 事件之前执行）

async(异步脚本):立即下载，下载完在“浏览器空闲时”再执行(互不依赖；在 load 前)

1、当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完成加载  
2、页面上所有的资源（图片，音频，视频等）被加载以后才会触发 load 事件

## 跨域

1. jsonp 跨域: `http://aa.com/jsonp/result.aspx?code=CA1998&callback=flightHandler`
2. CORS（跨域资源共享）
3. 代理转发（nginx/node）
4. WebSocket
5. 图像 ping
6. iframe

## 深 copy / 浅 copy

深 copy：基础类型（字符串、数字、布尔、Null、Undefined、symbol）  
浅 copy：引用数据类型（包含普通对象-Object，数组对象-Array，正则对象-RegExp，日期对象-Date，数学函数-Math，函数对象-Function）

```code
1、structuredClone //let newObj = structuredClone(obj)
2、function deepClone(target, cache = []) {
      if (target === null || typeof target !== 'object') {
        return target
      }

     let hit = cache.filter(item => item.origin === target)[0];
      if (hit) {
        return hit.copy;
      }

      if (Array.isArray(target)) {
         return target.map(item => {
           return deepClone(item, cache);
        })
      }
      let copy = target.constructor === Object ? {} : Object.create(target.constructor.prototype)
      cache.push({
         origin: target,
         copy
      })
      return [...Object.keys(target), ...Object.getOwnPropertySymbols(target)].reduce((clone, key) => {
        clone[key] = deepClone(target[key], cache);
        return clone;
      }, copy)
    }
```

## 构造函数  /  普通函数 de 区别

```code
function Person(name, age, job) {
     this.name = name;
     this.age = age;
     this.job = job;
     this.sayName = function () {
        console.log(this.name);
     }
}
//-------当做构造函数使用
var per = new Person('Nicholas', 29, 'Software'); //this-->实例（per）
per.sayName(); //'Nicholas'    
//-----当做普通函数调用          　　
  Person('Greg', 27, 'Doctor'); //this-->window         　　
  window.sayName(); //'Greg'
```

## 迭代器、生成器、promise、await/async

## JQ 中类似 promise

// $.when().done().fail().then()

## 排序：参考计算机基础系列 / 数据结构与算法

## RegExp 对象方法

RegExpObject.exec(string) // 匹配到，返回值，否则返回 null。

RegExpObject.test(string) // 匹配到，返回 true ，否则返回 false。

## AMD/CMD/CommonJs/ES6

1. 异步模块定义（AMD---Asynchronous Module Definition）：依赖前置。具体实现 require.js
2. 通用模块定义（CMD---Common Module Definition）：依赖就近，同步。
3. ES6 特性：只有导出才能导入；export / import 成对出现。
4. CommonJs 规范: nodeJs 后台采用的规范，可以多次加载，只在第一次运行，结果被缓存；module.exports / require;

   - CommonJS：

     1. 模块输出的是一个值的拷贝；

        因为 CommonJ 输出的值是一个静态值，而且这个值会被缓存到，所以每一次获取到的都是缓存值，改变原来的值，引用值不会改变。

     2. CommonJS 模块是运行时加载；

        因为 CommonJS 加载的是一个对象（即 module.exports 属性），该对象只有在脚本运行完才会生成。

     3. CommonJS 模块的 require()是同步加载模块；

   - ESM 模块：

     1. 输出的是值的引用；

        ESM 输出的是一个只读引用，模块不会缓存运行结果，而是动态地去“被加载的模块”取值，并且变量总是绑定其所在的模块。

     2. ESM 模块是编译时输出接口；

        ESM 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。

     3. ESM 模块的 import 命令是异步加载，有一个独立的模块依赖的解析阶段。

## 迭代与递归

- 迭代：for 循环 ；
- 递归：调用自身或 间接调用自身 ；
- 递归中一定有迭代，但是迭代中不一定有递归；
- 能用迭代的不用递归；递归调用函数，浪费空间，并且递归太深容易造成堆栈的溢出。

## for -- setTimeout

1. 添加个闭包

   ```code
           for (var i = 1; i <= 5; i++) {
               (function (j) {
                   setTimeout(function timer() {
                       console.log(j)
                   }, 0)
               })(i)
           }
   ```

2. 传第三个参

   ```code
           for (var i = 1; i <= 5; i++) {
               setTimeout(function timer(j) {
                   console.log(j)
               }, 0, i)
           }
   ```

3. let

   ```code
           for (let i = 0; i < 3; ++i) {
               setTimeout(function () {
                   console.log("let", i);
               }, 100);
           }
   ```

4. ***

   ```code
      for (var i = 0; i < 3; ++i) {
               setTimeout(console.log("var", i), 100);
           }
   ```

## Object.defineproperty 与 proxy 区别

1. 监听对象不同
   defineproperty：只能监听某个属性（需要知道对象的具体属性）
    proxy：只需要知道对象
2. proxy 不需要借助外部 value
3. proxy 不会污染原对象（返回新对象，原对象不改变）

```code
    var o = {};
    var bValue = 38;
    Object.defineProperty(o, "b", {
      get() {
        return bValue;
      },
      set(newValue) {
        bValue = newValue;
      }
    });
```

## es6 拦截 proxy

```code
var person = { name: "张三" };
var proxy = new Proxy(person, {
    get: function (target, key) {
        if (key in target) {
            return target[key];
        } else {
            throw new ReferenceError(`Prop name ${propKey}does not exist.`);
        }
    },
   set: function (target, key, value) {
          console.log(`${key} 被设置为 ${value}`);
          target[key] = value; // 或者 Reflect.set(target，key，value）
        }
});
proxy.name // "张三"
proxy.age //  抛出一个错误
proxy.name = 'others'; //  控制台输出：name  被设置为  others
get(target, propKey, receiver)：拦截对象属性的读取
set(target, propKey, value, receiver)：拦截对象属性的设置
has(target, propKey)：拦截 propKey in proxy 的操作，返回一个布尔值
deleteProperty(target, propKey)：拦截 delete proxy[propKey]的操作，返回一个布尔值
```

## 创建异步对象

```code
  let xhr = new XMLHttpRequest();
  //post请求一定要添加请求头才行不然会报错
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //设置请求的类型及url
  xhr.open('post', '02.post.php');
  xhr.onreadystatechange = function () {
      // 这步为判断服务器是否正确响应
      if (xhr.readyState == 4 && xhr.status == 200) {
          console.log(xhr.responseText);
      }
  };
  //发送请求
  xhr.send('name=fox&age=18');
```

## JS 中判断字符串中出现次数最多的字符及出现的次数:

```code
let str = 'qwertyuilo.,mnbvcsarrrrrrrrtyuiop;l,mhgfdqrtyuio;.cvxsrtyiuo';
  let json = {};
  //遍历 str 拆解其中的每一个字符将其某个字符的值及出现的个数拿出来作为 json 的 kv
  for (let i = 0; i < str.length; i++) {
      //判断 json 中是否有当前 str 的值  
      if (!json[str.charAt(i)]) {
          json[str.charAt(i)] = 1;
      } else {
          json[str.charAt(i)]++;
      }
  }
  let number = '';
  let num = 0;
  for (let i in json) {
      if (json[i] > num) {
          num = json[i];
          number = i;
      }
  }
  console.log('出现最多的值是' + number + '出现次数为' + num);
```

## 节流与防抖

- 函数节流：是指规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，如果在同一个单位时间内某事件被触发多次，
  只有一次能生效。
  1. 监控浏览器 resize；
  2. 元素拖拽
- 函数防抖：是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。
  1. 按钮提交
  2. input 输入

## js  链式调用

我们都很熟悉 jQuery 了，只能 jQuery 中一种非常牛逼的写法叫链式操作;

`$('#div').css('background','#ccc').removeClass('box').stop().animate({width:300});`

一般的函数调用和链式调用的区别：调用完方法后，return this 返回当前调用方法的对象。

```code
        function Dog() {
            this.run = function () {
                console.log("The dog is running....");
                return this; //返回当前对象  Dog
            };
            this.eat = function () {
                console.log("After running the dog is eating ....");
                return this; //返回当前对象  Dog        
            };
            this.sleep = function () {
                console.log("After eating the dog is running....");
                return this; //返回当前对象  Dog        
            };
        }
        //一般的调用方式；
        /*  var dog1 =new Dog();
            dog1.run();
            dog1.eat();
            dog1.sleep();*/
        var dog2 = new Dog();
        dog2.run().eat().sleep();
```

## JQ 中 prop、 attr、data 的区别

1. prop(property) 方法: 用于操作元素本身固有属性【元素自身的状态或值】

   - 比如 checked、selected、disabled 等布尔类型的属性，或者是像 value 这样的字符串属性;
   - prop() 主要用来处理那些在程序运行时可能会改变状态的属性。

2. attr(attribute) 方法: 用于操作 HTML 元素的属性值

   - 比如 id、class 或者自定义的 `data-*` 属性；
   - attr() 更多用于操作那些在 HTML 中定义的属性。

3. 的 data()方法: 用于操作任意类型的数据到 jQuery 包装集合中的每个元素上。
   - data() 是一种在元素之间传递信息的方式，而不需要使用全局变量或直接修改 DOM。
   - 它可以存储任何类型的数据（如数字、字符串、对象等），并且这些数据不会出现在 HTML 中。
   - 需要在页面间共享的数据或临时存储的信息，则 data() 是最佳选择。
