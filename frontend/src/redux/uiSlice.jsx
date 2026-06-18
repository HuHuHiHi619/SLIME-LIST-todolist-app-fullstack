import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isCreate: false,
  isTaskDetail: false,
  isPopup: false,
  popupMode: "",
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
    togglePopup(state, action) {
      state.isPopup = !state.isPopup;
      state.popupMode = action.payload || "";
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
  togglePopup,
  setSelectedTask,
  setTaskError,
  clearTaskError,
  toggleInstructPopup,
} = uiSlice.actions;
export default uiSlice.reducer;
