import { configureStore } from "@reduxjs/toolkit";
import taskReducer, { completedTask, writeStreakStatus } from "./taskSlice";
import userReducer from "./userSlice";
import summaryReducer from "./summarySlice";

export const streakMiddleware = (_store) => (next) => (action) => {
  const result = next(action);
  if (action.type === completedTask.fulfilled.type && action.payload?.user) {
    writeStreakStatus(action.payload.user);
  }
  return result;
};

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    user: userReducer,
    summary: summaryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(streakMiddleware),
});

export default store;
