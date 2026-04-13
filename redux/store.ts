import { combineReducers, configureStore } from "@reduxjs/toolkit";
import paragraph from "./paragraph";
import stat from "./stat";

const reducers = combineReducers({
  paragraph,
  globalStats: stat,
});

const store = configureStore({
  reducer: reducers,
  // RTK 2.x: getDefaultMiddleware removed from import, use callback form instead
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
