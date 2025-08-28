# 如何解决 inline-block 元素的空白间距

1. 纯 CSS

   ```html
   <ul class="removeTextNodes">
     <li>item1</li>
     <li>item2</li>
     <li>item3</li>
     <li>item4</li>
     <li>item5</li>
   </ul>
   ```

   更新：全兼容的样式解决方法
   经过高人指点，使用纯 CSS 还是找到了兼容的方法，就是在父元素中设置 font-size:0,用来兼容 chrome，而使用 letter-space:-N px 来兼容 safari:

   ```css
   .removeTextNodes {
     letter-spacing: -4px; //根据不同字体字号或许需要做一定的调整
     word-spacing: -4px;
     font-size: 0;
   }
   .removeTextNodesli {
     font-size: 16px;
     letter-spacing: normal;
     word-spacing: normal;
     display: inline-block;
     *display: inline;
     zoom: 1;
   }
   ```

2. jquery 方法

```js
$(".removeTextNodes")
  .contents()
  .filter(function () {
    returnthis.nodeType === 3;
  })
  .remove();
```
