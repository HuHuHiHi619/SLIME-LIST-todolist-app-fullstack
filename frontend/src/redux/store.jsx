import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";
import userReducer from "./userSlice";
import summaryReducer from "./summarySlice";

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    user: userReducer,
    summary: summaryReducer,
  },
});

export default store;
