#

Buffer（缓冲区）：是一个类似于 Array 的对象，用于表示固定长度的字节序列；
换句话说，Buffer 就是一段固定长度的内存空间，用于处理二进制数据；

- Buffer 特点：

  1. 大小固定，无法修改
  2. 性能较好，可以直接操作计算机内存；
  3. 每个元素的大小为 1 字节（byte）;

0001001001001000010010
内存中每个 0 或者 1 表示一个 bit；
8 个 bit 组成的空间称为 1 个字节（byte）

```code
//1、alloc 安全；会清空以前的字符；
let buf1 = Buffer.alloc(10);
//2、allocUnsafe不安全；不会清空以前的字符；比alloc快；
let buf2 = Buffer.allocUnsafe(10);
//3、from 将字符串/数组转为Buffer；
let buf3 = Buffer.from("hello");
console.log(buf); // <Buffer 68 65 6c 6c 6f>
"hello": h对应的unicode为104;104 对应的十六进制为 68
console.log(buf3[0])  //104，10进制
console.log(buf3[0].toString(2)) //转换为2进制，这里的toString 进行数字转化的
buf3[0]=361;//361:0001 0110 1001 =>0110 1001;高位舍弃；8位二进制最大是255，大于255的都被舍弃部分，造成溢出
console.log(buf3)
4、 buf4 = Buffer.from("你好");
console.log(buf4) // <Buffer e4 bd a0 e5 a5 bd>  //utf-8的中文，每个中文占3个字节；
```
