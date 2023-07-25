import axios, { AxiosResponse } from "axios";
import { message } from "ant-design-vue";
// 创建一个 axios 实例
const service = axios.create({
  timeout: 60000, // 请求超时时间毫秒
  withCredentials: true, // 异步请求携带cookie
  headers: {
    // 设置后端需要的传参类型
    "Content-Type": "application/json"
    // token: "your token",
    // "X-Requested-With": "XMLHttpRequest"
  }
});

// 添加请求拦截器
service.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    // config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    if (import.meta.env.VITE_APP_isCloud) {
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    // console.log(error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  function (response) {
    // console.log("response:", response);
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // dataAxios 是 axios 返回数据中的 data
    const dataAxios = response.data;
    if (dataAxios.code !== "success") {
      message.error(`${dataAxios.message}`);
    }
    // 这个状态码是和后端约定的
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    // console.log("error:", error);
    return Promise.reject(error);
  }
);

const get = <T>(url: string, data?: IString) => {
  return new Promise<T>((resolve, reject) => {
    service
      .get<T, AxiosResponse<T>>(url, { params: data })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const post = <T>(url: string, data: IString) => {
  return new Promise<T>((resolve, reject) => {
    service
      .post<T, AxiosResponse<T>>(url, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const put = <T>(url: string, data: IString) => {
  return new Promise<T>((resolve, reject) => {
    service
      .put<T, AxiosResponse<T>>(url, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const postForm = <T>(url: string, data: FormData) => {
  return new Promise<T>((resolve, reject) => {
    service
      .post<T, AxiosResponse<T>>(url, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export default service;
export { get, post, put, postForm };
