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
//--------------------------------------------

var complie = function (str) {
  // 模板技术就是替换特殊标签的技术
  var tpl = str.replace(/< =([ % \s\S]+?) >/g, function (match, code) {
    return "' + obj." + code + "+ '";
  });
  tpl = "var tpl = '" + tpl + "'\n return tpl;";
  return new Function("obj", tpl);
};
//function (obj) {
//   var tpl = 'Hello ' + obj.username + '.';
//   return tpl;
//}
var render = function (complied, data) {
  return complied(data);
};
//
var tpl = "Hello < =username >.";
console.log(render(complie(tpl), { username: "Jackson Tian" }));
