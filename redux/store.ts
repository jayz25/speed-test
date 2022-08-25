import { configureStore } from "@reduxjs/toolkit";
import  paragraph  from "./api";

const store = configureStore({
    reducer: paragraph,
})

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;