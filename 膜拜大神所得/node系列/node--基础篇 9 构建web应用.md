# 构建 web 应用 (原文:深入浅出 Node.js)

而本章的 Web 应用方面的内容，将从 http 模块中服务器端的 request 事件开始分析。  
request 事件发生于网络连接建立，客户端向服务器端发送报文，服务器端解析报文，发现 HTTP 请求的报头时。在已触发 request 事件前，它已准备好 ServerRequest 和 ServerResponse 对象以供对请求和响应报文的操作。

```
var http = require('http');
http.createServer(function (req, res) {
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```

我们可能有如下这些需求 :

- 请求方法的判断;
- URL 的路径解析;
- URL 中查询字符串解析;
- Cookie 的解析;
- Basic 认证;
- 表单数据的解析;
- 任意格式文件的上传处理;
- 可能还有 Session(会话)的需求;
