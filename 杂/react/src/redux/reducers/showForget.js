import { SHOWFORGET, HIDEFORGET } from "../actionType";

let initState = false;
const showForget = (state = initState, action) => {
  switch (action.type) {
    case SHOWFORGET:
      return true;
    case HIDEFORGET:
      return false;
    default:
      return state;
  }
};
export default showForget;
