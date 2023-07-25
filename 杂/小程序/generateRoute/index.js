const fs = require("fs");

let str = "{";
str += `"pages":[${index},${login}],`;
str += `"subPackages": [${xxxx},${xxxx2222}],`;
str += `${end}`;
str += "}";

fs.writeFile("../pages.json", str, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("路由创建成功");
});
