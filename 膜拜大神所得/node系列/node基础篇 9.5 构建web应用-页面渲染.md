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
