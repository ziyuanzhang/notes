#

Buffer（缓冲区）：是一个类似于 Array 的对象，用于表示固定长度的字节序列；
换句话说，Buffer 就是一段固定长度的内存空间，用于处理二进制数据；

Buffer 特点：

1. 大小固定，无法修改
2. 性能较好，可以直接操作计算机内存；
3. 每个元素的大小为 1 字节（byte）;

0001001001001000010010
内存中每个 0 或者 1 表示一个 bit；
8 个 bit 组成的空间称为 1 个字节（byte）

```code
//alloc 安全；会清空以前的字符；
let buf1 = Buffer.alloc(10);
//allocUnsafe不安全；不会清空以前的字符；比alloc快；
let buf2 = Buffer.allocUnsafe(10);
//from 将字符串/数组转为Buffer；
let buf3 = Buffer.from("hello");
console.log(buf); // <Buffer 68 65 6c 6c 6f>
"hello": h对应的unicode为104;104 对应的十六进制为 68
```
