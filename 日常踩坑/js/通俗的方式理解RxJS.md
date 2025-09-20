# 通俗的方式理解 RxJS

今早看 RxJS 入门指引和初步使用的文章的时候， 发现对 Rxjs 所知甚少， 于是去官方看了下教程， 整理出一些东西， 写成此文。
Rxjs 据说会在 2017 年流行起来， 因为其处理异步逻辑，数据流， 事件非常擅长。 但是其学习曲线相比 Promise， EventEmitter 陡峭了不少。 而且民工叔也说:"由于 RxJS 的抽象程度很高，所以，可以用很简短代码表达很复杂的含义，这对开发人员的要求也会比较高，需要有比较强的归纳能力。" 本文就 Rx.js 的几个核心概念做出阐述。 尽可能以通俗易懂的方式解释这些概念。要是本文有误或不完善的地方，欢迎指出。
Observable 到底是什么

```先上代码:
let foo = Rx.Observable.create(observer => {
  console.log('Hello');
  observer.next(42);
});

foo.subscribe(x => console.log(x));
foo.subscribe(y => console.log(y));

输出
"Hello"
42
"Hello“
42
```

这里可以把 foo 想象成一个函数，这意味着你每次调用 foo 都会导致传入 Rx.Observable.create 里的回调函数重新执行一次, 调用的方式为 foo.subscribe(callback), 相当于 foo()。 接收函数返回值的方式也从 var a = foo()改为通过传入回调函数的方式获取。第三行的 observer.next 表示返回一个值, 你可以调用多次，每次调用 observer.next 后， 会先将 next 里的值返回给 foo.subcribe 里的回调函数, 执行完后再返回。observer.complete, observer.error 来控制流程。

```具体看代码:
var observable = Rx.Observable.create(observer => {
try {
observer.next(1);
console.log('hello');
observer.next(2);
observer.next(3);
observer.complete();
observer.next(4);
} catch (err) {
observer.error(err);
}
});

let = subcription = observable.subscribe(value => {
console.log(value)
})

运行结果：
1
hello
2
3
```

如上的第一个回调函数里的结构是推荐的结构。 当 observable 的执行出现异常的时候，通过 observer.error 将错误返回, 然而 observable.subscribe 的回调函数无法接收到.因为 observer.complete 已经调用, 因此 observer.next(4)的返回是无效的. Observable 不是可以返回多个值的 Promise。 虽然获得 Promise 的值的方式也是通过 then 函数这种类似的方式, 但是 new Promise(callback)里的 callback 回调永远只会执行一次！因为 Promise 的状态是不可逆的。
可以使用其他方式创建 Observable， 看代码：
var clicks = Rx.Observable.fromEvent(document, 'click');
clicks.subscribe(x => console.log(x));

当用户对 document 产生一个 click 行为的时候， 就会打印事件对象到控制台上。

## Observer 是什么

```先看代码：
let foo = Rx.Observable.create(observer => {
console.log('Hello');
observer.next(42);
});

let observer = x => console.log(x);
foo.subscribe(observer);
```

代码中的第二个变量就是 observer. 没错， observer 就是当 Observable"返回"值的时候接受那个值的函数!第一行中的 observer 其实就是通过 foo.subscribe 传入的 callback. 只不过稍加封装了。 怎么封装的？

```看代码：
let foo = Rx.Observable.create(observer => {
try {
console.log('Hello');
observer.next(42);
observer.complete();
observer.next(10);
} catch(e) { observer.error(e) }

});

let observer = {
next(value) { console.log(value) },
complete() { console.log('completed'),
error(err) { console.error(err) }
}
foo.subscribe(observer);
```

你看到 observer 被定义成了一个对象， 其实这才是完整的 observer. 传入一个 callback 到 observable.subcribe 相当于传入了 { next: callback }。

## Subcription 里的陷阱

```
Subscription 是什么， 先上代码：
var observable = Rx.Observable.interval(1000);
var subscription = observable.subscribe(x => console.log(x));

setTimeout(() => {
subscription.unsubscribe();
}, 3100)

运行结果：
0
1
2

```

