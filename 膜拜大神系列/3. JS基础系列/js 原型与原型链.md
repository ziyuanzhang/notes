## js 原型与原型链 [原文](https://www.jianshu.com/p/652991a67186)

js 对象分为：普通对象和函数对象;  
Object 、Function 是 JS 自带的函数对象。

每个函数对象（Person）都有 prototype 属性 指向它的原型对象（普通对象）；  
每个对象（函数对象，普通对象）都有'_proto_'属性 指向构造函数的原型对象（普通对象）；

#### 1.普通对象--函数对象

```
var o1 = {};
var o2 = new Object();
var o3 = new f1();

function f1(){};
var f2 = function(){};
var f3 = new Function('str','console.log(str)');

console.log(typeof Object); //function
console.log(typeof Function); //function

console.log(typeof f1); //function
console.log(typeof f2); //function
console.log(typeof f3); //function

console.log(typeof o1); //object
console.log(typeof o2); //object
console.log(typeof o3); //object
```

1. o1 o2 o3 为普通对象，f1 f2 f3 为函数对象;
2. 凡是通过 new Function() 创建的对象都是**函数对象**，其他的都是普通对象。
3. f1,f2,归根结底都是通过 new Function()的方式进行创建的。
4. Function Object 也都是通过 New Function()创建的。

#### 2.构造函数--原型对象

```
function Person(name, age, job) {
 this.name = name;
 this.age = age;
 this.job = job;
 this.sayName = function() { alert(this.name) }
}
var person1 = new Person('Zaxlct', 28, 'Software Engineer');
var person2 = new Person('Mick', 23, 'Doctor');
```

person1，person2 是实例；Person 是构造函数；Person.prototype 是原型对象(记作 对象 A)；

通常所说的 person1 的原型（原型对象），更准确地描述是 person1 的构造函数（Person）的原型对象

构造函数（Person）的原型对象(A) 有 2 个属性：constructor，_proto_

- 对象 A :

```
{
   constructor: ƒ Person(name, age, job)
  __proto__: Object
}
```

- A 对象的 constructor 指向 构造函数(Person)

```
constructor：ƒ Person(name, age, job)
{
    arguments: null
    caller: null
    length: 3
    name: "Person",
    prototype:{},//指向对象A（套娃--循环递归）
    __proto__:f() //
  }
```

- A 对象的 _proto_ ==(A 的构造函数)的 prototype --> Object.prototype
  A 是普通对象，A 的构造函数是 Object;

```
_proto_:Object
{
   constructor: ƒ Object()
   hasOwnProperty: ƒ hasOwnProperty()
   isPrototypeOf: ƒ isPrototypeOf()
   propertyIsEnumerable: ƒ propertyIsEnumerable()
   toLocaleString: ƒ toLocaleString()
   toString: ƒ toString()
   valueOf: ƒ valueOf()
   __defineGetter__: ƒ __defineGetter__()
   __defineSetter__: ƒ __defineSetter__()
   __lookupGetter__: ƒ __lookupGetter__()
   __lookupSetter__: ƒ __lookupSetter__()
   get __proto__: ƒ __proto__()
   set __proto__: ƒ __proto__()
}

```

### 3. 构造器

```
var obj = {}  等价  var obj = new Object()

obj.constructor === Object
obj.__proto__ === Object.prototype
```

obj 是 new 操作符后跟一个**构造函数**来创建的；
构造函数（Object）本身就是一个函数，和上面的构造函数（Person）差不多；只不过该函数是出于创建新对象的目的而定义的； Array，Date，Function,Date,Number,String, Boolean 也是。

```
typeof Object    ---->function
typeof Function  ---->function
typeof Array   ---->function
typeof Date  ---->function
typeof Number   ---->function
typeof String  ---->function
typeof Boolean   ---->function
```

### 4. 原型链

1. person1._proto_ 是什么？

   因为 person1._proto_ === person1 的构造函数.prototype;  
   因为 person1 的构造函数 === Person;  
   所以 person1._proto_ === Person.prototype;

2. Person._proto_ 是什么？

   因为 Person._proto_ === Person 的构造函数.prototype
   因为 Person 的构造函数 === Function
   所以 Person._proto_ === Function.prototype(空函数)；

3. Person.prototype._proto_ 是什么？

   Person.prototype 是一个普通对象，我们无需关注它有哪些属性，只要记住它是一个普通对象。  
   因为一个普通对象的构造函数 === Object  
   所以 Person.prototype._proto_ === Object.prototype

4. Object._proto_ 是什么？--->通第 2 题

   因为 Object._proto_ === Object 的构造函数.prototype;
   因为 Object 的构造函数 === Function;
   所以 Object._proto_ === Function.prototype(空函数)；

5. Object.prototype._proto_ 是什么？

   Object.prototype 对象也有 proto 属性，但它比较特殊，为 null 。
   因为 null 处于原型链的顶端，这个只能记住。
   Object.prototype._proto_ === null

```
    Object.prototype={
        constructor: ƒ Object()
        hasOwnProperty: ƒ hasOwnProperty()
        isPrototypeOf: ƒ isPrototypeOf()
        propertyIsEnumerable: ƒ propertyIsEnumerable()
        toLocaleString: ƒ toLocaleString()
        toString: ƒ toString()
        valueOf: ƒ valueOf()
        __defineGetter__: ƒ __defineGetter__()
        __defineSetter__: ƒ __defineSetter__()
        __lookupGetter__: ƒ __lookupGetter__()
        __lookupSetter__: ƒ __lookupSetter__()
        get __proto__: ƒ __proto__()
        set __proto__: ƒ __proto__()
    }
```

### 5. Function.prototype 是一个空函数（Empty function）

- 所有的构造器都来自于 Function.prototype，包括根构造器 Object 及 Function 自身;

  Object._proto_ == Function.prototype(空函数);  
  Function._proto_ == Function.prototype(空函数);

- 所有构造器都继承了 Function.prototype 的属性及方法。如 length、call、apply、bind;
  typeof Function.prototype -->// function
  typeof 其他.prototype -->object (let obj=new Object-->{}-->obj._proto_==Object.prototype)

所有构造器（含内置及自定义）的 _proto_ == Function.prototype;
console.log(Function.prototype._proto_ === Object.prototype) // true

**注意:**

- 说明所有的构造器也都是一个普通 JS 对象，可以给构造器**添加/删除属性**等。
- 同时它也继承了 Object.prototype 上的所有方法：toString、valueOf、hasOwnProperty 等。

- Object 继承 Function.prototype；-->Function.prototype 继承 Object.prototype；--> Object.prototype._proto_ === null // true
