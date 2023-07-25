import { ADDLOADING, CUTLOADING } from "../actionType";
export const addLoading = () => {
  return {
    type: ADDLOADING
  };
};
export const cutLoading = () => {
  return {
    type: CUTLOADING
  };
};
