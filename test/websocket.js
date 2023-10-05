// 这里我们用Node模拟浏览器发起协议切换的行为，
var WebSocket = function (url) {
  // 伪代码，解析ws://127.0.0.1:12010/updates，用于请求
  this.options = parseUrl(url);
  this.connect();
};
WebSocket.prototype.onopen = function () {
  // TODO
};
WebSocket.prototype.setSocket = function (socket) {
  this.socket = socket;
};
WebSocket.prototype.connect = function () {
  var that = this;
  var key = new Buffer(
    this.options.protocolVersion + "-" + Date.now()
  ).toString("base64");
  var shasum = crypto.createHash("sha1");
  var expected = shasum
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  var options = {
    port: this.options.port, // 12010
    host: this.options.hostname, // 127.0.0.1
    headers: {
      Connection: "Upgrade",
      Upgrade: "websocket",
      "Sec-WebSocket-Version": this.options.protocolVersion,
      "Sec-WebSocket-Key": key
    }
  };

  var req = http.request(options);
  req.end();
  req.on("upgrade", function (res, socket, upgradeHead) {
    // 连接成功
    that.setSocket(socket);
    // 触发open事件
    that.onopen();
  });
};
