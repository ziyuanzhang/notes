import { UPDATECOMPANYLIST } from "../actionType";
export const companyListAction = (arr) => {
  return {
    type: UPDATECOMPANYLIST,
    arr
  };
};