Rx.Observable.interval 可以返回一个能够发射(返回)0， 1， 2， 3...， n 数字的 Observable， 返回的时间间隔这里是 1000ms。 第二行中的变量就是 subscription。 subscription 有一个 unsubscribe 方法, 这个方法可以让 subscription 订阅的 observable 发射的数据被 observer 忽略掉。 通俗点说就是取消订阅。
unsubscribe 存在一个陷阱。

```先看代码：
var foo = Rx.Observable.create((observer) => {
var i = 0
setInterval(() => {
observer.next(i++)
console.log('hello')
}, 1000)
})

const subcription = foo.subscribe((i) => console.log(i))
subcription.unsubscribe()

运行结果：
hello
hello
hello
......
hello
```

刚才说了， unsubscribe 只会让 observer 忽略掉 observable 发射的数据，但是 setInterval 依然会继续执行。 这看起来似乎是一个愚蠢的设计。 所以不建议这样写。

## Subject

Subject 是一种能够发射数据给多个 observer 的 Observable, 这让 Subject 看起来就好像是 EventEmitter。 先上代码：
var subject = new Rx.Subject();

subject.subscribe({
next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
next: (v) => console.log('observerB: ' + v)
});

subject.next(1);
subject.next(2);

运行结果：
observerA: 1
observerB: 1
observerA: 2
observerB: 2
与 Observable 不同的是， Subject 发射数据给多个 observer。 其次， 定义 subject 的时候并没有传入 callback， 这是因为 subject 自带 next, complete, error 等方法。从而可以发射数据给 observer。 这和 EventEmitter 很类似。observer 并不知道他 subscribe 的是 Obervable 还是 Subject。 对 observer 来说是透明的。 而且 Subject 还有各种派生， 比如说：
BehaviorSubject 能够保留最近的数据，使得当有 subscribe 的时候，立马发射出去。看代码：
var subject = new Rx.BehaviorSubject(0); // 0 is the initial value

