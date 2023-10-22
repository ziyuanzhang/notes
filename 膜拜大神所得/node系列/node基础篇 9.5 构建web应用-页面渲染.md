# 构建 web 应用---页面渲染 (原文:深入浅出 Node.js)

## 内容响应

```
Content-Encoding: gzip
Content-Length: 21170
Content-Type: text/javascript; charset=utf-8
```

服务端告知客户端内容是以 gzip 编码的;其内容长度为 21170 个字节;内容类型为 JavaScript,字符集为 UTF-8;  
客户端在接收到这个报文后:正确的处理过程是通过 gzp 来解码报文休中的内容;用长度校验报文休内容是否正确;然后再以字符集 UT℉8 将解码后的脚本插入到文档节点中。

1. MIME--(Multipurpose Internet Mail Extensions,最早用于电子邮件，后来也应用到浏览器中)  
   不同的文件类型具有不同的 MME 值:如 JSON 文件的值为 application/,json、XML 文件的值为 application/xml、PDF 文件的值为 application/.pdf。

```社区有专有的mime模块可以用判段文件类型
var mime = require('mime');
mime.lookup('/path/to/file.txt');   // => 'text/plain'
mime.lookup('file.txt');   // => 'text/plain'
mime.lookup('.TXT');   // => 'text/plain'
mime.lookup('htm');   // => 'text/html'
```

除了 MME 值外，Content-Type 的值中还可以包含一些参数，如字符集。`Content-Type: text/javascript; charset=utf-8`

2. 附件下载  
   Content-Disposition: 客户端会根据它的值判断，是应该将报文数据当做即时浏览的内容，还是可下载的附件。

   - inline：内容只需即时查看；
   - attachment：数据可以存为附件；（Content-Disposition 字段还能通过参数指定保存时应该使用的文件名）

   ```
   res.sendfile = function (filepath) {
       fs.stat(filepath, function(err, stat) {
         var stream = fs.createReadStream(filepath);
          // 设置内容
         res.setHeader('Content-Type', mime.lookup(filepath));
         // ܈设置长度
         res.setHeader('Content-Length', stat.size);
         // 设置为附件
         res.setHeader('Content-Disposition' 'attachment; filename="' + path.basename(filepath) + '"');
         res.writeHead(200);
         stream.pipe(res);
       });
    };
   ```

3. 响应 JSON

   ```
   res.json = function (json) {
     res.setHeader("Content-Type", "application/json");
     res.writeHead(200);
     res.end(JSON.stringify(json));
   };

   ```

4. 响应跳转
   ```
   res.redirect = function (url) {
     res.setHeader("Location", url);
     res.writeHead(302);
     res.end("Redirect to " + url);
   };
   ```

## 视图渲染

在动态页面技术中，最终的视图是由模板和数据共同生成出来的。  
模板是带有特殊标签的 HTML 片段，通过与数据的渲染，将数据填充到这些特殊标签中，最后生成普通的带数据的 HTML 片段。  
通常我们将渲染方法设计为 render(),参数就是模板路径和数据，如下所示：

```
res.render = function (view, data) {
 res.setHeader('Content-Type', 'text/html');
 res.writeHead(200);
 // 实ा渲染
 var html = render(view, data);
 res.end(html);
};
```

## 模板

模板技术实质就是将模板文件和数据通过模板引擎生成最终的 HTML 代码。形成模板技术的也就如下 4 个要素。

- 模板语言。
- 包含模板语言的模板文件。
- 拥有动态数据的数据对象。
- 模板引擎。

模板技术干的实际上是拼接字符串这样很底层的活;模板+数据通过`模板引擎`的执行,得到最终的 HTL 字符串。

1. 模板引擎
   实现一个简单的模板引擎，步骤：

- 语法分解。（提取出普通字符串和表达式，这个过程通常用正则表达式匹配出来，<%=%>的正则表达式为/<%=([八 sS]+?)%>/g）
- 处理表达式。（将标签表达式转换成普通的语言表达式）
- 生成待执行的语句。
- 与数据一起执行，生成最终字符串。

```JavaScript的new Function
let func = new Function ([arg1, arg2, …argN], functionBody);
最后一个参数必须是函数体，其余参数作为传递给函数体的参数。
//----------------------------
str.replace(pattern, replacement)
pattern: “字符串”或者“正则表达式”;
replacement:“字符串”或者“函数”;
//--------------------------------
var complie = function (str) {
  // 模板技术就是替换特殊标签的技术
  var tpl = str.replace(/< =([ % \s\S]+?) >/g, function (match, code) {
    return "' + obj." + code + "+ '";
  });
  tpl = "var tpl = '" + tpl + "'\n return tpl;";
  return new Function("obj", tpl);
};
//function (obj) {
//   var tpl = 'Hello ' + obj.username + '.';
//   return tpl;
//}
var render = function (complied, data) {
  return complied(data);
};
//-----调用模板函数-----------------------
var tpl = "Hello < =username >.";
console.log(render(complie(tpl), { username: "Jackson Tian" }));
// => Hello Jackson Tian.
```

将原始的模板字符串转换成一个函数对象的过程称为模板编译

2. 模板安全
   在模板技术的使用中，时刻不要忘记转义，尤其是与输入有关的变量一定要`转义`。

3. 模板逻辑

4. 集成文件系统
   与文件系统集成之后，再引入缓存，可以很好地解决性能问题，接口也大大得到简化。由于模板文件内容都不太大，也不属于动态改动的，所以使用进程的内存来缓存编译结果，并不会引起太大的垃圾回收问题。

5. 子模版

6. 布局视图
   子模板主要是为了重用模板和降低模板的复杂度。子模板的另一种使用方式就是布局视图(layout),布局视图又称母版页，它与子模板的原理相同，但是场景稍有区别

7. 模版性能

- 缓存模板文件
- 缓存模板文件编译后的函数。
- 优化模板中的执行表达式

## Bigpipe

Bigpipe 的解决思路则是将页面分割成多个部分(pagelet),先向用户输出没有数据的布局（框架)，将每个部分逐步输出到前端，再最终渲染填充框架，完成整个网页的渲染。
