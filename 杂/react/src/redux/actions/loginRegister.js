import {
  SHOWLOGIN,
  HIDELOGIN,
  SHOWREGISTER,
  HIDEREGISTER,
  ADDUSERINFO,
  CLEARUSERINFO,
  SHOWFORGET,
  HIDEFORGET
} from "../actionType";
export const showLoginFn = () => {
  return {
    type: SHOWLOGIN
  };
};
export const hideLoginFn = () => {
  return {
    type: HIDELOGIN
  };
};
export const showRegisterFn = () => {
  return {
    type: SHOWREGISTER
  };
};
export const hideRegisterFn = () => {
  return {
    type: HIDEREGISTER
  };
};
export const showForgetFn = () => {
  return {
    type: SHOWFORGET
  };
};
export const hideForgetFn = () => {
  return {
    type: HIDEFORGET
  };
};
export const addUserInfoFn = (obj) => {
  return {
    type: ADDUSERINFO,
    obj
  };
};
export const clearUserInfoFn = () => {
  return {
    type: CLEARUSERINFO
  };
};
