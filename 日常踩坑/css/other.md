# 综合

## 图片盖住父容器边框

给父容器设置 margin-top

## 锚点跳转位置上下偏移方法

```css
.target {
  padding-top: 50px;
  margin-top: -50px;
}
```

## margin 和 padding 百分比问题

1. margin 和 padding 都可以使用百分比值的，但有一点可能和通常的想法不同，

   就是 margin-top | margin-bottom | padding-top | padding-bottom 的百分比值参照的不是容器的高度，而是宽度。

2. background-size:cover;

## 解决 inline-block 元素的空白间距、img 有间距问题

使用纯 CSS 就是在父元素中设置 font-size:0,用来兼容 chrome，而使用 letter-space:-N px 来兼容 safari:

```css
ul {
  letter-spacing: -4px; //根据不同字体字号或许需要做一定的调整
  word-spacing: -4px;
  font-size: 0;
}
li {
  font-size: 16px;
  letter-spacing: normal;
  word-spacing: normal;
  display: inline-block;
  *display: inline;
  zoom: 1;
}
```

## px、em、rem

1. px 像素（Pixel）：相对长度单位。像素 px 是相对于显示器屏幕分辨率而言的。
2. em 是相对长度单位。相对于当前对象内文本的字体尺寸。如当前对行内文本的字体尺寸未被人为设置，则相对于浏览器的默认字体尺寸。
3. rem 是 CSS3 新增的一个相对单位（root em，根 em）;rem 是 CSS3 新增的一个相对单位（root em，根 em）

## css 选择器 first-child 与 first-of-type 的区别
