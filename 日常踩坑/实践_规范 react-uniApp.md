# 规范 react-uniApp

## react

1. 接口地址基础：REACT_APP_BASE_URL;
2. 文件地址：REACT_APP_file_URL;
3. 采用  react  的函数式编写，不要用  class  类；
4. react-redux:做状态管理，用  useDispatch、useSelector  替代  connect；
5. 禁止用第三方  UI  库；
6. 组件、页面   的最外层样式加一个限定：例如  xxx-component / xxx-page
7. 公用组件  css  用  module  引用
8. 禁止用  table  标签

## uniApp

## 结构说明

```code
   components ------- 组件
   pages ----------- 主包
      |-- index : 首页模块
      |-- multiEntry : 多入口页面
   static ----------
      |---iconfont : 图标字体
      |---img : 图片(不要直接用，放在阿里云了)
   store ----------- vuex
   utils ----------- 工具函数

   pages.json ------ 路由
```

## 变量命名规范

1. 数组变量-后缀用 List/Arr，例如 tagList / tagArr
2. 对象变量-后缀用 Obj，例如 tagObj
3. 布尔变量-前缀用 is/show 等形容词，例如 isTag / showTag

## 自定义组件命名

1. 自定义组件命名

   - vCommon-add.vue ----- 公用组件
   - vMy-addTag-add.vue ----单独组件
   - v-tabs -----基础组件

   ```code
     其中
     My:模块名(首页、人脉、好友、消息、个人中心)
     addTag:页面名字
     delete.vue:组件名字
   ```

2. 下载插件直接用默认的名字（不改）

## 关于图片放服务器加载 500 问题

1. css 中 background-image: url($uni-img-baseUrl+'/static/img/my/my-up-bg.png');

   $uni-img-baseUrl :定义在 uni.scss 中

2. css 行内背景图

```code
<view :style="myUpBg">
   computed:{
      myUpBg(){
         return {
            'background-image':`url(${this.$imgBaseUrl}/static/img/my/my-up-bg.png)`
         }
      }
   }

```

1. img 中

```code
<image class="img" :src="realNameIcon" mode="" >
   computed:{
   realNameIcon(){
      return ${this.$imgBaseUrl}/static/img/common/realName-icon.png
   }
}
```
