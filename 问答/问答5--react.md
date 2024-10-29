# react

https://www.zhihu.com/question/394945080/answer/3248392880

## React 的事件和普通的 HTML 事件有什么不同？

1. 对于事件名称命名方式，原生事件为全小写，react 事件采用小驼峰
2. 对于事件函数处理语法，原生事件为字符串，react 事件为函数
3. react 事件不能采用 return false 的方式来阻止浏览器的默认行为，而必须要地明确地调用 preventDefault()来阻止默认行为

- 合成事件是 react 模拟原生 DOM 事件所有能力的一个事件对象，其优点如下

1. 兼容所有浏览器，更好的跨平台
2. 将事件统一存放在一个数组，避免频繁的新增与删除（垃圾回收）。方便 react 统一管理和事务机制。
3. 事件的执行顺序为原生事件先执行，合成事件后执行，合成事件会冒泡绑定到 document 上，所以尽量避免原生事件与合成事件混用，如果原生事件阻止冒泡，可能会导致合成事件不执行，因为需要冒泡到 document 上合成事件才会执行。

## React 组件中怎么做事件代理？它的原理是什么？

在 React 底层，主要对合成事件做了两件事：

1. 事件委派：React 会把所有的事件绑定到结构的最外层，使用统一的事件监听器，这个事件监听器上维持了一个映射来保存所有组件内部事件监听和处理函数。
2. 自动绑定：React 组件中，每个方法的上下文都会指向该组件的实例，即自动绑定 this 为当前组件。

## React 高阶组件、Render props、hooks 有什么区别，为什么要不断迭代

Hoc、render props 和 hook 都是为了解决代码复用的问题，

但是 hoc 和 render props 都有特定的使用场景和明显的缺点。

hook 是 react16.8 更新的新的 API，让组件逻辑复用更简洁明了，同时也解决了 hoc 和 render props 的一些缺点。

## React.createClass 和 extends Component 的区别有哪些？

1. 语法区别
   createClass 本质上是一个工厂函数，extends 的方式更加接近最新的 ES6 规范的 class 写法。
2. propType 和 getDefaultProps
   React.createClass：通过 proTypes 对象和 getDefaultProps()方法来设置和获取 props.
   React.Component：通过设置两个属性 propTypes 和 defaultProps
3. 状态的区别
   React.createClass：通过 getInitialState()方法返回一个包含初始值的对象
   React.Component：通过 constructor 设置初始状态
4. this 区别
   React.createClass：会正确绑定 this
   React.Component：由于使用了 ES6，这里会有些微不同，属性并不会自动绑定到 React 类的实例上
5. Mixins
   React.createClass：使用 React.createClass 的话，可以在创建组件时添加一个叫做 mixins 的属性，并将可供混合的类的集合以数组的形式赋给 mixins。
   如果使用 ES6 的方式来创建组件，那么 React mixins 的特性将不能被使用了。

## React 如何判断什么时候重新渲染组件

组件状态的改变可以因为 props 的改变，或者直接通过 setState 方法改变;
因为 React 中的 shouldComponentUpdate 方法默认返回 true，这就是导致每次更新都重新渲染的原因。

## React 中可以在 render 访问 refs 吗？为什么？

不可以，render 阶段 DOM 还没有生成，无法获取 DOM。DOM 的获取需要在 pre-commit 阶段和 commit 阶段：

## React setState 调用之后发生了什么？是同步还是异步？

1.  在代码中调用 setState 函数之后，合并 传入的参数对象与组件;
2.  React 会以相对高效的方式根据新的状态构建 React 元素树;
3.  在 React 得到元素树之后，React 会自动计算出新的树与老树的节点差异，然后根据差异对界面进行最小化重渲染。

在源码中，通过 isBatchingUpdates 来判断 setState 是先存进 state 队列还是直接更新，如果值为 true 则执行异步操作，为 false 则直接更新。

- 异步：在 React 生命周期事件和合成事件中;
- 同步：原生事件;

一般认为是异步的；

## React 中怎么检验 props？验证 props 的目的是什么？

PropTypes 检测 props

## React 16 中新生命周期有哪些

![](./img/react/react16生命周期.png)

