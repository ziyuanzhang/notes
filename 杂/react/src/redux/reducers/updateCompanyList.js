import { UPDATECOMPANYLIST } from "../actionType";
let initData = [];
const companyList = (state = initData, action) => {
  //console.log("reducers-companyList:", action);
  switch (action.type) {
    case UPDATECOMPANYLIST:
      return action.arr;
    default:
      return state;
  }
};
export default companyList;
