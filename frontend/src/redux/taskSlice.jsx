import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCategoryData, removeCategory } from "../functions/category";

import {
  completeTask,
  createTask,
  getData,
  removeAllCompletedTask,
  removeTask,
  searchedTask,
  updateTaskAttempt,
} from "../functions/task";
import { updateTask } from "../functions/task";

function safeReadStreakStatus() {
  try {
    return JSON.parse(localStorage.getItem("streakStatus")) || {};
  } catch {
    return {};
  }
}

function writeStreakStatus(value) {
  try {
    localStorage.setItem("streakStatus", JSON.stringify(value));
  } catch {
    // storage unavailable or quota exceeded — state update still applies
  }
}

const initialState = {
  tasks: [],
  searchResults: [],
  isSummaryUpdated: false,
  categories: [],
  formTask: {
    title: "",
    note: "",
    startDate: null,
    deadline: null,
    category: "",
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
  streakStatus: safeReadStreakStatus(),
  lastUpdated: null,
  lastStateUpdate: null,
  selectedTask: null,
  isCreate: false,
  isTaskDetail: false,
  activeMenu: "",
  isPopup: false,
  isHover: null,
  isSidebarPinned: false,
  popupMode: "",
  loading: false,
  error: null,
};
// asyncronous action
export const fetchCategories = createAsyncThunk(
  "task/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategoryData();
      console.log("Categories fetched:", response);
      return response || [];
    } catch (error) {
      console.error("Error fetching cateories:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (filter, { rejectWithValue }) => {
    try {
      const response = await getData(filter);

      return response || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSearchTasks = createAsyncThunk(
  "task/fetchSearchTasks",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await searchedTask(searchTerm);
      return response;
    } catch (error) {
      console.error("Error fetching search tasks:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const createNewTask = createAsyncThunk(
  "task/createNewTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await createTask(taskData);
      return response;
    } catch (error) {
      console.error("Error creating task:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updatedTask = createAsyncThunk(
  "task/updateTask",
  async ({ taskId, taskData }) => {
    const verifyTask = {
      ...taskData,
      category: taskData.category?._id || taskData.category,
    };
    console.log("verify task", verifyTask);

    const response = await updateTask(taskId, verifyTask);
    console.log("update response", response);
    return response;
  }
);

export const updatedTaskAttempt = createAsyncThunk(
  "task/updateTaskAttemp",
  async (taskId) => {
    const response = await updateTaskAttempt(taskId);
    return response;
  }
);

export const completedTask = createAsyncThunk(
  "task/completedTask",
  async (taskId) => {
    const response = await completeTask(taskId);

    return response;
  }
);

export const removedTask = createAsyncThunk(
  "task/removedTask",
  async (taskId) => {
    const response = await removeTask(taskId);
    return response;
  }
);

export const removedAllTask = createAsyncThunk(
  "task/removedAllTask",
  async () => {
    const response = await removeAllCompletedTask();
    return response;
  }
);

export const removedCategory = createAsyncThunk(
  "category/removedCategory",
  async (categoryId) => {
    const response = await removeCategory(categoryId);
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
    setStreakStatus(state, action) {
      state.streakStatus = action.payload;
      writeStreakStatus(action.payload);
    },
    setSelectedTask(state, action) {
      state.selectedTask = action.payload || null;
      // Deterministic: a task opens the detail panel, null closes it.
      state.isTaskDetail = action.payload != null;
    },

    clearTask(state) {
      state.tasks = [];
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },

    setCategories(state, action) {
      state.categories = action.payload;
    },
    removeCategories(state, action) {
      const categoryId = action.payload;
      state.categories = state.categories.filter(
        (category) => category._id !== categoryId
      );
    },
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
  extraReducers: (builder) => {
    builder

      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.tasks = [];
      })
      .addCase(fetchSearchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        state.formTask = initialState.formTask;
        state.progress = initialState.progress;
        state.tasks.push(action.payload);
        state.lastStateUpdate = new Date().toISOString();
        state.isSummaryUpdated = !state.isSummaryUpdated;
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updatedTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
       
        state.tasks = state.tasks.map((task) => {
          if (task._id === updatedTask._id) {
            return {
              ...task,
              ...updatedTask,
              category: updatedTask.category,
              deadline: updatedTask.deadline,
              lastUpdated: new Date().toISOString(),
            };
          }
          return task;
        });
        if (state.selectedTask && state.selectedTask._id === updatedTask._id) {
          state.selectedTask = {
            ...state.selectedTask,
            ...updatedTask,
            category: updatedTask.category,
          };
        }
        state.lastStateUpdate = new Date().toISOString();
        state.isSummaryUpdated = !state.isSummaryUpdated;
      })
      .addCase(updatedTaskAttempt.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        state.tasks = state.tasks.map((task) => {
          if (task._id === updatedTask._id) {
            return {
              ...task,
              ...updatedTask,
              status: task.status === "failed" ? "pending" : task.status,
            };
          }
          return task;
        });

        if (state.selectedTask && state.selectedTask._id === updatedTask._id) {
          state.selectedTask = {
            ...state.selectedTask,
            ...updatedTask,
            status:
              state.selectedTask.status === "failed"
                ? "pending"
                : state.selectedTask.status,
          };
        }

        state.lastStateUpdate = new Date().toISOString();
      })

      .addCase(completedTask.fulfilled, (state, action) => {
        const completedTaskId = action.payload._id;
        const updatedTask = action.payload.updatedTask || action.payload;
        const newTaskData = {
          ...updatedTask,
          lastUpdated: new Date().toISOString(),
        };
        state.tasks = state.tasks.map((task) =>
          task._id === completedTaskId ? newTaskData : task
        );
        state.searchResults = state.searchResults.map((task) =>
          task._id === completedTaskId ? newTaskData : task
        );

        if (action.payload.user) {
          state.streakStatus = action.payload.user;
          writeStreakStatus(action.payload.user);
        }

        if (state.selectedTask && state.selectedTask._id === completedTaskId) {
          state.selectedTask = {
            ...state.selectedTask,
            status: updatedTask.status,
          };
        }

        state.isSummaryUpdated = !state.isSummaryUpdated;
        state.lastStateUpdate = new Date().toISOString();
      })
      .addCase(removedTask.fulfilled, (state, action) => {
        const removedTaskId = action.payload._id;

        if (!removedTaskId) {
          console.error("Removed task ID is undefined");
          return;
        }
        state.tasks = state.tasks.filter((task) => task._id !== removedTaskId);
        state.searchResults = state.searchResults.filter(
          (task) => task._id !== removedTaskId
        );
        state.isSummaryUpdated = !state.isSummaryUpdated;
        state.lastStateUpdate = new Date().toISOString();
      })
      .addCase(removedAllTask.fulfilled, (state) => {
        state.tasks = state.tasks.filter((task) => task.status !== "completed");
        state.isSummaryUpdated = !state.isSummaryUpdated;
        state.lastStateUpdate = new Date().toISOString();
      })
      .addCase(removedCategory.fulfilled, (state) => {
        state.lastStateUpdate = new Date().toISOString();
      });
  },
});

export const {
  setFormTask,
  setCategories,
  setSelectedTask,
  setStreakStatus,
  toggleCreatePopup,
  clearTask,
  clearSearchResults,
  resetFormTask,
  addSteps,
  removeStep,
  removeCategories,
  setActiveMenu,
  setHover,
  togglePopup,
  toggleSidebarPinned,
} = taskSlice.actions;
export default taskSlice.reducer;
