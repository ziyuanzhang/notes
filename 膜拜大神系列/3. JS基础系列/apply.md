## this 指向 -- apply [原文](https://blog.csdn.net/qq_25076971/article/details/105115057)

this : 当前执行上下文（global、function 或 eval）的一个属性；

- 在非严格模式下，总是指向一个对象；
- 在严格模式下可以是任意值。

  1.apply 由来

```
    Function.prototype.myApply = function (ctx, args) {
        ctx = ctx || window;
        const fn = Symbol();
        ctx[fn] = this;  //ctx.fn=test; this-->test
        const res = ctx[fn](...args); //ctx.fn(...args)-->ctx.test(...atgs)
        delete ctx[fn];
        return res;
    };

    // 示例代码
    function test(arg1, arg2) {
      return `${this.name}, ${arg1} ${arg2}`;
    }
    const obj = {
        name: "I am obj"
    };
    const res = test.myApply(obj, ["hello", "world !!"]);
    console.log(res); // I am obj, hello world !!

```

2. 模拟 new 生成新对象

```
    function Person(name) {
        this.name = name;
        this.age="13"
        this.fun = function(){}
        // return "222"  不返回，返回内部组成的对象
        // return {name:"zhang"} 返回明确对象
    }
    Person.hha = function(){}  //外部的
    Person.prototype.getName = function () {
        return this.name;
    };
    var objectF = function () {
        var obj = new Object();
        Constructor = [].shift.call(arguments);
        obj.__proto__ = Constructor.prototype;
        var ret = Constructor.apply(obj, arguments);
        //借用外部传入的构造器给obj设置属性,this指向obj，this.name=arguments-->obj.name=arguments
        console.log("ret:", ret);
        console.log("obj:", obj);
        return typeof ret == 'object' ? ret : obj;
    };
    var a = objectF(Person, "sven");
    console.log(a.name);
    console.log(a.getName());
     调用Person返回对象，有明确return对象后，返回明确的；没明确时--返回构造函数中的对象
```
