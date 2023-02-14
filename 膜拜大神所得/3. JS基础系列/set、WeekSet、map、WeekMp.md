# 集合(set)、WeekSet; 字典(map)、WeekMap 讲解

Set 是存唯一值的集合，Map 是存键值对的集合。WeakSet、WeakMap 分别是它们的弱式表现的兄弟，只能存对象数据结构，拥有的方法少很多；

- 集合 与 字典 的区别：
  1. 共同点：集合、字典 可以储存不重复的值
  2. 不同点：集合 是以 [value, value]的形式储存元素，字典 是以 [key, value] 的形式储存

内置可迭代对象有：String、Array、Map、Set、arguments 对象、NodeList 集合；  
object 默认不可迭代；但是可以手动添加迭代（@iterator）;

## set：是值的集合，类似于数组，你可以按照插入的顺序迭代它的元素。Set 中的元素只会出现一次，即 Set 中的元素是唯一的。

set 允许储存任何类型的唯一值，无论是原始值或者是对象引用；Set 内部判断两个值是否不同，使用的算法叫做“Same-value-zero equality”【零值相等】，它类似于精确相等运算符（===），主要的区别是 NaN 等于自身，而精确相等运算符认为 NaN 不等于自身。

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

## Map: 对象保存键值对，并且能够记住键的原始插入顺序。任何值（对象或者基本类型）都可以作为一个键或一个值。

【任何具有 Iterator 接口、且每个成员都是一个双元素的数组的数据结构】都可以当作 Map 构造函数的参数

```1
  const set = new Set([
    ['foo', 1],
    ['bar', 2]
  ]);
  const m1 = new Map(set);
  m1.get('foo') // 1

  const m2 = new Map([['baz', 3]]);
  const m3 = new Map(m2);
  m3.get('baz') // 3
```

Map 的键实际上是跟内存地址绑定，只有内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题，咱们扩大“他人的库”的时候，如果应用对象作为键名，就不必担心本人的属性与原作者的属性同名。

- 键的相等
  键的比较基于【零值相等】算法。（它曾经使用同值相等，将 0 和 -0 视为不同。检查浏览器兼容性。）这意味着 NaN 是与 NaN 相等的（虽然 NaN !== NaN），剩下所有其它的值是根据 === 运算符的结果判断是否相等。

- Map 的属性

  1. constructor：构造函数
  2. size：返回字典中所蕴含的元素个数

- Map 的办法

  1. set(key, value)：向字典中增加新元素
  2. get(key)：通过键查找特定的数值并返回
  3. has(key)：判断字典中是否存在键 key
  4. delete(key)：通过键 key 从字典中移除对应的数据
  5. clear()：将这个字典中的所有元素删除
  6. Keys()：将字典中蕴含的所有键名以迭代器模式返回
  7. values()：将字典中蕴含的所有数值以迭代器模式返回
  8. entries()：返回所有成员的迭代器
  9. forEach()：遍历字典的所有成员
  10. 使用 for...of 循环来实现迭代

  ```代码
    const map = new Map([
                ['name', 'An'],
                ['des', 'JS']
            ]);
    console.log(map.entries())    // MapIterator {"name" => "An", "des" => "JS"}
    console.log(map.keys()) // MapIterator {"name", "des"}
  ```

## WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的。

- Map 的缺点：

  1. 首先赋值和搜索操作都是 O(n) 的时间复杂度（n 是键值对的个数），因为这两个操作都需要遍历全部整个数组来进行匹配。
  2. 另外一个缺点是可能会导致内存泄漏，因为数组会一直引用着每个键和值。这种引用使得垃圾回收算法不能回收处理他们，即使没有其他任何引用存在了。

- WeakMap 与 Map 的区别：

  1. WeakMap 持有的是每个键对象的“弱引用”，这意味着在没有其他引用存在时垃圾回收能正确进行。原生 WeakMap 的结构是特殊且有效的，其用于映射的 key *只有*在其没有被回收时才是有效的。

- WeakSet 实例属性

  1. constructor：构造函数

- WeakSet 实例方法

  1. has(key)：判断是否有 key 关联对象
  2. get(key)：返回 key 关联对象（没有则则返回 undefined）
  3. set(key)：设置一组 key 关联对象
  4. delete(key)：移除 key 的关联对象
