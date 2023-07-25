import { SHOWLOGIN, HIDELOGIN } from "../actionType";

let initState = false;
const showLogin = (state = initState, action) => {
  switch (action.type) {
    case SHOWLOGIN:
      return true;
    case HIDELOGIN:
      return false;
    default:
      return state;
  }
};
export default showLogin;
