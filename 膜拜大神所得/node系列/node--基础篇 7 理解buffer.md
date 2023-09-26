# 理解 buffer (原文:深入浅出 Node.js)

无论是“宽字节”字符串还是“单字节”字符串 JS 都认为是一个字符串；其他语言不是。
“宽字节”字符串：中文
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
