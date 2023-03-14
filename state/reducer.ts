import { combineReducers } from "@reduxjs/toolkit";

import application from "./application/reducer";
import { updateVersion } from "./global/actions";
import user from "./user/reducer";
import transactions from "./transactions/reducer";
import swap from "./swap/reducer";
import mint from "./mint/reducer";
import lists from "./lists/reducer";
import burn from "./burn/reducer";
import multicall from "./multicall/reducer";

const rootReducer = combineReducers({
  application,
  updateVersion,
  user,
  transactions,
  swap,
  mint,
  lists,
  burn,
  multicall,
});

export default rootReducer;
