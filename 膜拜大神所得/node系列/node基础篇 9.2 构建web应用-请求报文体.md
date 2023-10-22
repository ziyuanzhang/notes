# 构建 web 应用---报文体 (原文:深入浅出 Node.js)

## 数据上传

Node 的 http 模块只对 HTTP 报文的头部进行了解析，然后触发 request 事件。  
如果请求中还带有内容部分（如 POST 请求，它具有报头和内容），内容部分需要用户自行接收和解析。通过报头的 Transfer-Encoding 或 Content-Length 即可判断请求中是否带有内容，如下所示：

```code hasBody
var hasBody = function(req) {
  return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
};
```

在 HTTP_Parser 解析报头结束后，报文内容部分会通过 data 事件触发，我们只需以流的方式处理即可。  
将接收到的 Buffer 列表转化为一个 Buffer 对象后，再转换为没有乱码的字符串，暂时挂置在 req.rawBody 处。

```
function (req, res) {
  if (hasBody(req)) {
    var buffers = [];
    req.on("data", function (chunk) {
      buffers.push(chunk);
    });
    req.on("end", function () {
      req.rawBody = Buffer.concat(buffers).toString();
      handle(req, res);
    });
  } else {
    handle(req, res);//处理
  }
}

```

1. 表单数据; 【`报文体`内容跟`查询字符串`相同（foo=bar&baz=val）】
2. JSON -- 不需要额外库;
3. XML 文件 -- 需要额外库 xml2js 【xml 文件转 json 库】;  
   `Content-Type: application/json; charset=utf-8`

```code
var xml2js = require('xml2js');
var formidable = require('formidable');
var mime = function (req) {
  var str = req.headers["content-type"] || "";
  return str.split(";")[0];
};
//-----------------------------------
var parseJSON = function(req,res, done){
  try {
      req.body = JSON.parse(req.rawBody);
    } catch (e) {
      // 异常内容,响应Bad request
      res.writeHead(400);
      res.end("Invalid JSON");
      return;
    }
    done()
}
var parseXML = function(req,res,done){
  xml2js.parseString(req.rawBody, function (err, xml) {
      if (err) {
        // 异常内,响应Bad request
        res.writeHead(400);
        res.end("Invalid XML");
        return;
      }
      req.body = xml;
      done();
  });
}
//-----------------------------------------
 function (req, res) {
   if (hasBody(req)) {
      var done = function () {
         handle(req, res);
      };
      if (mime(req) === 'application/json') {
        req.body = querystring.parse(req.rawBody);
        done()
      } else if (mime(req) === 'application/json') {
          parseJSON(req, done);
       } else if (mime(req) === 'application/xml') {
          parseXML(req, done);
       } else if (mime(req) === 'multipart/form-data') {
          parseMultipart(req, done);
       }else if (mime(req) === 'multipart/form-data') {
        var form = new formidable.IncomingForm();
          form.parse(req, function(err, fields, files) {
             req.body = fields;
             req.files = files;
             done()
          });
       }
   }else{
    handle(req, res);
   }
};

```

## 附件上传

普通表单（无文件上传的）默认表单类型为：`application/x-www-form-urlencoded`；  
特殊表单（有文件上传的）需要指定表单类型为：`enctype="multipart/form-data"`;

```
Content-Type: multipart/form-data; boundary=AaB03x
Content-Length: 18231
```

它代表本次提交的内容是由多部分构成的，其中 boundary=AaBo3x 指定的是每部分内容的分界符，AaB03x 是随机生成的一段字符串，报文体的内容将通过在它前面添加-进行分割，报文结束时在它前后都加上-表示结束。另外，Content-Length 的值必须确保是报文体的长度。

```上传dddd.js的文件
--AaB03x\r\n
Content-Disposition: form-data; name="username"\r\n
\r\n
Jackson Tian\r\n    //====普通的表单控件的报文体=======
--AaB03x\r\n        //====文件控件形成的报文=======
Content-Disposition: form-data; name="file"; filename="dddd.js"\r\n
Content-Type: application/javascript\r\n
\r\n
 ... contents of dddd.js ...
--AaB03x--
```

解析表单、JSON 和 XML 部分：我们采取的策略是先保存用户提交的所有数据，然后再解析处理，最后才传递给业务逻辑。
附件上传：将 req 这个流对象直接交给对应的解析方法，由解析方法自行处理上传的内容，或接收内容并保存在内存中，或流式处理掉。

## 数据上传与安全

由于 Node 与前瑞 JavaScript 的近缘性，前端 JavaScript 甚至可以上传到服务器直接执行，这是非常危险的；

1. 内存限制  
   解析表单、JSON 和 XML 的处理逻辑只适合数据量小的提交请求，一旦数据量过大，将发生内存被占光的情况。  
   攻击者通过客户端能够十分容易地模拟伪造大量数据，如果攻击者每次提交 1MB 的内容，那么只要并发请求数量一大，内存就会很快地被吃光。

   解决方案：

   - 限制上传内容的大小，一旦超过限制，停止接收数据，并响应 400 状态码。
   - 通过流式解析，将数据流导向到磁盘中，Node 只保留文件路径等小数据。

     ```限制上传内容大小
       var bytes = 1024;
       function (req, res) {
         var received = 0;
         var len = req.headers["content-length"]
           ? parseInt(req.headers["content-length"], 10)
           : null;
         // 如果内容超过长度限制，返回请求实体过长的状态码
         if (len && len > bytes) {
           res.writeHead(413);
           res.end();
           return;
         }
         // limit
         req.on("data", function (chunk) {
           received += chunk.length;
           if (received > bytes) {
             // 停止接收数据，触发end()
             req.destroy();
           }
         });
         handle(req, res);
       }
     ```

     数据是由包含 Content-Length 的请求报文判断是否长度超过限制的，超过则直接响应 4l3 状态码。  
     对于没有 Content-Length 的请求报文 ，在每个 data 事件中判定即可。一旦超过限削值，服务器停止接收新的数据片段。  
     如果是 JSON 文件或 XML 文件，极有可能无法完成解析。对于上线的 Web 应用，添加一个上传大小限制十分有利于保护服务器，在遭遇攻击时，能镇定从容应对。

2. CSRF--(Cross-Site Request Forgery，跨站请求伪造)
   用户登陆了 A 站点，引诱用户打开 B 站点，B 站点中存在“提交到 A 站点的请求（例如 form）”,在提交时会带上 A 站点的 cookie 发送到服务器，尽管这个提交请求是来自 B 站点，但服务器和用户都不知情。
