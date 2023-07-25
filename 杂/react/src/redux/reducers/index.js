import { combineReducers } from "redux";
import loadingCount from "./loadingCount";
import showLogin from "./showLogin";
import showRegister from "./showRegister";
import userInfoObj from "./userInfoObj";
import showForget from "./showForget";
import groupListObj from "./updateGroupListObj";
import companyList from "./updateCompanyList";

export default combineReducers({
  loadingCount,
  showLogin,
  showRegister,
  userInfoObj,
  showForget,
  groupListObj,
  companyList
});
