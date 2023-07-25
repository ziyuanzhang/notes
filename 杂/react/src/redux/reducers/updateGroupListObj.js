import { UPDATEGROUPLIST } from "../actionType";
let initData = {
  arr: [],
  obj: {}
};
const groupListObj = (state = initData, action) => {
  //console.log("reducers-groupList:", action);
  switch (action.type) {
    case UPDATEGROUPLIST:
      return action.obj;
    default:
      return state;
  }
};
export default groupListObj;
