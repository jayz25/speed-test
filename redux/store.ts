import { combineReducers, configureStore } from "@reduxjs/toolkit";
import  paragraph  from "./paragraph";
import stat from "./stat";

const reducers = combineReducers({
    paragraph: paragraph,
    globalStats: stat
})
const store = configureStore({
    reducer: reducers,
})

export default store;
