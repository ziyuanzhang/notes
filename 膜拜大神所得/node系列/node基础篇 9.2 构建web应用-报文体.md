# 构建 web 应用--报文体 (原文:深入浅出 Node.js)

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

```
--AaB03x\r\n
Content-Disposition: form-data; name="username"\r\n
\r\n
Jackson Tian\r\n    //====普通的表单控件的报文体=======
--AaB03x\r\n        //====文件控件形成的报文=======
Content-Disposition: form-data; name="file"; filename="diveintonode.js"\r\n
Content-Type: application/javascript\r\n
\r\n
 ... contents of diveintonode.js ...
--AaB03x--
```