- Pre-commit 阶段：所谓“commit”，这里指的是“更新真正的 DOM 节点”这个动作。所谓 Pre-commit，就是说我在这个阶段其实还并没有去更新真实的 DOM，不过 DOM 信息已经是可以读取的了；
- Commit 阶段：在这一步，React 会完成真实 DOM 的更新工作。Commit 阶段，我们可以拿到真实 DOM（包括 refs）。

## React-Router 的实现原理是什么？

- 基于 hash 的路由：
  通过监听 hashChange 事件，感知 hash 的变化改变 hash 可以直接通过 location.hash=xxx

- 基于 H5 history 路由：
  改变 url 可以通过 history.pushState 和 replaceState 等，会将 URL 压入堆栈，同时能够应用 history.go() 等 API 监听 url 的变化可以通过自定义事件触发实现

## react-router 里的 Link 标签和 a 标签的区别

`<Link>`是 react-router 里实现路由跳转的链接，一般配合`<Route>`使用，react-router 接管了其默认的链接跳转行为;  
`<Link>` 的“跳转”行为只会触发相匹配的`<Route>`对应的页面内容更新，而不会刷新整个页面。

`<Link>`做了 3 件事情:

1. 有 onclick 那就执行 onclick
2. click 的时候阻止 a 标签默认事件
3. 根据跳转 href(即是 to)，用 history (web 前端路由两种方式之一，history & hash)跳转，此时只是链接变了，并没有刷新页面

## 对 Redux 的理解，主要解决什么问题

Redux 提供了一个叫 store 的统一仓储库，组件通过 dispatch 将 state 直接传入 store，不用通过其他的组件。并且组件通过 subscribe（订阅） 从 store 获取到 state 的改变。

## Redux 和 Vuex 有什么区别，它们的共同思想

vuex 弱化 dispatch，通过 commit 进行 store 状态的一次更变；取消了 action 概念，不必传入特定的 action 形式进行指定变更；弱化 reducer，基于 commit 参数直接对数据进行转变，使得框架更加简易;

共同思想：单—的数据源、变化可以预测

## Redux 中间件是怎么拿到 store 和 action? 然后怎么处理?

函数柯里化（Currying）‌ 是一种将接受多个参数的函数变换成接受一个单一参数的函数的技术。  
最初，函数接收第一个参数，然后返回一个新的函数，这个新函数再接收下一个参数，依此类推，直到所有参数都被接收，函数才会执行并返回最终结果

redux 中间件本质就是一个函数柯里化。redux applyMiddlewareApi 源码中每个 middleware 接受 2 个参数（Store 的 getState 函数和 dispatch 函数，分别获得 store 和 action）最终返回一个函数。
该函数会被传入 next 的下一个 middleware 的 dispatch 方法，并返回一个接收 action 的新函数，
这个函数可以直接调用 next（action），或者在其他需要的时刻调用，甚至根本不去调用它。
调用链中最后一个 middleware 会接受真实的 store 的 dispatch 方法作为 next 参数，并借此结束调用链。
所以，middleware 的函数签名是（{ getState，dispatch }）=> next => action。

## React Hooks 解决了哪些问题？

1. 在组件之间复用状态逻辑很难
2. 复杂组件变得难以理解
3. 难以理解的 class

## React Hook 的使用限制有哪些？

- 在 React 的函数组件中调用 Hook;
- 不要在循环、条件或嵌套函数中调用 Hook;
  1. 加载编译时会组成 3 部分；所有的 value 一个数组，所有 use 一个数组，还有一个光标指针；
  2. 初次加载，把遇到的所有的 value 推进 state 数组中，遇到的所有 use 推进 set 数组中，光标指针从 0 开始每次加一；
  3. 状态变化，二次加载，光标指针从 0 开始，遇到 use 光标指针加一，对应从 2 数组拿 value 和 use；假如遇到 if （少/多）了一个 use,后续拿到的 value 和 use 就不对应；

## React diff 算法的原理是什么

diff 算法探讨的就是虚拟 DOM 树发生变化后，生成 DOM 树更新补丁的方式。它通过对比新旧两株虚拟 DOM 树的变更差异，将更新补丁作用于真实 DOM，以最小成本完成视图更新;

