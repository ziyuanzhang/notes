import { ADDUSERINFO, CLEARUSERINFO } from "../actionType";
let initData = {};
const userInfoObj = (state = initData, action) => {
  switch (action.type) {
    case ADDUSERINFO:
      return action.obj;
    case CLEARUSERINFO:
      return {};
    default:
      return state;
  }
};
export default userInfoObj;
