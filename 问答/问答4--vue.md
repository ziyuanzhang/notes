# vue

## vue/react + nginx 配置

1. Nginx + vue 的 history： try_files $uri $uri/ /blog/index.html;
2. Nginx + react 的 history：

```
1、nginx中：
  location /XXX/ {
        try_files $uri $uri/ /XXX/index.html;
        root /html/;
        index index.html;
  }

2、路由添加 basename:
      * "/XXX" ---【<Link to="/" />; // results in <a href="/app" />】
      * "/XXX/"---【<Link to="/" />; // results in <a href="/app/" />】

3、打包后的js/css路径【base】
   * vite.config.ts中 base:"/helper/";
   * package.json 中  "build:staging": "tsc && vite build --base=/helper/ --mode staging",
   注：package.json 中的--base=/helper/ 会覆盖vite.config.ts中的base
```

## 单页面的优缺点

- 单页面初次加载过大：1.预渲染 2.单独渲染 3.服务端渲染 4.webpack 懒加载

- 单页面的优点：

  1. 对服务器压力较小
  2. 前后端分离
  3. 低耦合
  4. 可重用性
  5. 独立开发
  6. 可测试

- 单页面缺点：
  1. 不利于 seo
  2. 初次加载时耗时多
  3. 页面复杂度提高很多

