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
