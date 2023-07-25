import { baseUrl } from "./config.js";

let http = function (url, data, method, showLoad, header) {
  let requestTask = null;
  if (showLoad) {
    uni.showLoading({
      title: "加载中"
    });
  }
  return new Promise((resolve, reject) => {
    let FullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
    //console.log('FullUrl:', FullUrl)
    requestTask = uni.request({
      url: FullUrl,
      data: data,
      header: header ? header : {},
      method: method,
      success: (res) => {
        if (showLoad) {
          uni.hideLoading();
        }
        //console.log('success:',res)
        if (res.data.code == "success") {
          resolve(res.data);
        } else {
          if (url === "/xxxx") {
          } else {
            uni.showToast({
              title: res.data.message ? res.data.message : res.message,
              icon: "none",
              duration: 3000
            });
          }
          resolve(res.data);
        }
      },
      fail: (err) => {
        if (showLoad) {
          uni.hideLoading();
        }
        //console.log('err:',err)
        uni.showToast({
          title: err.message,
          icon: "none",
          duration: 3000
        });
      },
      complete: () => {}
    });
  });
  //requestTask.abort();
};

const get = (url, data) => {
  return new Promise((resolve, reject) => {
    resolve(http(url, data, "GET", true, {}));
  });
};
const getNoLoad = (url, data) => {
  return new Promise((resolve, reject) => {
    resolve(http(url, data, "GET", false, {}));
  });
};
const post = (url, data, header) => {
  let newHeader = header ? header : {};
  return new Promise((resolve, reject) => {
    resolve(http(url, data, "POST", true, newHeader));
  });
};
const postNoLoad = (url, data, header) => {
  let newHeader = header ? header : {};
  return new Promise((resolve, reject) => {
    resolve(http(url, data, "POST", false, newHeader));
  });
};

export default {
  get,
  getNoLoad,
  post,
  postNoLoad,
  http
};
