import http, { get, post, put, postForm } from "./http";

type Response<T = any> = {
  code: string;
  message: string;
  data: any;
};

export const uploadFileUrl = () => {
  return "/xxxx";
};

export const submitStatistics = <T>(data: IString) => {
  return get<Response<T>>("/api/", data);
};

export const Neutral = <T>(data: IString) => {
  return post<Response<T>>("/xxxx", data);
};
export const uploadSignImg = <T>(data: FormData) => {
  return postForm<Response<T>>("/xxxx", data);
};
type TWork = {
  issueId: number;
  zxBaseJobVOs: ISArray;
};
export const saveBaseJobInfo = <T>(data: TWork) => {
  return post<Response<T>>("/xxxxxx", data);
};
export const supplement = <T>(data: ISArray) => {
  return get<Response<T>>("/xxxxxx", data);
};
