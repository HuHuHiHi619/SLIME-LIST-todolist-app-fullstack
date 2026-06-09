import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isCreate: false,
  isTaskDetail: false,
  isPopup: false,
  popupMode: "",
  isHover: null,
  isSidebarPinned: false,
  activeMenu: "",
  selectedTask: null,
  taskError: null,
  instruction: false,
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
    setTaskError(state, action) {
      state.taskError = action.payload;
    },
    clearTaskError(state) {
      state.taskError = null;
    },
    toggleInstructPopup(state) {
      state.instruction = !state.instruction;
    },
  },
});

export const {
  toggleCreatePopup,
  setActiveMenu,
  togglePopup,
  setHover,
  toggleSidebarPinned,
  setSelectedTask,
  setTaskError,
  clearTaskError,
  toggleInstructPopup,
} = uiSlice.actions;
export default uiSlice.reducer;
