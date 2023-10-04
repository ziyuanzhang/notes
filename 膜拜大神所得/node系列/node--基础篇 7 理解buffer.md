# 理解 buffer (原文:深入浅出 Node.js)

无论是“宽字节”字符串还是“单字节”字符串 JS 都认为是一个字符串；其他语言不是。
“宽字节”字符串：中文（宽字节编码 GBK、GB2312）
“单字节”字符串：英文

```
console.1og("0123456789".length);/10
console.1og("零一二三四五六七八九".length)；//10
console.log(("\u00bd".length);//1
```

Buffer 是一个典型的 JavaScript 与 C++结合的模块，它将性能相关部分用 C++实现，将非性能相关的部分用 JavaScript 实现。
由于 Buffer 太过常见，并将其放在全局对象(global)上，使用 Buffer 时，无须通过 require()即可直接使用。

## buffer 对象

1. buffer 对象类似于数组，它的元素为 16 进制的两位数，即 0 到 255 的数值。

```
var str = "ศ入റ出node.js";
var buf = new Buffer(str, 'utf-8');
console.log(buf);  // => <Buffer e6 b7 b1 e5 85 a5 e6 b5 85 e5 87 ba 6e 6f 64 65 2e 6a 73>
```

不同编码的字符串占用的元素个数各不相同，上面代码中的中文字在 UTF-8 编码下占用 3 个元素，字母和半角标点符号占用 1 个元素。

2. buffer 受 Array 类型的影响很大，可以访问 length 属性得到长度，也可以通过下标访问元素，在构造对象时也十分相似;

```
// new Buffer(size);
var buf = new Buffer(100);
console.log(buf.length); // => 100
//---------------
console.log(buf[10]); //这里会得到一个比较奇怪的结果，它的元素值是一个0到255的随机值。(因为没有赋值)
//-----------
buf[10] = 100;
console.log(buf[10]); // => 100 上面赋值了
//--------------
buf[20] = -100;
console.log(buf[20]); // 156
buf[21] = 300;
console.log(buf[21]); // 44
buf[22] = 3.1415;
console.log(buf[22]); // 3
```

3.  给元素的赋值如果小于 0，就将该值逐次加 256，直到得到一个 0 到 255 之间的整数。
    如果得到的数值大于 255，就逐次减 256，直到得到 0255 区间内的数值。
    如果是小数，舍弃小数部分，只保留整数部分。

### Buffer 内存分配

Buffer 对象的内存分配不是在 V8 的推内存中，而是在 Node 的 C++层面实现内存的申请的。

为了高效地使用申请来的内存，Node 采用了 slab 分配机制。slab 是一种动态内存管理机制;

slab 就是一块申请好的固定大小的内存区域。slab 具有如下 3 种状态:

- full:完全分配状态。
- partial:部分分配状态。
- empty:没有被分配状态。

Node 以 8KB 为界限来区分 Buffer 是大对象还是小对象：`Buffer.poolSize = 8 * 1024`
这个 8KB 的值也就是每个 slab 的大小值，在 JavaScript 层面，以它作为单位单元进行内存的分配。

1.  分配小 Buffer 对象

    如果指定 Buffer 的大小少于 8KB,Node 会按照小对象的方式进行分配。Buffer 的分配过程中主要使用一个局部变量 pool 作为中间处理对象，处于分配状态的 slab 单元都指向它。

    - 以下是分配一个全新的 slab 单元的操作，它会将新申请的 SlowBuffer 对象指向它：

      ```
      var pool;
      function allocPool() {
        pool = new SlowBuffer(Buffer.poolSize);  // SlowBuffer 类是在 C++中定义的;
        pool.used = 0;
      }
      ```

      slab 处于 empty 状态。构造小 Buffer>对象时的代码如下：`new Buffer(1024); `
      这次构造将会去检查 pool 对象，如果 pool 没有被创建，将会创建一个新的 slab 单元指向它：`if (!pool || pool.length - pool.used < this.length) allocPool(); `
      同时当前 Buffer 对象的 parent 属性指向该 slab,并记录下是从这个 slab 的哪个位置(offset)开始使用的，sab 对象自身也记录被使用了多少字节，这时候的 slab 状态为 partial。

    - 当再次创建一个 Buffer 对象时，构造过程中将会判断这个 slab 的剩余空间是否足够。
      如果足够，使用剩余空间，并更新 slab 的分配状态。
      如果 slab 剩余的空间不够，将会构造新的 slab,原 slab 中剩余的空间会造成浪费。

      例如，第一次构造 1 字节的 Buffer 对象，第二次构造 8192 字节的 Buffer 对象，由于第二次分配时 slab 中的空间不够，所以创建并使用新的 slab,第一个 slab 的 8KB 将会被第一个 I 字节的 Buffer 对象独占。

      **注意：**由于同一个 slab 可能分配给多个 Buffer 对象使用，只有这些小 Buffer 对象在作用域释放并都可以回收时，slab 的 8KB 空间才会被回收。尽管创建了 1 个字节的 Buffer 对象，但是如果不释放它，实际可能是 8KB 的内存没有释放。

