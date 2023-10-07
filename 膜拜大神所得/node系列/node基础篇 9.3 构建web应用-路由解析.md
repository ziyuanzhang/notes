# 构建 web 应用---路由解析 (原文:深入浅出 Node.js)

## MVC

MVC 工作模式:

1. 路由解析，根据 URL 寻找到对应的控制器和行为。
2. 行为调用相关的模型，进行数据操作。
3. 数据操作结束后，调用视图和相关数据进行页面谊染，输出到客户端。

URL 做路由映射，有两个分支实现。

- 一种方式是通过手工关联映射；（需要一个对应的路由文件来将 URL 映射到对应的控制器）
- 一种是自然关联映射；

1. 手工映射

   ```
   //====处理设置用户信息的控制器=========================
      exports.setting = function (req, res) { // TODO };
   //====映射的方法，方法名use()==========================
      var routes = [];
      var use = function (path, action) {
        routes.push([path, action]);
      };
   //=====手工映射======================================
      use('/user/setting', exports.setting);
      use('/setting/user', exports.setting);
      use('/setting/user/jackSonTian', exports.setting);
   //====在入口程序中判断URL，然后执行对应的逻辑===========
      function (req, res) {
        var pathname = url.parse(req.url).pathname;
        for (var i = 0; i < routes.length; i++) {
          var route = routes[i];
          if (pathname === route[0]) {
            var action = route[1];
            action(req, res);
            return;
          }
        }
        // 处理404请求
        handle404(req, res);
      }

   ```

   - 正则匹配
   - 参数解析

2. 自然映射
   以`user/setting/12/1987`为例，它会按约定去找 controllers 目录下的 user 文件，将其 require 出来后，调用这个文件模块的 setting()方法，而其余的值作为参数直接传递给这个方法。

   ```
   function (req, res) {
     var pathname = url.parse(req.url).pathname;
     var paths = pathname.split("/");
     var controller = paths[1] || "index";
     var action = paths[2] || "index";
     var args = paths.slice(3);
     var module;
     try {
       // require的缓存机制使得只有第一次是阻塞的
       module = require("./controllers/" + controller);
     } catch (ex) {
       handle500(req, res);
       return;
     }
     var method = module[action];
     if (method) {
       method.apply(null, [req, res].concat(args));
     } else {
       handle500(req, res);
     }
   }
   ```

   由于这种自然映射的方式没有指明参数的名称，所以无法采用 req.params 的方式提取，但是直接通过参数获取更简洁，如下所示：

   ```
   exports.setting = function (req, res, month, year) {
    // 如果路径为/user/setting/12/1987,那么month为12，year为1987
    // TODO
   };
   ```

## RESTful
