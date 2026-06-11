import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";
import uiReducer from "./uiSlice";
import formReducer from "./formSlice";
import userReducer from "./userSlice";
import petReducer from "./petSlice";

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    ui: uiReducer,
    form: formReducer,
    user: userReducer,
    pet: petReducer,
  },
});

export default store;