- 具体的流程如下：

1. 真实的 DOM 首先会映射为虚拟 DOM；
2. 当虚拟 DOM 发生变化后，就会根据差距计算生成 patch，这个 patch 是一个结构化的数据，内容包含了增加、更新、移除等；
3. 根据 patch 去更新真实的 DOM，反馈到用户的界面上。

- diff 算法可以总结为三个策略，分别从树、组件及元素三个层面进行复杂度的优化：

1. 忽略节点跨层级操作场景，提升比对效率。（基于树进行对比）;

   需要进行树比对，即对树进行分层比较。两棵树只对同一层次的节点进行比较，如果发现节点已经不存在了，则该节点及其子节点会被完全删除掉，不会用于进一步的比较，这就提升了比对效率

2. 如果组件的 class 一致，则默认为相似的树结构，否则默认为不同的树结构。（基于组件进行对比）
   - 如果组件是同一类型则进行树比对；
   - 如果不是则直接放入补丁中。
   - 只 要 父 组 件 类 型 不 同 ， 就 会 被 重 新渲染。这也就是为什么 shouldComponentUpdate、PureComponent 及 React.memo 可以提高性能的原因。
3. 同一层级的子节点，可以通过标记 key 的方式进行列表对比。（基于节点进行对比）

   - 元素比对主要发生在同层级中，通过标记节点操作生成补丁。节点操作包含了插入、移动、删除等。
   - 其中节点重新排序同时涉及插入、移动、删除三个操作，所以效率消耗最大，此时策略三起到了至关重要的作用。通过标记 key 的方式，React 可以直接移动 DOM 节点，降低内耗。

4. 自 React 16 起，引入了 Fiber 架构。为了使整个更新过程可随时暂停恢复，节点与树分别采用了 FiberNode 与 FiberTree 进行重构。
   fiberNode 使用了双链表的结构，可以直接找到兄弟节点与子节点。
   整个更新过程由 current 与 workInProgress 两株树双缓冲完成。workInProgress 更新完成后，再通过修改 current 相关指针指向新节点。

## React key 是干嘛用的 为什么要加？key 主要是解决哪一类问题的

Keys 是 React 用于追踪哪些列表中元素被修改、被添加或者被移除的辅助标识。要保证 key 在其同级元素中具有唯一性

vue3 没有乏时间切片能力（收益不高）；除了高频动画，都可以用用防抖和节流去提高

## react 最新版本解决了什么问题，增加了哪些东西

React 16.x 的三大新特性 Time Slicingg、Suspense、hooks
Time Slicingg: 解决 CPU 速度问题;
Suspense:（解决网络 IO 问题）和 lazy 配合，实现异步加载组件;
提供了一个内置函数 componentDidCatch，当有错误发生时,捕获；

- useRef：
- useState：
- useEffect：在渲染结束之后执行；
- useLayoutEffect：在 DOM 更新之后执行；永远比 useEffect 先执行，这是因为 DOM 更新之后，渲染才结束；

- useCallback：缓存的是函数，有些函数没必要跟这 state 变化；
- useMemo：缓存的结果是回调函数中 return 回来的“值”，主要用于缓存计算结果的；
- useImperativeMethods：用于自定义暴露给父组件的实例值；
- createContext/useContext：是让“后代组件”之间共享“祖代组件”的状态；

## 为什么使用 jsx 的组件中没有看到使用 react 却需要引入 react？

JSX 是 React.createElement(component,props, ...children)方法的语法糖。
在 React 17 之后，就不再需要引入，因为 babel 已经可以帮我们自动引入 react。

## Redux 中间件是什么？接受几个参数？柯里化函数两端的参数具体是什么

Redux 的中间件提供的是位于 action 被发起之后，到达 reducer 之前的扩展点；换而言之，原本 view -→> action -> reducer->store 的数据流加上中间件后变成了 view -> action -> middleware-> reducer -> store ，在这一环节可以做一些"副作用"的操作，如异步请求、打印日志等

柯里化函数两端一个是 middewares，一个是 store.dispatch

## Next.js -- 服务端渲染
