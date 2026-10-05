import { combineReducers, configureStore } from "@reduxjs/toolkit";
import paragraph from "./paragraph";
import settings from "./settings";
import stat from "./stat";

const reducers = combineReducers({
  paragraph,
  settings,
  globalStats: stat,
});

export const makeStore = (preloadedState?: Partial<ReturnType<typeof reducers>>) =>
  configureStore({
    reducer: reducers,
    preloadedState,
    // RTK 2.x: getDefaultMiddleware removed from import, use callback form instead
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

const store = makeStore();

export default store;
