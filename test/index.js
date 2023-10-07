// console.log(process.memoryUsage());
var iconv = require("iconv-lite");
var fs = require("fs");
var rs = fs.createReadStream("./test/test.md", { highWaterMark: 11 });
// rs.setEncoding("utf8");

// var data = "";
// rs.on("data", function (chunk) {
//   data += chunk;
// });
// rs.on("end", function () {
//   console.log(data);
// });
//-------------------------------
var chunks = [];
var size = 0;
rs.on("data", function (chunk) {
  chunks.push(chunk);
  size += chunk.length;
});
rs.on("end", function () {
  var buf = Buffer.concat(chunks, size);
  var str = iconv.decode(buf, "utf8");
  console.log(str);
});

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
