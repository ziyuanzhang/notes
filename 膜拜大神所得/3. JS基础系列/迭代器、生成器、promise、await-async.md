# 迭代器(iterator)、生成器(generator)、promise、await/async

## promise

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

1. 迭代器协议(Iterator Protocol):

   迭代器协议定义了一种标准方式，使对象可以“按需、逐步”返回其内部的值。一个对象如果要符合迭代器协议，必须实现一个 next() 方法，该方法返回一个对象，包含以下两个属性：

   - value：当前迭代的值。
   - done：一个布尔值，表示迭代是否完成。如果 done 为 true，则表示迭代结束。

   迭代器协议的核心是 next() 方法，它驱动了迭代的过程。

2. 迭代器 (Iterator):

   迭代器是一个`实现了迭代器协议`的 “对象”。它的核心是 next() 方法，该方法用于 “逐步” 返回序列中的值，而不需要暴露集合的底层表示

   ```js code
   function createIterator(array) {
     let index = 0;
     return {
       next: function () {
         if (index < array.length) {
           return { value: array[index++], done: false };
         } else {
           return { value: undefined, done: true };
         }
       }
     };
   }

   const iterator = createIterator([1, 2, 3]);
   console.log(iterator.next()); // { value: 1, done: false }
   console.log(iterator.next()); // { value: 2, done: false }
   console.log(iterator.next()); // { value: 3, done: false }
   console.log(iterator.next()); // { value: undefined, done: true }
   ```

   迭代器必须有： 1.可迭代的属性，2.next()函数并且执行后返回{done:Boolen 值,value:迭代值}

   **注意：**for..of 只能用在迭代器上，会自动调用迭代器的 next()函数

3. 可迭代协议 (Iterable Protocol):

   可迭代协议定义了一种标准方式，使对象可以被迭代（例如，可以使用 for...of 循环）。一个对象如果要符合可迭代协议，必须实现一个特殊的方法 [Symbol.iterator]，该方法返回一个迭代器对象。

   ```js code
   const iterable = {
     [Symbol.iterator]: function () {
       let index = 0;
       return {
         next: () => {
           if (index < this.data.length) {
             return { value: this.data[index++], done: false };
           } else {
             return { value: undefined, done: true };
           }
         }
       };
     },
     data: [1, 2, 3]
   };

   for (const value of iterable) {
     console.log(value); // 1, 2, 3
   }
   ```

4. 可迭代对象 (Iterable Object):

   一个对象如果实现了“可迭代协议”（即具有 [Symbol.iterator] 方法），它就是一个可迭代对象。“Symbol.iterator” 方法返回一个迭代器。
   内置可迭代对象有： Array、String、Map、Set、String、arguments、nodeList；这些对象可以使用 for...of 循环进行迭代。

   ```js code1
   const iterable = [1, 2, 3];
   const iterator = iterable[Symbol.iterator]();
   console.log(iterator.next()); // { value: 1, done: false }
   console.log(iterator.next()); // { value: 2, done: false }
   console.log(iterator.next()); // { value: 3, done: false }
   console.log(iterator.next()); // { value: undefined, done: true }
   ```

   ```js code2
   let set = new Set([1, 2, 3, 4]);
   let iter = set[Symbol.iterator]();
   iter.next();
   ```

   ```js code3
   const array = [1, 2, 3];
   for (const value of array) {
     console.log(value); // 输出 1, 2, 3
   }
   ```

5. 迭代器对象 (Iterator Object):

   迭代器对象是通过调用可迭代对象的 Symbol.iterator 方法生成的对象。它实现了迭代器协议，并且可以通过 next() 方法逐步访问可迭代对象的元素。

   ```js code
   const array = [10, 20, 30];
   const iterator = array[Symbol.iterator]();

   console.log(iterator.next()); // { value: 10, done: false }
   console.log(iterator.next()); // { value: 20, done: false }
   console.log(iterator.next()); // { value: 30, done: false }
   console.log(iterator.next()); // { value: undefined, done: true }
   ```

- 总结

1. 迭代器协议：定义了迭代器的行为，要求实现 next() 方法。
2. 迭代器：实现了迭代器协议的对象。
3. 可迭代协议：定义了 [Symbol.iterator] 方法，用于返回 “迭代器对象”。
4. 可迭代对象：实现了 Symbol.iterator 方法的对象，可以生成 “迭代器”。
5. 迭代器对象：通过调用 “可迭代对象”的 [Symbol.iterator] 方法生成的 “对象”。

这些概念共同构成了 JavaScript 中的迭代机制，允许我们以统一的方式遍历各种数据结构；支持 for...of 循环、解构赋值等操作。

- 迭代器和迭代器对象：虽然密切相关，但它们并不是完全相同的东西

  1. 迭代器：是一个概念，是一种机制或协议，它定义了如何逐步访问一个集合中的元素，而不需要暴露集合的内部结构。迭代器本质上是一个对象，它实现了一个特定的接口（Iterator 接口）。
  2. 迭代器对象：是一个具体的对象，它实现了迭代器协议（即具有 next() 方法）。换句话说，`迭代器对象是迭代器的具体实现`。

- 遍历和迭代区别：

1. 迭代：从目标源“依次，逐个抽取”的方式来提取数据；

   目标源：有序且是连续的；

2. 遍历：只要能循环所有数据就可以，没有依次

## 生成器(generator)

- 生成器：是 ES6 引入的特殊函数，可以暂停和恢复执行。它们使用 `function*` 语法定义，并使用 `yield` 关键字暂停执行。

生成器对象（在原型链上）包含一个 next()方法，用这个方法来迭代生成器对象，返回{value: '当前 yield 的值', done: false}/{value: undefined, done: true};

```js code
function* genFun() {
  yield "*";
  console.log("111");
  yield "!";
  console.log("222");
}
const genObj = genFun();
genObj.next();
```

**注：**生成器和迭代器为 js 提供了强大的“控制流程”和“数据生成”能力，特别是在处理大型数据集或异步操作时非常有用。
