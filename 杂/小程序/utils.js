let toast = {
  info: (data = "", time = 2000, callback) => {
    uni.showToast({
      title: data,
      icon: "none",
      duration: time,
      success: function (res) {
        if (callback) {
          let timeoutName = setTimeout(function () {
            clearTimeout(timeoutName);
            callback();
          }, time);
        }
      }
    });
  },
  success: (data = "", time = 2000, callback) => {
    uni.showToast({
      title: data,
      icon: "success",
      duration: time,
      success: function (res) {
        if (callback) {
          let timeoutName = setTimeout(function () {
            clearTimeout(timeoutName);
            callback();
          }, time);
        }
      }
    });
  },
  error: (data = "", time = 2000, callback) => {
    uni.showToast({
      title: data,
      icon: "error",
      success: function (res) {
        if (callback) {
          let timeoutName = setTimeout(function () {
            clearTimeout(timeoutName);
            callback();
          }, time);
        }
      }
    });
  }
};
//小程序状态栏高度
let getStatusBarHeight = () => {
  let statusBarHeight = 0;
  let res = uni.getSystemInfoSync();
  let menu = uni.getMenuButtonBoundingClientRect();
  statusBarHeight =
    (menu.top - res.statusBarHeight) * 2 + menu.height + res.statusBarHeight;
  if (res.model.indexOf("iPhone") > -1) {
    statusBarHeight += 4;
  }
  return statusBarHeight;
};
let getTitleBarHeight = () => {
  let titleBarHeight = 0;
  let res = uni.getSystemInfoSync();
  let menu = wx.getMenuButtonBoundingClientRect();
  //获取获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。（top表示上边框到手机顶部的距离 bottom是下边框到手机顶部的距离）
  titleBarHeight = (menu.top - res.statusBarHeight) * 2 + menu.height;
  if (res.model.indexOf("iPhone") > -1) {
    titleBarHeight += 4;
  }
  return titleBarHeight;
};
let getImgBarBottom = () => {
  let bottom = 22;
  let res = uni.getSystemInfoSync();
  if (res.model.indexOf("iPhone") > -1) {
    bottom += 4;
  }
  return bottom;
};
