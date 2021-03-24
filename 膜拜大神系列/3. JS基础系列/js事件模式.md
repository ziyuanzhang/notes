JavaScript 设计模式和开发实践

## JS 事件（默认事件，自定义事件，观察者模式，发布订阅模式）

#### 1. 默认事件 (click，input...)

#### 2. 自定义事件 （Event，CustomEvent）

Event：IE 不支持，定义事件时不能传参数  
CustomEvent：可以在 Web Workers 中使用，定义事件时能传参数

```
    var event = new CustomEvent('myevent', {detail:123});
    event.detail = 456; // Ignored in sloppy mode, throws in strict mode
    console.log(event.detail); // 123

    var event = new Event('myevent');
    event.detail = 123; // It's not readonly
    event.detail = 456;
    console.log(event.detail); // 456
```

```
// 创建一个事件
li:var event = new CustomEvent("myEvent", {"detail":{"hazcheeseburger":true}})
li:var myEvent = new Event("look", {"bubbles":false, "cancelable":false});
    1. document.dispatchEvent(myEvent);
    2. myDiv.dispatchEvent(myEvent);// 事件可以在任何元素触发，不仅仅是document
 document.addEventListener("myEvent", function (e) {
            console.log(e);
        })
        document.removeEventListener
```

#### 3.观察者模式---（目标对象-->观察者）

观察者模式:一对多的依赖关系，当目标对象（Subject ）的状态发生改变时，所有依赖于它的对象（Observer）都将得到通知，并自动更新。

一个目标对象（Subject），拥有方法：添加 / 删除 / 通知 观察者对象 （Observer）；  
多个观察者对象（Observer），拥有方法：接收 观察者对象 （Observer） 状态变更通知并处理；

```
Subject 添加一系列 Observer， Subject 负责维护与这些 Observer 之间的联系，“你对我有兴趣，我更新就会通知你”。

// 目标对象
  class Subject(){
    constructor(){
        this.observers=[];//观察者列表
    }
    add(observer){
        this.observers.push(observer)
    }
    remove(observer){
        let idx = this.observers.findIndex(item=>item==observer);
        if(idx>-1){
            this.observers.splice(idx,1)
        }
    }
    notify(){
        for(let observer of this.observers){
            observer.update();
        }
    }
  }
  //观察者类
  class Observer{
       constructor(name){
        this.name = name;
    }
    update(){
        console.log(`目标对象通知我了，我是${this.name}`)
    }
  }
  //实例化目标对象
  let subject = new Subject();
  //实例化观察者
  let obs1 = new Observer('前端');
  let obs2 = new Observer('后端');
  subject.add(obs1);
  subject.add(obs2);
  subject.notify()
  //输出
  //目标对象通知我了，我是前端
  //目标对象通知我了，我是后端
```

#### 4.发布订阅模式--（发布者-->消息代理/调度中心/中间件 -->订阅者）

发布订阅模式：发布者，并不会直接通知订阅者，换句话说，发布者和订阅者，彼此互不相识。  
由一个调度中心来做中间人，发布者更新(publish)主题，由主题(调度中心)来进行通知(noticy)订阅者更新(update)。
![发布订阅](./img/Publish-And-Subscribe.png)

```
    // 主题
    class Dep {
        constructor(callback) {
            this.subs = []; // 主题的订阅者
            this.callback = callback;
        }
        // 添加订阅者
        addSub(sub) {
            this.subs.push(sub);
            return this;
        }
        // 主题更新通知---调用订阅者update，通知所有订阅者
        notify() {
            this.subs.forEach(item => item.update(this.callback));
        }
    }

    // 订阅者
    class Sub {
        constructor(val) {
            this.val = val;
        }
        update(callback) {
            this.val = callback(this.val); // 执行订阅主题的函数
            console.log('更新之后:', this.val);
        }
    }

    // 发布者
    class Pub {
        constructor() {
            this.deps = []; // 发布的主题列表
        }
        // 添加主题
        addDep(dep) {
            this.deps.push(dep);
        }
        // 移除主题
        removeDep(dep) {
            let index = this.deps.indexOf(dep);
            if (index !== -1) {
              this.deps.splice(index, 1);
            }
        }
        // 更新主题
        publish(dep) {
            this.deps.forEach(item => item == dep && item.notify());
        }
    }
    // 新建主题，给主题中加订阅者
    let dep1 = new Dep(item => item * item);
    dep1.addSub(new Sub(1)).addSub(new Sub(2)).addSub(new Sub(3));

    // 新建发布者
    let pub = new Pub();
    // 添加主题
    pub.addDep(dep1);
    // 发布者发布，通知这个主题的所有订阅者更新
    pub.publish(dep1);

    // 输出结果
    // 更新之后结果:1
    // 更新之后结果:4
    // 更新之后结果:9
```
