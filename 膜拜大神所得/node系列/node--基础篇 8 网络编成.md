# 网络编程 (原文:深入浅出 Node.js)

- ASP、ASP.NET 需要 IIS 作为服务器，
- PHP 需要搭载 Apache 或 Nginx 环境等，
- JSP 需要 Tomcat 服务器等。

Node 提供了 net、dgram、http、https 这 4 个模块，分别用于处理 TCP、UDP、HTTP、HTTPS,适用于服务器端和客户端。

## TCP

1. 创建 TCP 服务端

   ```
   var net = require('net');
   var server = net.createServer(function (socket) {
       // 新的连接
       socket.on('data', function (data) {
         socket.write("你好")
       });
       socket.on('end', function () {
          console.log('断开接܏开');
       });
       socket.write("欢迎光临《深入浅出Node.js》示例：\n");
   });
   server.listen(8124, function () {
       console.log('server bound');
   });
   ```

   通过 net.createServer(listener)创建一个 TCP 服务器，listener 是连接事件 connection 的侦听器，也可以采用如下的方式进行侦听：

   ```
   var server = net.createServer();
   server.on('connection', function (socket) {   // 新的连接 });
   server.listen(8124);
   ```

   - listening:在调用 server.listen()绑定端口或者 Domain Socket.后触发，简洁写法为 server.listen(port,listeningListener),通过 listen()方法的第二个参数传入。
   - connection:每个客户端`套接字`连接到服务器端时触发，简洁写法为通过 net.createServer(),最后一个参数传递。
   - close:当服务器关闭时触发，在调用 server.close()后，服务器将停止接受新的`套接字`连接，但保持当前存在的连接，等待所有连接都断开后，会触发该事件。
   - error:当服务器发生异常时，将会触发该事件。比如侦听一个使用中的端口，将会触发一个异常，如果不侦听 error 事件，服务器将会抛出异常。

2. 创建 TCP 客户端

   ```
   var net = require("net");
   var client = net.connect({ port: 8124 }, function () {
     //'connect' listener
     console.log("client connected");
     client.write("world!\r\n");
   });
   client.on("data", function (data) {
     console.log(data.toString());
     client.end();
   });
   client.on("end", function () {
     console.log("client disconnected");
   });
   ```

   - connect:该事件用于客户端，当`套接字`与服务器端连接成功时会被触发。

3. 连接事件

   服务器可以同时与多个客户端保持连接，对于每个连接而言是典型的可写可读 Stream 对象。

   - data:当一端周用 write()发送数据时，另一端会触发 data 事件，事件传递的数据即是 write()发送的数据。
   - end:当连接中的任意一端发送了 FIN 数据时，将会触发该事件。
   - drain:当任意一端调用 write()发送数据时，当前这端会触发该事件。
   - error:当异常发生时，触发该事件。
   - close:当`套接字`完全关闭时，触发该事件。
   - timeout:当一定时间后连接不再活跃时，该事件将会被触发，通知用户当前该连接已经被闲置了。

4. TCP 的优化策略---Nagle 算法

   - 每次只发送一个字节的内容，浪费网络资源；
   - TCP 针对网络中的小数据包有一定的优化策略：Nagle 算法：将缓冲数据达到一定数量或一定时间后才将其发送；
   - 在 Node 中，由于 TCP 默认启用了 Nagle 算法，可以调用 socket.setNoDelay(true)去掉 Nagle 算法，使得 write()可以立即发送数据到网络中。
   - 尽管在网络的一端调用 rite()会触发另一端的 data 事件，但是并不意味着每次 write()都会触发一次 data 事件，在关闭掉 Nagle 算法后，另一端可能会将接收到的多个小数据包合并，然后只触发一次 data 事件。

## UDP

创建 UDP 套接字十分简单，UDP 套接字一旦创建，既可以作为客户端发送数据，也可以作为服务器端接收数据。

1. 创建 UDP 服务器端  
   若想让 UDP 套接字接收网络消息，只要调用 dgram.bind(port,[address])方法对网卡和湍口
   进行绑定即可。

   ```
   var dgram = require("dgram");
   var server = dgram.createSocket("udp4");
   server.on("message", function (msg, rinfo) {
        console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
   });
   server.on("listening", function () {
        var address = server.address();
        console.log("server listening " + address.address + ":" + address.port);
   });
   server.bind(41234);

   ```

   该套接字将接收所有网卡上 41234 端口上的消息。在绑定完成后，将触发 listening 事件。

2. 创建 UDP 客户端

   ```
   var dgram = require('dgram');
   var message = new Buffer("深入浅出Node.js");
   var client = dgram.createSocket("udp4");
   client.send(message, 0, message.length, 41234, "localhost", function(err, bytes) {
       client.close();
   });
   ```

   socket.send(buf, offset, length, port, address, [callback])：要发送的 Buffer、Buffer 的偏移、Buffer 的长度、目标端口、目标地址、发送完成后的回调。

3. UDP 套接字事件
   UDP 套接字它只是一个 EventEmitter 的实例，而非 Stream 的实例。
   - message:当 UDP 套接字侦听网卡端口后，接收到消息时触发该事件，触发携带的数据为消息 Buffer 对象和一个远程地址信息。
   - listening:当 UDP 套接字开始你听时触发该事件。
   - close:调用 close()方法时触发该事件，并不再触发 message 事件。如需再次触发 message 事件，重新绑定即可。
   - error:当异常发生时触发该事件，如果不侦听，异常将直接抛出，使进程退出。
