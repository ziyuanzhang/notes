## apply [原文](https://blog.csdn.net/qq_25076971/article/details/105115057)

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

```
    function Person(name) {
        this.name = name;
    }
    Person.prototype.getName = function () {
        return this.name;
    };
    var objectF = function () {
        var obj = new Object();
        Constructor = [].shift.call(arguments);
        obj.__proto__ = Constructor.prototype;
        var ret = Constructor.apply(obj, arguments);
        console.log("ret:", ret);
        return typeof ret == 'object' ? ret : obj;
    };
    var a = objectF(Person, "sven");
    console.log(a.name);
```