* vue 如何优化首页的加载速度？vue 首页白屏是什么问题引起的？如何解决呢？

  - 首页白屏的原因：

    单页面应用的 html 是靠 js 生成，因为首屏需要加载很大的 js 文件(
    的时候会产生一定程度的白屏

  - 解决办法：
    1. 将公用的 JS 库通过 script 标签外部引入，减小 app.bundle 的大小，让浏览器并行下载资源文件，提高下载速度；
    2. 在配置路由时，页面和组件使用懒加载的方式引入，进一步缩小 app.bundle 的体积，在调用某个组件时再加载对应的 js 文件；
    3. 上骨架屏或 loading 动画，提升用户体验；
    4. 合理使用 web worker 优化一些计算
    5. 缓存一定要使用，但是请注意合理使用
    6. 最后可以借助一些工具进行性能评测，重点调优，例如 chrome 开发者工具的 performance 或 Google PageSpeed Insights 插件协助测试

## vue/react 的 diff 算法比较

- 不同点：  
   vue: 1. 元素相同，key 相同，属性不同 --- 认为节点不同，删除重建； 2. 新旧 virtual DOM：两端到中间比较；  
   react：1. 元素相同，key 相同，属性不同---认为节点相同，修改属性； 2. 新旧 virtual DOM：从左向右比较；

- 相同点：都只同级比较；忽略跨级操作；

- 模板语法的流程：  数据->模板->真实 dom；
- 虚拟 DOM 的流程：数据->模版/算法/语法糖->虚拟 dom->一系列 js 操作->真实 dom；
- 虚拟 DOM 是作为数据和真实 DOM 之间的缓冲层诞生的；
- 虚拟 DOM 具有：1.差量更新（diff 算法）2. 批量更新（用户在短时间内对 dom 进行高频操作时，取最后一次的操作结果）

- 在数据量少的情况下，两者性能相差无几。
- 数据量多的情况下，若是数据改变大，接近于全页面更新，模版语法性能更好。
- 在局部更新为主的环境下，虚拟 DOM 的性能更好

## Vue2.0 和 Vue3.0 有什么区别

1. 重构响应式系统，使用 Proxy 替换 Object.defineProperty，使用 Proxy 优势：

   - 可直接监听数组类型的数据变化；
   - 监听的目标为对象本身，不需要像 Object.defineProperty 一样遍历每个属性，有一定的性能提升；
   - 可拦截 apply、ownKeys、has 等 13 种方法，而 Object.defineProperty 不行；
   - 直接实现对象属性的新增/删除；

2. 新增 Composition API，更好的逻辑复用和代码组织；
3. 重构 Virtual DOM；

   - 模板编译时的优化，将一些静态节点编译成常量；
   - slot 优化，将 slot 编译为 lazy 函数，将 slot 的渲染的决定权交给子组件；
   - 模板中内联事件的提取并重用（原本每次渲染都重新生成内联函数）；

4. 代码结构调整，更便于 Tree shaking，使得体积更小；
5. 使用 Typescript 替换 Flow；

## Vue 的基本原理

当 一 个 Vue 实 例 创 建 时 ， Vue 会 遍历 data 中的属性，用 Object.defineProperty （ vue3.0 使 用 proxy ）将它们转为 getter/setter，并且在内部追踪相关依赖，在属性被访问和修改时通知变化。  
每个组件实例都有相应的 watcher 程序实例，它会在组件渲染的过程中把属性记录为依赖，之后当依赖项的 setter 被调用时，会通知 watcher 重新计算，从而致使它关联的组件得以更新。

## 双向数据绑定的原理

首先要对数据进行劫持监听，所以我们需要设置一个监听器 Observer，用来监听所有属性。如果属性发上变化了，就需要告诉订阅者 Watcher 看是否需要更新。因为订阅者是有很多个，所以我们需要有一个消息订阅器 Dep 来专门收集这些订阅者，然后在监听器 Observer 和订阅者 Watcher 之间进行统一管理的。接着，我们还需要有一个指令解析器 Compile，对每个节点元素进行扫描和解析，将相关指令对应初始化成一个订阅者 Watcher，并替换模板数据或者绑定相应的函数，此时当订阅者 Watcher 接收到相应属性的变化，就会执行对应的更新函数，从而更新视图。因此接下去我们执行以下 3 个步骤，实现数据的双向绑定：

1.实现一个监听器 Observer，用来劫持并监听所有属性，如果有变动的，就通知订阅者。

2.实现一个订阅者 Watcher，可以收到属性的变化通知并执行相应的函数，从而更新视图。

3.实现一个解析器 Compile，可以扫描和解析每个节点的相关指令，并根据初始化模板数据以及初始化相应的订阅器。

![双向绑定](./img/vue/vue双向绑定.png)

发布-订阅模式

- 数据劫持：当 Vue 实例创建时，会递归遍历初始化的数据对象（data 对象），利用 Object.defineProperty()方法将所有属性转换为 getter/setter。这个过程被称为数据劫持或数据代理。通过这种机制，Vue 能够追踪到数据的变化，并在变化发生时触发相应的回调。
- 订阅器 Dep：Dep 类负责维护订阅者列表，并提供一个方法来通知所有的订阅者更新。每当数据发生变化时，都会通过 setter 触发 Dep 实例中的 notify 方法，从而通知所有订阅者更新视图。

观察者模式

- Watcher 类：负责更新视图。当一个属性被访问时，会创建一个 Watcher 实例，这个实例会自动订阅相关联的 Dep。当数据发生变化时，Dep 将通知所有相关的 Watcher 进行更新。
- 视图更新：Vue 使用模板编译策略来解析模板字符串中的表达式。当模板被编译时，Vue 会识别出绑定表达式并创建 Watcher 实例来监听这些表达式的依赖。当数据发生变化时，Vue 的响应系统会触发视图的更新，这个过程通常是通过重新渲染组件来实现的。

双向数据绑定流程

1. 数据劫持：Vue 在初始化时会对 data 中的数据进行劫持，将其转换为 getter/setter，以便在数据变化时能够捕获到变化。
2. 模板编译：Vue 会对模板进行编译，找到其中动态绑定的数据，并初始化视图。同时，为每个数据绑定创建一个 Watcher 实例，并将其添加到对应的 Dep 中。
3. 数据变化通知：当数据发生变化时，会触发 setter 方法，进而调用 Dep 的 notify 方法通知所有相关的 Watcher 进行更新。
4. 视图更新：Watcher 在收到更新通知后，会调用相应的更新函数来更新视图。

## MVVM、MVC、MVP 的区别

- MVC 通过分离 Model、View 和 Controller 的方式来组织代码结构。

  1. View 负责页面的显示逻辑；
  2. Model 负责存储页面的业务数据，以及对相应数据的操作；并且 View 和 Model 应用了观察者模式，当 Model 层发生改变的时候它会通知有关 View 层更新页面。
  3. Controller 层是 View 层和 Model 层的纽带，它主要负责用户与应用的响应操作，当用户与页面产生交互的时候，Controller 中的事件触发器就开始工作了，通过调用 Model 层，来完成对 Model 的修改，然后 Model 层再去通知 View 层更新；

* MVVM 分为 Model、View、ViewModel：
  1. Model 代表数据模型，数据和业务逻辑都在 Model 层中定义；
  2. View 代表 UI 视图，负责数据的展示；
  3. ViewModel 负责监听 Model 中数据的改变并且控制视图的更新，处理用户交互操作；
  4. Model 和 View 并无直接关联，而是通过 ViewModel 来进行联系的，
  5. 这种模式实现了 Model 和 View 的数据自动同步，因此开发者只需要专注于数据的维护操作即可，而不需要自己操作 DOM。

## Vue 的生命周期

- 创建期间：

  1. beforeCreate: 组件实例初始化完成并且 props 被解析后立即调用；

     - 此时还没有初始化 data、methods

  2. created: 组件实例处理完所有与状态相关的选项后调用；

     - 此时 响应式数据（data）、计算属性、方法（methods）和侦听器 已经创建 OK；
     - 还没有开始编译模板；
     - 还没挂载，$el 属性不可用；

  3. beforeMount: 在组件被挂载之前调用；

     - 组件已经完成了其响应式状态的设置（模板编译完成）；
     - 但还没有创建 DOM 节点，即将首次执行 DOM 渲染过程。
     - 此时页面中，类似 {{msg}} 这样的语法还没有被替换成真正的数据。

  4. mounted：在组件被挂载之后调用；

     - 所有同步子组件都已经被挂载。(不包含异步组件或 <Suspense> 树内的组件)；
     - 其自身的 DOM 树已经创建完成并插入了父容器中
     - 用户已经可以看到渲染好的页面了，可以获取 DOM 节点；

- 运行期间：

  1. beforeUpdate: 组件更新之前执行此函数；

     - 此时 data 中的状态值是最新的；但是界面上显示的 数据还是旧的，因为此时还没有开始重新渲染 DOM 节点

  2. updated: ：组件更新完毕之后调用此函数;

     - 此时 data 中的状态值 和 界面上显示的数据 都已经完成了更新，界面已经被重新渲染好了

- 销毁期间：

  1. beforeDestroy（vue2）/beforeUnmount（vue3）： 组件实例被卸载之前调用。（在这一步，实例仍然完全可用）

  2. destroyed（vue2）/unmounted（vue3）: 组件实例被卸载后调用；
     - 其所有子组件都已经被卸载。
     - 所有相关的响应式作用都已经停止。
     - 可以在这个钩子中手动清理一些副作用，例如计时器、DOM 事件监听器或者与服务器的连接。

## Vue 的父组件和子组件生命周期钩子执行顺序是什么

1. 加载渲染过程

   父 beforeCreate->父 created->父 beforeMount->子 beforeCreate->子 created->子 beforeMount->子 mounted->父 mounted

1. 子组件更新过程

   父 beforeUpdate->子 beforeUpdate->子 updated->父 updated

1. 父组件更新过程

   父 beforeUpdate->父 updated

1. 销毁过程

   父 beforeDestroy->子 beforeDestroy->子 destroyed->父 destroyed

总结：从外到内，再从内到外

## Vue 中父组件如何监听子组件的生命周期？

在子组件中的各个生命周期$emit 事件

## js 实现简单的双向绑定

```
<body>
    <div id="app">
        <input type="text" id="txt">
        <p id="show"></p>
        <button>click</button>
    </div>
    <script>
        window.onload = function () {
            var obj = {};
            Object.defineProperty(obj, "txt", {
                get: function () {
                    return obj;
                },
                set: function (newValue) {
                    document.getElementById("txt").value = newValue;
                    document.getElementById("show").innerHTML = newValue;
                }
            })
            document.addEventListener("keyup", function (e) {
                obj.txt = e.target.value;
            })
            document.querySelector("button").addEventListener("click", function () {
                obj.txt = "btn"
            })

        }
    </script>
</body>
```

## vue 为什么不监听数组: Object.defineproperty 劫持的是对象属性

1. vue 不能监听"动态添加的属性"，这是数据劫持的一个缺陷，动态添加的属性只能手动调用 Vue.set 方法进行注册监听;
2. 数组的作用就是不断的增删数据，这就得不断的调用 set 方法，这必然是成本高于回报的事情

## vue data 为什么是函数不是对象

每个组件都是 vue 的一个实例；组件内的 data 其实是 vue 原型上的属性;
如果是对象的话，在组件上修改 data 会互相影响的

## filter 过滤器--纯函数

1. filter 中的 this 是什么？

   this 是 undefined，在 filter 中拿不到 vue 实例。

   如果需要用到 this，可以用 computed 或者 method 代替。

## vue watch 和 compute 的区别

- watch 是监听动作，computed 是计算属性
- watch 没缓存，只要数据变化就执行。computed 有缓存，只在属性变化的时候才去计算。
- watch 可以执行异步操作，而 computed 不能
- watch 擅长处理：一个数据影响多个数据，computed 则擅长处理多个数据影响一个数据

* watch 对象：
  1. deep: true 。监听对象； 注：数组不需要。
  2. immediate：true  将立即以表达式的当前值触发回调

## vue v-model

`<input  v-bind:value="mes"  v-on:input="mes= $event.target.value"/>`
指令，管道

## vue v-for 的 key: 与 diff 算法有关，相同的 key 直接复用

避免将 v-if 和 v-for 放在同一个元素上，因为 v-for 优先级比 v-if 更高。

## keep-alive ：include（组件 name，包括） ，exclude（排除）

## vue nextTick -- DOM 更新后调用 / vm.$forceUpdate---强制本组件和卡槽子组件更新

- nextTick：分宏任务 和 微任务 （默认）
- 宏任务：setImmediate --》MessageChannel --》setTimeout (DOM 交互事件走宏任务，v-on@)
- 微任务：Promise --》宏任务

## vue 组件通信

1.vuex； 2.vue.prototype； 3.props/emit； 4.卡槽； 5.自定义事件；6.provide - inject

- 自定义事件：

  1. import Vue from 'vue'
     export const EventBus = new Vue()
     Vue.prototype.$EventBus = new Vue()

  2. EventBus.$emit("aMsg", '来自 A 页面的消息');

  3. EventBus.$on("aMsg", (msg) => {
             // A发送来的消息
                this.msg = msg;
           });
    EventBus.$off('aMsg', {})

## Vue.extend 与 Vue.component（都是创建组件） 区别：

1. let mv = new Vue({}) mv 是 vue 实例
2. 没有组件名字

   ```code
   var myVue = Vue.extend(这里可以是一个.vue 单文件组件，也可以是一个包含组件选项的对象)
   var vm = new myVue({
   //其他选项
   })
   new vm().$mount('#mount-point') 或 document.body.appendChild(vm.$mount().$el);
   ```

3. 有组件名字；

   - 注册组件，传入一个扩展过的构造器
     `Vue.component('my-component', Vue.extend({ /* ... */ }))`
   - 注册组件，传入一个选项对象 (自动调用 Vue.extend)
     `Vue.component('my-component', { /* ... */ })`
   - 获取注册的组件 (始终返回构造器)
     `var MyComponent = Vue.component('my-component')`

## vue 组件--插件

- 组件（component）： 用来构成 App 的业务模块；

- 插件(plugin) ：用来增强技术栈的功能模块（是对 Vue 的功能的增强和补充）；
  1. 建立 toast.vue；
  2. 创建 toast.js （install ）
  3. main.js 中使用 Vue.use(ToastPlugin)
  4. this.$showToast ('标题', '提示内容')

## VueRouter-路由守卫

1. 全局：前置 beforeEach ；后置 afterEach（没有 next）；beforeResolve
2. 路由内 ：独享 beforeEnter；
3. 组件内：beforeRouteEnter（唯一 next 有回调），beforeRouteUpdate，beforeRouteLeave

## vue hash 和 history 原理

1. hash : `window.onhashchange` 事件,不会被包括在 HTTP 请求中，对后端完全没有影响，因此改变 hash 不会重新加载页面。
2. history : 切换和修改。
   - 切换历史状态包括 back、forward、go 三个方法
   - 修改历史状态包括了 `pushState(),replaceState()`,它们提供了对历史记录进行修改的功能。虽然改变了当前的 URL，但浏览器不会立即向后端发送请求。只是当它们执行修改时，才发请求。

## vue link 传值

1. query--hash 模式：路径 + 参数会显示在 url 中；刷新参数还在；类似于我们 ajax 中 get 传参
   `<router-link :to="{ path: 'register', query: { plan: 'private' }}">Register</router-link>`
2. params--history  模式  ：路径显示，参数不显示；刷新参数没有了；则类似于 post
   `<router-link :to="{ name: 'user', params: { userId: 123 }}">User</router-link>`

## 完整的 Vue 路由生命周期

1. 导航被触发。
2. 在失活的组件里调用离开守卫。
3. 调用全局的 beforeEach 守卫。
4. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
5. 在路由配置里调用 beforeEnter 。
6. 解析异步路由组件。
7. 在被激活的组件里调用 beforeRouteEnter 。
8. 调用全局的 beforeResolve 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 afterEach 钩子。
11. 触发 DOM 更新。
12. 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。

## Vuex

## 为什么要用 vuex

解决不同组件通信,

## Vuex 是通过什么方式提供响应式数据的？

在 Store 构造函数中通过 new Vue({}) 实现的。利用 Vue 来监听 state 下的数据变化，给状态添加 getter、setter。

vuex 中的 store 本质就是没有 template 的隐藏着的 vue 组件。

## Vuex 如何区分 state 是外部直接修改，还是通过 mutation 方法修改的？

在 Vuex 中通过 执行 commit('xx', payload) 方法来修改 state;

- commit，其底层通过执行 this.withCommit(fn) 设置 committing 标志变量为 true，然后才能修改 state，修改完毕还需要还原 committing 变量。
- 外部修改虽然能够直接修改 state，但是并没有修改 committing 标志位;
- 以只要 watch 一下 state，state change 时判断是否\_committing 值为 true，即可判断修改的合法性。

## 当执行 import vue from "vue" 时发生了什么？

- 其实在 nodejs 中，执行 import 就相当于执行了 require ；
  1.  `import Vue from 'vue'` 解析为 `const Vue = require('vue')`
- node 中维护了一组路径查找顺序；

  1. 是否 node 核心包
  2. 是否为 '/' 开头；
  3. 是否为 './'、'/' 或者 '../' 开头；
  4. 以上条件都不符合，读取项目目录下 node_modules 包里的包（找到）。

- 那么问题来了，node_modules 下的 vue 是一个文件夹，而引入的 Vue 是一个 javascript 对象，那它是怎么取到这个对象呢？

  其实对于一个 npm 包，内部还有一个文件输出的规则，先看下 node_modules/vue 下的文件结构是怎么样的：

  ```
   ├── LICENSE
   ├── README.md
   ├── dist
   ├── package.json
   ├── src
   └── types
  ```

  其实对于 npm 包，require 的规则是这样的：

  1. 查找 package.json 下是否定义了 main 字段，是则读取 main 字段下定义的入口。
  2. 如果没有 package.json 文件，则读取文件夹下的 index.js 或者 index.node。
  3. 如果都 package.json、index.js、index.node 都找不到，抛出错误 module 'some-library' 。

  那么看一下 vue 的 package.json 文件有这么一句：

  ```
  {
     ...
     "main": "dist/vue.runtime.common.js",
     ...
   }
  ```

  到这里就很清晰了：

  ```
    import vue from 'vue';
    // 最后转换为
    const vue = require('./node_modules/vue/dist/vue.runtime.common.js');
  ```

  而 vue.runtime.common.js 文件的最后一行是：module.exports = Vue;，就正好跟我们平时使用时的 new Vue({}) 是一致的，这就是 import vue from 'vue' 的过程了。

## SSR 有了解吗？原理是什么？

在客户端请求服务器的时候，服务器到数据库中获取到相关的数据，并且在服务器内部将 Vue 组件渲染成 HTML，并且将数据、HTML 一并返回给客户端，这个在服务器将数据和组件转化为 HTML 的过程，叫做服务端渲染 SSR。

而当客户端拿到服务器渲染的 HTML 和数据之后，由于数据已经有了，客户端不需要再一次请求数据，而只需要将数据同步到组件或者 Vuex 内部即可。除了数据以外，HTML 也结构已经有了，客户端在渲染组件的时候，也只需要将 HTML 的 DOM 节点映射到 Virtual DOM 即可，不需要重新创建 DOM 节点，这个将数据和 HTML 同步的过程，又叫做客户端激活。

使用 SSR 的好处：

1. 有利于 SEO：
2. 白屏时间更短：
   服务端渲染在浏览器请求 URL 之后已经得到了一个带有数据的 HTML 文本，浏览器只需要解析 HTML，直接构建 DOM 树就可以。

## 从 DOM 到虚拟 DOM：切图仔 --> JQuery --> 模板语法 -->虚拟 DOM

## Nuxt.js -- 服务端渲染
