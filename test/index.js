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

function a(req, res) {
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
    handle(req, res);
  }
}
