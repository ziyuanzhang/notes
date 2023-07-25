const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/tz", {
      target: "http://888.888.888.888:9999", //测试服务器
      changeOrigin: true,
      pathRewrite: {
        "^/tz": "/tz"
      }
    })
  );
  app.use(
    createProxyMiddleware("/lz", {
      target: "http://888.888.888.888:8888", //测试服务器

      changeOrigin: true,
      pathRewrite: {
        "^/lz": "/lz"
      }
    })
  );
};
