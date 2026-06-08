import { createSlice } from "@reduxjs/toolkit";
import { updatedTask, completedTask } from "./taskSlice";

const initialState = {
  isCreate: false,
  isTaskDetail: false,
  isPopup: false,
  popupMode: "",
  isHover: null,
  isSidebarPinned: false,
  activeMenu: "",
  selectedTask: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleCreatePopup(state) {
      state.isCreate = !state.isCreate;
    },
    setActiveMenu(state, action) {
      state.activeMenu = action.payload;
    },
    togglePopup(state, action) {
      state.isPopup = !state.isPopup;
      state.popupMode = action.payload || "";
    },
    setHover(state, action) {
      state.isHover = action.payload;
    },
    toggleSidebarPinned(state) {
      state.isSidebarPinned = !state.isSidebarPinned;
    },
    setSelectedTask(state, action) {
      state.selectedTask = action.payload || null;
      // Deterministic: a task opens the detail panel, null closes it.
      state.isTaskDetail = action.payload != null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatedTask.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.selectedTask && state.selectedTask._id === updated._id) {
          state.selectedTask = {
            ...state.selectedTask,
            ...updated,
            category: updated.category,
          };
        }
      })
      .addCase(completedTask.fulfilled, (state, action) => {
        const completedTaskId = action.payload._id;
        const updatedTaskData = action.payload.updatedTask || action.payload;
        if (state.selectedTask && state.selectedTask._id === completedTaskId) {
          state.selectedTask = {
            ...state.selectedTask,
            status: updatedTaskData.status,
          };
        }
      });
  },
});

export const {
  toggleCreatePopup,
  setActiveMenu,
  togglePopup,
  setHover,
  toggleSidebarPinned,
  setSelectedTask,
} = uiSlice.actions;
export default uiSlice.reducer;
