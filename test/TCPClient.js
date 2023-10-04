var net = require("net");
var client = net.connect({ port: 8124 }, function () {
  //'connect' listener
  console.log("client-connected:" + Date.parse(new Date()));
  setTimeout(function () {
    client.write("world!\r\n");
  }, 1000);
});
client.on("data", function (data) {
  console.log("client-data:" + data.toString() + Date.parse(new Date()));

  client.end(); // 发起断开连接
});
client.on("end", function () {
  console.log("client-end:" + Date.parse(new Date()));
});


function (req, res) {
  // console.log(req.headers);
  var buffers = [];
  req.on('data', function (trunk) {
  buffers.push(trunk);
  }).on('end', function () {
  var buffer = Buffer.concat(buffers);
  // TODO
  res.end('Hello world');
  });
 }