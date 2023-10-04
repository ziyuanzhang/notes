// var net = require("net");
// var server = net.createServer(function (socket) {
//   // 新的连接
//   socket.on("data", function (data) {
//     socket.write("你好");
//     console.log(`tcpServer-data: ${data} ${Date.parse(new Date())} `);
//   });
//   socket.on("end", function () {
//     console.log("断开接܏开" + Date.parse(new Date()));
//   });
//   setTimeout(function () {
//     socket.write("欢迎光临《深入浅出Node.js》示例:\n");
//   }, 500);
// });

// server.listen(8124, function () {
//   console.log("server bound");
// });

var net = require("net");
var server = net.createServer(function (socket) {
  socket.write("Echo server\r\n");
  socket.pipe(socket);
});
server.listen(1337, "127.0.0.1");
