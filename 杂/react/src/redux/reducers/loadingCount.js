import { ADDLOADING, CUTLOADING } from "../actionType";
let initData = 0;
const loadingCount = (state = initData, action) => {
  switch (action.type) {
    case ADDLOADING:
      return state + 1;
    case CUTLOADING:
      return state - 1;
    default:
      return state;
  }
};
export default loadingCount;
