# 迭代器(iterator)、生成器(generator)、promise、await/async

- 静态方法：

  1. Promise.all() ; 所有返回
  2. Promise.race() ; 最快的返回
  3. Promise.reject();
  4. Promise.resolve();

- 实例方法：

  1. Promise.then();
  2. Promise.catch()
  3. Promise.finally()

## 迭代器(iterator)

1. 在 js 中，迭代器是一个对象，它定义一个序列，并在终止时可能附带一个返回值;
2. 可迭代的对象（在原型链上）有“Symbol.iterator”属性；
3. 通过 obj.next()迭代，返回{value:"迭代序列的值",done: false}/{value: undefined, done: true}；

   ```code
   let set = new Set([1,2,3,4]);
   let iter = set[Symbol.iterator]();
   iter.next()
   ```

Array、Map、Set、String、TypeArray、arguments、nodeList

Symbol.iterator / for of

- 遍历和迭代区别：
  1. 迭代：从目标源“依次，逐个抽取”的方式来提取数据；
     目标源：有序且是连续的；
  2. 遍历：只要能循环所有数据就可以，没有依次

## 生成器(generator)

允许定义一个非连续执行的函数作为迭代算法。生成器函数使用 `function*` 语法编写。

1. 生成器函数中用 yield 关键字来“暂停”函数的执行。
2. 生成器对象（在原型链上）包含一个 next()方法,用这个方法来迭代生成器对象，返回{value: '当前 yield 的值', done: false}/{value: undefined, done: true};

```code
   function* genFun(){
       yield "*"
       console.log("111")
       yield "!"
        console.log("222")
   }
   const genObj = genFun();
   genObj.next()
```
