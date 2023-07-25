import PubSub from "pubsub-js";
let baseUrl = "";
let loadingCount = 0;

let http = async (url = "", config, showLoad = true) => {
  if (loadingCount <= 0 && showLoad) {
    loadingCount++;
    window.$toggleLoading(true);
    //console.log("loadingCount1:", loadingCount);
  }
  url = baseUrl + url;
  //-----添加--记录--start-----------------
  // console.log("config:", config);
  // console.log("add:", typeof config.body);
  //-----添加--记录--end-----------------
  try {
    let response = await fetch(url, config);
    // console.log("---http.js--response--:", response);

    if (response.status >= 500) {
      window.$Toast.fail(`${response.status}: ${response.statusText}`);
    }
    if (response.status >= 400 && response.status < 500) {
      window.$Toast.fail(`${response.status}:${response.statusText}`);
    }
    const responseJson = await response.json();
    //console.log("---http.js--responseJson--:", responseJson);
    if (showLoad) {
      loadingCount--;
      if (loadingCount <= 0) {
        window.$toggleLoading(false);
      }
    }

    if (responseJson.code === "success") {
      return responseJson;
    } else if (
      responseJson.code === "fail" &&
      responseJson.message === "用户未登录"
    ) {
      PubSub.publish("noLogin");
      window.$Toast.fail(responseJson.message);
      return { code: "noLogin" };
    } else {
      window.$Toast.fail(responseJson.message);
      return { code: "fail" };
    }
  } catch (error) {
    if (showLoad) {
      loadingCount--;
      if (loadingCount <= 0) {
        window.$toggleLoading(false);
      }
    }
    //console.log("--http.js--err--", error);
    return { code: "err" };
    //throw new Error(`err-${error}`);
  }
};

let get = (url = "", data = {}) => {
  let config = {
    credentials: "include", //当前域名内自动发送 cookie
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };

  let dataStr = ""; //数据拼接字符串
  Object.keys(data).forEach((key) => {
    dataStr += key + "=" + data[key] + "&";
  });

  if (dataStr !== "") {
    dataStr = dataStr.substr(0, dataStr.lastIndexOf("&"));
    url = url + "?" + dataStr;
  }

  return http(url, config);
};
let post = (url = "", data = {}) => {
  let config = {
    credentials: "include", //当前域名内自动发送 cookie
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  return http(url, config);
};
let put = (url = "", data = {}) => {
  let config = {
    credentials: "include", //当前域名内自动发送 cookie
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };

  return http(url, config);
};
let Delete = (url = "", data = {}) => {
  let config = {
    credentials: "include", //当前域名内自动发送 cookie
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };

  return http(url, config);
};
let postURL = (url = "", data = {}, showLoad = true) => {
  let config = {
    credentials: "include", //当前域名内自动发送 cookie
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };
  let dataStr = ""; //数据拼接字符串
  Object.keys(data).forEach((key) => {
    dataStr += key + "=" + data[key] + "&";
  });

  if (dataStr !== "") {
    dataStr = dataStr.substr(0, dataStr.lastIndexOf("&"));
    url = url + "?" + dataStr;
  }

  return http(url, config, showLoad);
};
let postForm = (url = "", data = {}) => {
  let config = {
    credentials: "include", //当前域名内自动发送 cookie
    method: "POST",
    body: data
  };
  return http(url, config);
};
let uploadFile = (url = "", data = {}) => {
  let config = {
    method: "POST",
    body: data
  };
  return http(url, config);
};
export { get, post, uploadFile, postForm, postURL, put, Delete };
