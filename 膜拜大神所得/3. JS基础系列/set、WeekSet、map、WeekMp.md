# 集合(set)、WeekSet; 字典(map)、WeekMap 讲解

Set 是存唯一值的集合，Map 是存键值对的集合。WeakSet、WeakMap 分别是它们的弱式表现的兄弟，只能存对象数据结构，拥有的方法少很多；

- 集合 与 字典 的区别：
  1. 共同点：集合、字典 可以储存不重复的值
  2. 不同点：集合 是以 [value, value]的形式储存元素，字典 是以 [key, value] 的形式储存

内置可迭代对象有：String、Array、Map、Set、arguments 对象、NodeList 集合；  
object 默认不可迭代；但是可以手动添加迭代（@iterator）;

## set：是值的集合，类似于数组，你可以按照插入的顺序迭代它的元素。Set 中的元素只会出现一次，即 Set 中的元素是唯一的。

set 允许储存任何类型的唯一值，无论是原始值或者是对象引用；Set 内部判断两个值是否不同，使用的算法叫做“Same-value-zero equality”，它类似于精确相等运算符（===），主要的区别是 NaN 等于自身，而精确相等运算符认为 NaN 不等于自身。

```0与NaN
+0 与 -0 相等
NaN 与NaN 相等
```

- Set 实例属性

1. constructor： 构造函数;
2. size：元素数量;

- Set 实例方法
  1. add(value)：新增，相当于 array 里的 push；
  2. delete(value)：存在即删除集合中 value；
  3. has(value)：判断集合中是否存在 value；
  4. clear()：清空集合；
  5. entries()：返回一个包含 Set 对象中所有元素得键值对迭代器
  6. keys()：返回一个包含集合中所有键的迭代器
  7. values()：返回一个包含集合中所有值得迭代器
  8. forEach()：用于对集合成员执行 callbackFn 操作；

Set 可以使用 map、filter 方法；Array.from 方法可以将 Set 结构转为数组；

```Array.from与Array.of
  // Array.from ： 方法根据已有的数组创建一个新数组；
  // 要复制 numbers 数组
  let numbers2 = Array.from(numbers);
  // 还可以传入一个用来过滤值的函数，例子如下。
  let evens = Array.from(numbers, x => (x % 2 == 0));
  //----------------------
  Array.of ：方法根据传入的参数创建一个新数组。
  let numbers3 = Array.of(1);
  let numbers4 = Array.of(1, 2, 3, 4, 5, 6)；
  let numbersCopy = Array.of(...numbers4);
```

## WeakSet：对象允许你将“弱引用对象”储存在一个集合中

- WeakSet 与 Set 的区别：

  1. WeakSet 只能储存对象引用，不能存放值，而 Set 对象都可以
  2. WeakSet 持弱引用：集合中对象的引用为弱引用。如果没有其它的对 (WeakSet 中对象)的引用，那么这些对象会被当成垃圾回收掉。

- WeakSet 实例属性

  1. constructor：构造函数，任何一个具有 Iterable 接口的对象，都可以作参数

- WeakSet 实例方法
  1. add(value)：在 WeakSet 对象中添加一个元素 value
  2. has(value)：判断 WeakSet 对象中是否包含 value
  3. delete(value)：删除元素 value