2.  分配大 Buffer 对象

    如果需要超过 8KB 的 Buffer 对象，将会直接分配一个 SlowBuffer 对象作为 slab 单元，这个 slab 单元将会被这个大 Buffer>对象独占。

    ```
    // Big buffer, just alloc one
        this.parent = new SlowBuffer(this.length);  // SlowBuffer 类是在 C++中定义的;
        this.offset = 0;
    ```

上面提到的 buffer 对象都是 javaScript 层面的，能够被 V8 的垃圾回收标记回收。
但是其内部的 parent 属性指向的 SlowBuffer 对象却来自于 Node 自身 C+中的定义，是 C++层面上的 Buffer 对象，所用内存不在 V8 的堆中

3. 真正的内存是在 Node 的 C++层面提供的，JavaScript 层面只是使用它.
   - 当进行小而烦繁的 Buffer 操作时，采用 slab 的机制进行预先申请和事后分配，使得 JavaScript 到操作系统之间不必有过多的内存申请方面的系统调用。
   - 对于大块的 Buf 而言，则直接使用 C++层面提供的内存，而无需细腻的分配操作。

## Buffer 的转换

buffer 对象和字符串相互转换，支持的字符串编码类型：ASCII、UTF-8、UTF-16LE/UCS-2、Base64、Binary、Hex；

1. 字符串转 buffer:

   - 通过构造函数转换 buffer 对象：`new Buffer(str, [encoding]);`，默认 UTF-8；
   - 一个 Buffer 存不同类型的字符串：`buf.write(string, [offset], [length], [encoding])`【不建议】

2. buffer 转字符串： `buf.toString([encoding], [start], [end])`，默认 utf-8；

   buffer 支持的编码类型有限，判断是否支持类型：`Buffer.isEncoding(encoding) `，true 支持，false 不支持；  
   中国常用的 GBK、GB2312 和 BIG-5 编码不支持；

   不支持的编码类型转换：1、用 iconv（调 C++） 和 iconv-lite（纯 js） 两个模块转移编码类型，无法转移的多字节会产生乱码；

   ```
   var iconv = require('iconv-lite');
   var str = iconv.decode(buf, 'win1251'); //buffer转字符串
   var buf = iconv.encode("Sample input string", 'win1251'); // 字符串转buffer
   ```

## buffer 的拼接：

```
   var fs = require('fs');
   var rs = fs.createReadStream('test.md');
   var data = '';
   rs.on("data", function (chunk){
       data += chunk;
   });
   rs.on("end", function () {
       console.log(data);
   });
```

data 事件中获取的 chunk 对象是 Buffer 对象，不是字符串；
`data += chunk; `隐藏了 toString()操作，等价于`data = data.toString() + chunk.toString();`

对单字节（例英文）不会有问题；但对宽字节（例中文）有问题；
`var rs = fs.createReadStream('test.md', {highWaterMark: 11}); `

1. 乱码如何产生的：
   中文在 UTF-8 下占 3 个字节，可能存在 buffer 最后不够 3 个字节 只能显示乱码；

2. 解决方案：

- 不完善 1、setEncoding()与 string_decoder()；（只能处理 UTF-8、Base64 和 UCS-2/UTF-16LE 这 3 种编码）
- 完善：将多个小 Buffer 对象拼接为一个 Buffer 对象，然后通过 iconv-lite 一类的模块来转码这种方式。用一个数组来存储接收到的所有 Buffer 片段并记录下所有片段的总长度，然后调用 Buffer.concat()方法生成一个合并的 Buffer 对象。
  ```
    var iconv = require("iconv-lite");
    var fs = require("fs");
    var rs = fs.createReadStream("./test/test.md", { highWaterMark: 11 });
    var chunks = [];
    var size = 0;
    rs.on("data", function (chunk) {
      chunks.push(chunk);
      size += chunk.length;
    });
    rs.on("end", function () {
      var buf = Buffer.concat(chunks, size);
      var str = iconv.decode(buf, "utf8");
      console.log(str);
    });
  ```

## Buffer 与性能

Buffer 比“字符串”性能高
在 Node 构建的 Web 应用中，可以选择将页面中的动态内容和静态内容分离；
静态内容部分可以通过预光转换为 Bu 的方式，使性能得到提升。
由于文件自身是二进制数据，所以在不需要改变内容的场景下，尽量只读取 Buffer,然后直接传输，不做额外的转换，避免损耗。
