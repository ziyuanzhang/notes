import { UPDATEGROUPLIST } from "../actionType";
export const updateGroupList = (obj) => {
  return {
    type: UPDATEGROUPLIST,
    obj
  };
};