subject.subscribe({
next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);

subject.subscribe({
next: (v) => console.log('observerB: ' + v)
});

subject.next(3);

运行结果：
observerA: 0
observerA: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
ReplaySubject 能够保留最近的一些数据， 使得当有 subscribe 的时候，将这些数据发射出去。看代码：
var subject = new Rx.ReplaySubject(3);

subject.subscribe({
next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
next: (v) => console.log('observerB: ' + v)
});

subject.next(5);

输出结果：
observerA: 1
observerA: 2
observerA: 3
observerA: 4
observerB: 2
observerB: 3
observerB: 4
observerA: 5
observerB: 5
第一行的声明表示 ReplaySubject 最大能够记录的数据的数量是 3。
AsyncSubject 只会发射结束前的一个数据。 看代码：
var subject = new Rx.AsyncSubject();

subject.subscribe({
next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
next: (v) => console.log('observerB: ' + v)
});

subject.next(5);
subject.complete();

输出结果：
observerA: 5
observerB: 5
既然 subject 有 next, error, complete 三种方法， 那 subject 就可以作为 observer！ 看代码：
var subject = new Rx.Subject();

subject.subscribe({
next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
next: (v) => console.log('observerB: ' + v)
});

var observable = Rx.Observable.from([1, 2, 3]);

observable.subscribe(subject);

输出结果：
observerA: 1
observerB: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
也就是说， observable.subscribe 可以传入一个 subject 来订阅其消息。 这就好像是 Rxjs 中的一颗语法糖， Rxjs 有专门的实现。
Multicasted Observables 是一种借助 Subject 来将数据发射给多个 observer 的 Observable。 看代码：
var source = Rx.Observable.from([1, 2, 3]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

multicasted.subscribe({
next: (v) => console.log('observerA: ' + v)
});
multicasted.subscribe({
next: (v) => console.log('observerB: ' + v)
});

multicasted.connect();

Rx.Observable.from 能够逐一发射数组中的元素， 在 multicasted.connect()调用之前的任何 subscribe 都不会导致 source 发射数据。multicasted.connect()相当于之前的 observable.subscribe(subject)。因此不能将 multicasted.connect()写在 subscribe 的前面。因为这会导致在执行 multicasted.connect()的时候 source 发射数据， 但是 subject 又没保存数据， 导致两个 subscribe 无法接收到任何数据。 最好是第一个 subscribe 的时候能够得到当前已有的数据， 最后一个 unsubscribe 的时候就**停止 Observable 的执行**， 相当于 Observable 发射的数据都被忽略。
refCount 就是能够返回这样的 Observable 的方法
var source = Rx.Observable.interval(500);
var subject = new Rx.Subject();
var refCounted = source.multicast(subject).refCount();
var subscription1, subscription2, subscriptionConnect;

console.log('observerA subscribed');
subscription1 = refCounted.subscribe({
next: (v) => console.log('observerA: ' + v)
});

setTimeout(() => {
console.log('observerB subscribed');
subscription2 = refCounted.subscribe({
next: (v) => console.log('observerB: ' + v)
});
}, 600);

setTimeout(() => {
console.log('observerA unsubscribed');
subscription1.unsubscribe();
}, 1200);

setTimeout(() => {
console.log('observerB unsubscribed');
subscription2.unsubscribe();
}, 2000);

输出结果：
observerA subscribed
observerA: 0
observerB subscribed
observerA: 1
observerB: 1
observerA unsubscribed
observerB: 2
observerB unsubscribed

## What's Operators?

Observable 上有很多方法， 比如说 map, filter, merge 等等。 他们基于调用它们的 observable，返回一个全新的 observable。 而且他们都是纯方法。 operators 分为两种， instance operators 和 static operators。 instance operators 是存在于 observable 实例上的方法， 也就是实例方法； static operators 是存在于 Observable 这个类型上的方法， 也就是静态方法。Rxjs 拥有很多强大的 operators。
自己实现一个 operators：
function multiplyByTen(input) {
var output = Rx.Observable.create(function subscribe(observer) {
input.subscribe({
next: (v) => observer.next(10 \* v),
error: (err) => observer.error(err),
complete: () => observer.complete()
});
});
return output;
}

var input = Rx.Observable.from([1, 2, 3, 4]);
var output = multiplyByTen(input);
output.subscribe(x => console.log(x));

输出结果：
10
20
30
40
Rx.js 实践
import React from 'react';
import ReactDOM from 'react-dom';
import Rx from 'rx';

class Main extends React.Component {
constructor (props) {
super(props);
this.state = {count: 0};
}

// Click events are now observables! No more proactive approach.
componentDidMount () {
const plusBtn = document.getElementById('plus');
const minusBtn = document.getElementById('minus');

    const plus$ = Rx.Observable.fromEvent(plusBtn, 'click').map(e => 1);
    const minus$ = Rx.Observable.fromEvent(minusBtn, 'click').map(e => -1);

    Rx.Observable.merge(plus$, minus$).scan((acc, n) => acc + n)
      .subscribe(value => this.setState({count: value}));

}

render () {
return (

<div>
<button id="plus">+</button>
<button id="minus">-</button>
<div>count: {this.state.count}</div>
</div>
);
}
}

ReactDOM.render(<Main/>, document.getElementById('app'));

merge 用于合并两个 observable 产生一个新的 observable。 scan 类似于 Array 中的 reduce。 这个例子实现了点击 plus 的时候+1， 点击 minus 的时候-1。
Rx.js 适用的场景
多个复杂的异步或事件组合在一起。
处理多个数据序列
假如没有被复杂的异步，事件， 数据序列困扰， 如果 promise 已经足够的话， 就没必要适用 Rx.js。
Summary
RxJS 适用于解决复杂的异步，事件问题。
Observable， Observer， Subscription， Subscrib， Subject 概念。
