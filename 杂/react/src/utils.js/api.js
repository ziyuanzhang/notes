import { get, post, postURL, postForm, uploadFile, put, Delete } from "./http";
export const aaaa = (data) => {
  return get("/xxx/xxx", data);
};
export const bbbb = (data) => {
  return post("/xxx/xxx", data);
};
export const cccc = (data) => {
  return postForm("/xxx/xxx", data);
};
export const dddd = (data) => {
  return postURL("/xxx/xxx", data);
};
export const eeee = (data) => {
  return put("/xx/xxx", data);
};
