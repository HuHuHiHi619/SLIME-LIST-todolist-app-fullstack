import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCategoryData } from "../functions/category";
import { getTagData } from "../functions/tag";
import { createTask } from "../functions/task";
import { updateTask } from "../functions/task";

const initialState = {
  categories: [],
  tags: [],
  formTask: {
    title: "",
    note: "",
    startDate: null,
    deadline: null,
    category: "",
    tag: [],
    status: "pending",
    tryAgainCount: 0,
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
  loading: false,
  error: null,
};
// asyncronous action
export const fetchCategories = createAsyncThunk(
  "task/fetchCategories",
  async () => {
    try {
      const response = await getCategoryData();
      //console.log("Categories fetched:", response);
      return response || [];
    } catch (error) {
      console.error("Error fetching cateories:", error);
      throw error;
    }
  }
);

export const fetchTags = createAsyncThunk("task/fetchTags", async () => {
  try {
    const response = await getTagData();
    //console.log("Tags fetched:",response);
    return response || [];
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
});

export const createNewTask = createAsyncThunk(
  "task/createNewTask",
  async (taskData) => {
    const response = await createTask(taskData);
    return response;
  }
);

export const updatedTask = createAsyncThunk(
  "task/updateTask",
  async (taskId, taskData) => {
    const response = await updateTask(taskId, taskData);
    return response;
  }
);

// reducer
const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setFormTask(state, action) {
      const { startDate, deadline, ...rest } = action.payload;
      state.formTask = {
        ...state.formTask,
        ...rest,
        startDate:
          startDate !== undefined
            ? new Date(startDate).toISOString()
            : state.formTask.startDate,
        deadline:
          deadline !== undefined
            ? new Date(deadline).toISOString()
            : state.formTask.deadline,
      };
      console.log("Updated formTask:", state.formTask);
    },
    resetFormTask(state) {
      (state.formTask = {
        title: "",
        note: "",
        startDate: null,
        deadline: null,
        category: "",
        tag: [],
        status: "pending",
        tryAgainCount: 0,
      }),
        (state.progress = {
          steps: [],
          totalSteps: 0,
          allStepsCompleted: false,
          history: {
            steps: [],
            timestamps: new Date().toISOString(),
          },
        });
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.categories = [];
      })
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
        state.loading = false;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.tags = [];
      })
      .addCase(createNewTask.pending, (state, action) => {
        state.loading = true;
        
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        state.formTask = initialState.formTask;
        state.progress = initialState.progress;
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { setFormTask, resetFormTask ,addSteps, removeStep } = taskSlice.actions;
export default taskSlice.reducer;
