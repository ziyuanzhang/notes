## js 核心内置对象：[原文 1](https://codeplayer.vip/p/j7sgh) [原文 2](https://www.jianshu.com/p/652991a67186)

#### JavaScript 内置对象的 prototype 属性是只读的，其本身就是一个对象，我们只能够对该对象的属性和方法进行操作，比如添加属性或方法、删除属性和方法，而不能使用另一个对象来替换该对象，哪怕是另外一个原型对象。(这里说的仅仅是 JavaScript 的内置对象，并不包括自定义的对象)。

1. Global 对像(Infinity,NaN,undefined,globalThis): 返回简单值，没有属性和方法。
2. arguments 对象：类似数组

```
var args = Array.prototype.slice.call(arguments);
var args = [].slice.call(arguments);
const args = Array.from(arguments);
const args = [...arguments];
```

3. Error 对象
   **基本对象：**
4. Boolean 对象
5. Symbol 对象
6. Object 对像:几乎所有的 JS 对象都是 Object 的实例；所有对象从 Object.prototype 继承方法和属性**_Object.create(null) 除外_** ，尽管它们可能被覆盖。
7. Function 对象:
   所有函数的默认原型都是 Object 的实例，因此所有的对象都具有 Object 的属性和方法，例如：toString()、valueOf()等。

```
众所周知，JavaScript中的类都是以函数的形式进行声明的。因为JavaScript中没有其他语言中类似class ClassName{ }形式的类声明，而是把函数当作类来使用，函数名就是类名，函数本身就是类的构造函数，并且可以使用new关键字来创建一个实例对象。

通过new创建的实例对象，它们的属性和方法都是独立存在的，对一个对象的属性和方法进行添加/删除，并不会影响到另一个"同类"对象。
// 在JavaScript中类都是以函数的形式来定义的
function Student(name, age){
	// 类的属性
	this.name = name;
	this.age = age;
	// 类的方法
	this.sayHi = function(){
		console.log("大家好，我叫" + this.name + "，今年" + this.age + "岁");
	};
}
// 创建一个Student对象：小明
var xm = new Student("小明", 18);
xm.sayHi(); // 大家好，我叫小明，今年18岁

// 创建一个Student对象：小红
var xh = new Student("小红", 16);
xh.sayHi(); // 大家好，我叫小红，今年16岁

// 为小明添加一个考试的方法
xm.exam = function(){
	console.log(this.name + "在考试...");
};

// 调用小明的exam()
xm.exam();
// 调用小红的exam()
// xh.exam(); //将会报错，因为"小红"没有exam()方法

// 小红与小明的sayHi()方法不是同一个方法
console.log(xm.sayHi == xh.sayHi); // false
// 删除小红的sayHi()方法
delete xh.sayHi;
xm.sayHi(); // 正常输出：大家好，我叫小明，今年18岁
// xh.sayHi(); //将会报错，因为该方法已经被删除

2. 实例的属性和方法独立存在，浪费资源；函数中添加prototype共享属性和方法。
	// prototype上的count属性
	// 如果已存在该属性就+1，没有就声明并赋值为1
	Student.prototype.count && Student.prototype.count++ || ( Student.prototype.count = 1 );

    // prototype上的sayHi()方法
	Student.prototype.sayHi = function(){
		console.log("大家好，我叫" + this.name + "，今年" + this.age + "岁");
	};
    //或者 直接修改prototype属性（不建议）
    Student.prototype = {
        count : 0,
        sayHi : function(){
            console.log("大家好，我叫" + this.name + "，今年" + this.age + "岁");
        }
    };
```

8. Array 对象
9. Sring 对象

10. Number 对象
11. BigInt 对象
12. Math 对象
13. Date 对象
    **字符串：表示和操作字符串**
14. Regexp 对象:1.静态属性（自带的直接用）2.实例属性（实例直接用）3.实例方法

```
常用：
1.exec() 在该字符串中执行匹配项的搜索:返回数组
const regex1 = RegExp('foo*', 'g');
const str1 = 'table football, foosball';
 regex1.exec(str1)
 2. 该正则在字符串里是否有匹配:返回true 或 false
 const str = 'table football';
const regex = new RegExp('foo*');
console.log(regex.test(str));
3.toString() 返回表示指定对象的字符串。重写Object.prototype.toString()方法。
myExp = new RegExp("a+b+c");
alert(myExp.toString());       // 显示 "/a+b+c/"
foo = new RegExp("bar", "g");
alert(foo.toString());         // 显示 "/bar/g"
```

###

```
var o1 = {};
var o2 =new Object();
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

凡是通过 new Function() 创建的对象都是函数对象，其他的都是普通对象;  
f1,f2,归根结底都是通过 new Function()的方式进行创建的。Function Object 也都是通过 New Function()创建的

```
function Person(){};
 console.log(Person.prototype) //Person{}
 console.log(typeof Person.prototype) //Object
 console.log(typeof Function.prototype) // Function，这个特殊
 console.log(typeof Object.prototype) // Object
 console.log(typeof Function.prototype.prototype) //undefined
 var person1 = new Person();
  console.log(typeof person1) // Object
```

原型对象其实就是普通对象（但 Function.prototype 除外，它是函数对象，但它很特殊，他没有 prototype 属性（前面说道函数对象都有 prototype 属性））

### 构造器

```
var obj = {}
它等同于下面这样：
var obj = new Object()
obj 是构造函数（Object）的一个实例。所以：
obj.constructor === Object
obj._proto_ === Object.prototype
```

新对象 obj 是使用 new 操作符后跟一个**构造函数**来创建的。
构造函数（Object）本身就是一个函数（就是上面说的函数对象），它和上面的构造函数 Person 差不多。只不过该函数是出于创建新对象的目的而定义的

1.

```
person1.__proto__ 是什么？
因为 person1.__proto__ === person1 的构造函数.prototype
因为 person1的构造函数 === Person
所以 person1.__proto__ === Person.prototype
```

2.

```
Person.__proto__ 是什么？
因为 Person.__proto__ === Person的构造函数.prototype
因为 Person的构造函数 === Function
所以 Person.__proto__ === Function.prototype
```

3.

```
Person.prototype.__proto__ 是什么？
Person.prototype 是一个普通对象，我们无需关注它有哪些属性，只要记住它是一个普通对象。
因为一个普通对象的构造函数 === Object
所以 Person.prototype.__proto__ === Object.prototype
```

4.

```
Object.__proto__ 是什么？
参照第二题，因为 Person 和 Object 一样都是构造函数
```

5.

```
Object.prototype__proto__ 是什么？
Object.prototype 对象也有proto属性，但它比较特殊，为 null 。因为 null 处于原型链的顶端，这个只能记住。
Object.prototype.__proto__ === null
```
