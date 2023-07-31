# css 问答

## transition 动画

```code
div{
    width:100px;
    height:100px;
    background:blue;
    transition:width 2s;
}

div:hover
{
   width:300px;
}

```

## animation 动画

| animation: | myFirst  | 5s       | linear   | 2s       | infinite | alternate        |
| :--------- | :------- | :------- | :------- | :------- | :------- | :--------------- |
|            | 动画名字 | 花费时间 | 速度曲线 | 何时开始 | 播放次数 | 下一周期逆向播放 |

```code
div
{
     animation: myFirst 5s linear 2s infinite alternate；
}

@keyframes myFirst
{
     0%   {background: red; left:0px; }
     50%  {background: blue; left:200px; }
     100% {background: red; left:0px; }
}

```

## 盒子模型:包括  margin、border、padding、content

1. 标准 content:  部分不包含其他部分;
2. IE content:  部分包含 border  和  padding

## visibility:hidden -- 占位，但不可点击（click 事件没用）

## css 清除浮动 / 高度塌陷：（子元素脱离文档流）

1. 给父元素设置固定高度（不可取）
2. 父级添加 overflow: hidden；
3. 浮动元素后面添加一个块级元素并且 clear: both；
4. 父元素 添加：after 伪类；

   - 单伪元素 after 清除浮动

   ```code
   .cc:after {
             display: block;
             content: '';
             height: 0;
             line-height: 0;
             visibility: hidden;
             clear: both;
           }
   ```

   - 使用双伪类；

   ```code
   .cc:after,.cc:before {
               content: "";
               display: block;
               clear: both;
           }
   ```

## 圣杯与双飞翼布局：5 种

1. flex 布局;
2. css grid;
3. css calc;
4. 浮动;

   ```code
   <body>
       <header>header</header>
       <div class="container">
           <div class="middle">middle</div>
           <div class="left">left</div>
           <div class="right">right</div>
       </div>
       <footer>footer</footer>
   </body>
   <style>
       header,
       footer {
           height: 100px;
           width: 100%;
           background-color: antiquewhite;
       }
   .container {
           height: 200px;
           padding-left: 200px;
           padding-right: 300px;
       }
   .container>div {
           float: left;
           height: 100%;
           position: relative;
       }
   .left {
           width: 200px;
           height: 200px;
           background-color: burlywood;
           margin-left: -100%;
           left: -200px;
       }
   .right {
           width: 300px;
           height: 200px;
           background-color: burlywood;
           margin-left: -300px;
           right: -300px;
       }
   .middle {
           width: 100%;
           height: 200px;
           background-color: #b0f9c2;
       }
   </style>
   ```

5.

```code
<body>
    <header>header</header>
    <div class="container">
        <div class="middle">
            <div class="main">middle</div>
        </div>
        <div class="left">left</div>
        <div class="right">right</div>
    </div>
    <footer>footer</footer>
</body>
<style>
    header,
    footer {
        height: 100px;
        width: 100%;
        background-color: antiquewhite;
    }
    .container {
        width: 100%;
        height: 200px;
    }
    .container>div {
        float: left;
        height: 200px;
    }
    .left {
        width: 200px;
        background-color: burlywood;
        margin-left: -100%;
    }
    .right {
        width: 300px;
        background-color: burlywood;
        margin-left: -300px;
    }
    .middle {
        width: 100%;
        background-color: #b0f9c2;
    }
    .main {
        margin: 0 300px 0 200px;
    }
</style>
```
