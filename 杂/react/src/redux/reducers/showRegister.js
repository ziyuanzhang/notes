import { SHOWREGISTER, HIDEREGISTER } from "../actionType";

let initState = false;
const showRegister = (state = initState, action) => {
  switch (action.type) {
    case SHOWREGISTER:
      return true;
    case HIDEREGISTER:
      return false;
    default:
      return state;
  }
};
export default showRegister;
