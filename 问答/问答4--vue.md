# vue

1. Nginx + vue 的 history： try_files $uri $uri/ /blog/index.html;
2. Nginx + react 的 history：

```
1、nginx中：
  location /XXX/ {
        try_files $uri $uri/ /XXX/index.html;
        root /geelyapp/web/;
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

- 单页面初次加载过大：1.预渲染 2.单独渲染 3.服务端渲染 4.webpack 懒加载

- 单页面的优点：

  1. 用户体验好，快，内容的改变不需要重新加载整个页面，基于这一点 spa 对服务器压力较小
  2. 前后端分离
  3. 页面效果会比较炫酷（比如切换页面内容时的专场动画）

- 单页面缺点：
  1. 不利于 seo
  2. 导航不可用，如果一定要导航需要自行实现前进、后退。（由于是单页面不能用浏览器的前进后退功能，所以需要自己建立堆栈管理）
  3. 初次加载时耗时多
  4. 页面复杂度提高很多

## vue2

### 组件内部数据是观察者；自定义事件是发布订阅

- vue 双向数据绑定（MVVM）：通过（数据劫持）结合（观察者模式）来实现的
- MVVM：数据变化更新视图，视图变化更新数据

- 数据劫持：  利用 Object.defineProperty()  的  set/get 属性

- view 层--->data:  通过事件监听；
- data---->view 层：data 变化用 Object.defineProperty()劫持，通知观察者；
  1. 实现一个编译器 compiler，扫描和解析每个节点的指令，并根据初始化时的模板数据-》初始化相应的观察者。
  2. 劫持和监听所有 data 属性，如果有变动，就通知观察者。
  3. 观察者（watcher）收到属性变化的通知,执行相应的函数，从而更新视图。

### vue hash 和 history 原理

1. hash : `window.onhashchange` 事件,不会被包括在 HTTP 请求中，对后端完全没有影响，因此改变 hash 不会重新加载页面。
2. history : 切换和修改。
   - 切换历史状态包括 back、forward、go 三个方法
   - 修改历史状态包括了 `pushState(),replaceState()`,它们提供了对历史记录进行修改的功能。虽然改变了当前的 URL，但浏览器不会立即向后端发送请求。只是当它们执行修改时，才发请求。

### vue data 为什么是函数不是对象

每个组件都是 vue 的一个实例；组件内的 data 其实是 vue 原型上的属性;
如果是对象的话，在组件上修改 data 会互相影响的

### vue v-model

`<input  v-bind:value="mes"  v-on:input="mes= $event.target.value"/>`
指令，管道

### vue v-for 的 key: 与 diff 算法有关，相同的 key 直接复用

### vue 为什么不监听数组:Object.defineproperty 劫持的是对象属性

1. vue 不能监听"动态添加的属性"，这是数据劫持的一个缺陷，动态添加的属性只能手动调用 Vue.set 方法进行注册监听;
2. 数组的作用就是不断的增删数据，这就得不断的调用 set 方法，这必然是成本高于回报的事情

### vue watch 和 compute 的区别

- computed 擅长处理的场景：一个数据受多个数据影响
- watch 擅长处理的场景：一个数据影响多个数据

- watch 对象：
  1. deep: true 。监听对象； 注：数组不需要。
  2. immediate：true  将立即以表达式的当前值触发回调

### vue nextTick -- DOM 更新后调用 / vm.$forceUpdate---强制本组件和卡槽子组件更新

nextTick：分宏任务 和 微任务 （默认）
宏任务：setImmediate --》MessageChannel --》setTimeout (DOM 交互事件走宏任务，v-on@）
微任务：Promise --》宏任务

### VueRouter

1. 全局：前置 beforeEach ；后置 afterEach
2. 路由内 ：独享 beforeEnter；
3. 组件内：beforeRouteEnter，beforeRouteUpdate，beforeRouteLeave

### vue link 传值

1. query--hash 模式：路径 + 参数会显示在 url 中；刷新参数还在；类似于我们 ajax 中 get 传参
   `<router-link :to="{ path: 'register', query: { plan: 'private' }}">Register</router-link>`
2. params--history  模式  ：路径显示，参数不显示；刷新参数没有了；则类似于 post
   `<router-link :to="{ name: 'user', params: { userId: 123 }}">User</router-link>`

### 为什么要用 vuex

解决不同组件通信,

### vue 组件通信

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

### Vue.extend 与 Vue.component（都是创建组件） 区别：

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

### vue 组件--插件

- 组件（component）： 用来构成 App 的业务模块；

- 插件(plugin) ：用来增强技术栈的功能模块（是对 Vue 的功能的增强和补充）；
  1. 建立 toast.vue；
  2. 创建 toast.js （install ）
  3. main.js 中使用 Vue.use(ToastPlugin)
  4. this.$showToast ('标题', '提示内容')

### keep-alive ：include（组件 name，包括） ，exclude（排除）

### vue/react 的 data 区别

- vue 总结：

  1. 当更新父组件 data 中的数据时，其自身组件更新，其子组件（无限递归）不会更新
  2. 更新某个组件 data 中的数据时，其兄弟组件不更新
  3. 当更新子组件 data 中的数据时，父组件不更新
  4. 当更新父组件传递给子组件的 props 变化时，子组件（第一级子组件）更新。
     注：这些测试都是数据在 html 中被使用的前提下，如果数据在 html 中未使用，update 不会更新。

- react 总结：

  1. 当更新父组件 state 中的数据时，其自身组件及所有子组件（无限递归）都会更新
  2. 更新某个组件，其兄弟组件不更新
  3. 当更新子组件，父组件不更新

### vue/react 的 diff 算法比较

- 不同点：
  vue: 1. 元素相同，key 相同，属性不同 --- 认为节点不同，删除重建； 2. 新旧 virtual DOM：两端到中间比较；
  react：1. 元素相同，key 相同，属性不同---认为节点相同，修改属性； 2. 新旧 virtual DOM：从左向右比较；

- 相同点：都只同级比较；忽略跨级操作；

### 从 DOM 到虚拟 DOM：切图仔 --> JQuery --> 模板语法 -->虚拟 DOM

- 模板语法的流程：  数据->模板->真实 dom；
- 虚拟 DOM 的流程：数据->模版/算法/语法糖->虚拟 dom->一系列 js 操作->真实 dom；
- 虚拟 DOM 是作为数据和真实 DOM 之间的缓冲层诞生的；
- 虚拟 DOM 具有：1.差量更新（diff 算法）2. 批量更新（用户在短时间内对 dom 进行高频操作时，取最后一次的操作结果）
-
- 在数据量少的情况下，两者性能相差无几。
- 数据量多的情况下，若是数据改变大，接近于全页面更新，模版语法性能更好。
- 在局部更新为主的环境下，虚拟 DOM 的性能更好
