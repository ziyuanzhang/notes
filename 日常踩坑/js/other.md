#

## JS DOMNodeInserted，DOMNodeRemoved 和监听内容变化插件

DOMNodeInserted，DOMNodeRemoved
今天想对某个 div 的变化做监听，发现了这两个方法，还是很好使的。
具体从字面就能看出其意义，但是有个地方需要注意，这个方法的调用时机在 jQuery 的对 dom 操作之前执行。

```code
ulObj.bind('DOMNodeInserted', function(e) {  
  var obj = jQuery(e.target);  
  if (obj.hasClass("rhHome__item")) {  
      fixHomeUlHei();  
  }  
});  
```

```code
ulObj.bind('DOMNodeRemoved', function(e) {  
  var obj = jQuery(e.target);  
  if (obj.hasClass("rhHome__item")) {  
      fixHomeUlHei();  
  }  
});  
```

## 对象冻结：Object.freeze

## ipad body 点击没反应

body{cursor:pointer}

## 禁止鼠标滚轮 ---- 页面滚动时禁止滚动操作

- PC 端：

  1. 禁止鼠标滚轮
     `window.onmousewheel = document.onmousewheel = function () {return false;};`
  2. 解禁鼠标滚轮
     `window.onmousewheel = document.onmousewheel = function () {return true;};`

- 手机端：

```code
var jz=0;//全局
$(".nav_click").click(function(){
    t++;
    var jz=t%2;
    if (document.addEventListener){
          document.removeEventListener("touchmove", fun, false);
    } else{
         document.addEventListener("touchmove",fun,false);
    }
});

function fun(){
  if(jz!=0){
    e.preventDefault();
    e.stopPropagation();
   }
}
```

## JS+H5 新标签 classList。删除添加 class

经常要兼容不得不用老方法，总要还下新方法来尝试的
直接上代码：

```code
  window.onload = function() {
      var abox = document.querySelectorAll(".sub");
      for (var i = 0; i < abox.length; i++) {
          abox[i].onclick = function() {
              for (var i = 0; i < abox.length; i++) {
                  abox[i].classList.remove('active')
              }
              this.classList.add("active");
          }
1     }
1 }
```

- 简单说明：

1. div.classList.add("active");
2. div.classList.remove("active");
3. div.classList.length 有几个 class 名字
4. div.classList.item[0] 获取下标
5. div.classList.contains("class 名") 查看是否存在这个名字 存在是 true 不存在是 false

如果存在就移除：

```code
var x = document.getElementById("myDIV");
if (x.classList.contains("mystyle")) {
    x.classList.remove("anotherClass");
} else {
    alert("Could not find it.");
}
```
