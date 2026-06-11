import { createSlice } from "@reduxjs/toolkit";

// Safe date coercion for form fields. `undefined` = field absent → keep current;
// `null` = explicit clear → stay null; an invalid date keeps the current value.
function toIsoDate(value, fallback) {
  if (value === undefined) return fallback;
  if (value === null) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}

const initialState = {
  formTask: {
    title: "",
    note: "",
    deadline: null,
    category: "",
    status: "pending",
  },
  progress: {
    steps: [],
    totalSteps: 0,
    allStepsCompleted: false,
    history: {
      steps: [],
      timestamps: new Date().toISOString(),
    },
  },
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setFormTask(state, action) {
      const { deadline, ...rest } = action.payload;
      state.formTask = {
        ...state.formTask,
        ...rest,
        deadline: toIsoDate(deadline, state.formTask.deadline),
      };
    },
    resetFormTask(state) {
      state.formTask = initialState.formTask;
      state.progress = initialState.progress;
    },
    addSteps(state, action) {
      const newStep = action.payload;
      state.progress.steps.push(newStep);
      state.progress.totalSteps += 1;
      state.progress.allStepsCompleted = state.progress.steps.every(
        (step) => step.completed
      );
      state.progress.history.steps.push({ ...newStep });
      state.progress.history.timestamps = new Date().toISOString();
    },
    removeStep(state, action) {
      const index = action.payload;
      state.progress.steps = state.progress.steps.filter((_, i) => i !== index);
      state.progress.totalSteps -= 1;
      state.progress.allStepsCompleted = state.progress.steps.every(
        (step) => step.completed
      );
      state.progress.history.timestamps = new Date().toISOString();
    },
  },
});

export const { setFormTask, resetFormTask, addSteps, removeStep } =
  formSlice.actions;
export default formSlice.reducer;
