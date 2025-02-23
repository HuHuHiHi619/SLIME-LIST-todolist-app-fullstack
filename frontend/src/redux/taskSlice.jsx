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

const initialState = {
  tasks: [],
  searchResults: [],
  isSummaryUpdated: false,
  categories: [],
  //tags: [],
  formTask: {
    title: "",
    note: "",
    startDate: null,
    deadline: null,
    category: "",
    //tag: [],
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
  streakStatus: JSON.parse(localStorage.getItem("streakStatus")) || {},
  lastUpdated: null,
  lastStateUpdate: null,
  selectedTask: null,
  isCreate: false,
  isTaskDetail: false,
  activeMenu: "",
  isPopup: false,
  isHover: null,
  isSidebarPinned: true,
  popupMode: "",
  loading: false,
  error: null,
};
// asyncronous action
export const fetchCategories = createAsyncThunk(
  "task/fetchCategories",
  async () => {
    try {
      const response = await getCategoryData();
      console.log("Categories fetched:", response);
      return response || [];
    } catch (error) {
      console.error("Error fetching cateories:", error);
      throw error;
    }
  }
);

/* tag is on process
export const fetchTags = createAsyncThunk("task/fetchTags", async () => {
 try{
  const response = await getTagData()
  return response || []
 } catch(error){
  console.error("Error fetching tags :", error)
  throw error
 }
});*/

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (filter) => {
    try {
      const response = await getData(filter);

      return response || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }
);

export const fetchSearchTasks = createAsyncThunk(
  "task/fetchSearchTasks",
  async (searchTerm) => {
    try {
      const response = await searchedTask(searchTerm);
      return response;
    } catch (error) {
      console.error("Error fetching search tasks:", error);
      throw error;
    }
  }
);

export const createNewTask = createAsyncThunk(
  "task/createNewTask",
  async (taskData) => {
    const response = await createTask(taskData);
    return response;
  }
);

export const updatedTask = createAsyncThunk(
  "task/updateTask",
  async ({ taskId, taskData }) => {
    const verifyTask = {
      ...taskData,
      category: taskData.category?._id || taskData.category,
     // tag: taskData.tag?._id || taskData.tag,
    };
    console.log("verify task", verifyTask)

    const response = await updateTask(taskId, verifyTask);
    console.log("update response", response)
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
        tag: action.payload.tag || state.formTask.tag || [],
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
    setStreakStatus(state,action) {
      state.streakStatus = action.payload;
      localStorage.setItem("streakStatus", JSON.stringify(action.payload));
    },
    setSelectedTask(state, action) {
      state.selectedTask = action.payload || null;
      state.isTaskDetail = !state.isTaskDetail;
      if (state.selectedTask === null) {
        state.isTaskDetail = state.isTaskDetail;
      }
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
   /* setTags(state, action) {
      state.tags = action.payload;
    },*/
    removeTags(state, action) {
      const tagId = action.payload;
      state.tags = state.tags.filter((tag) => tag._id !== tagId);
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
      (state.formTask = {
        title: "",
        note: "",
        startDate: null,
        deadline: null,
        category: "",
        //tag: [],
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

      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
        state.error = action.error.message;
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
        state.error = action.error.message;
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
        state.error = action.error.message;
      })
     /* .addCase(fetchTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })*/
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        state.formTask = initialState.formTask;
        state.progress = initialState.progress;
        state.tasks.push(action.payload);
        state.lastStateUpdate = new Date().toISOString();
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updatedTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        console.log("redux updatetask payload", updatedTask)
        state.tasks = state.tasks.map((task) => {
          if (task._id === updatedTask._id) {
            return {
              ...task,
              ...updatedTask,
              category: updatedTask.category,
              //tag: updatedTask.tag,
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
           // tag: updatedTask.tag,
          };
        }
        state.lastStateUpdate = new Date().toISOString();
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
        const updatedTask = action.payload;
        state.tasks = state.tasks.map((task) =>
          task._id === completedTaskId
            ? {
                ...task,
                ...updatedTask,
                lastUpdated: new Date().toISOString(),
              }
            : task
        );
        if (action.payload.user) {
          state.streakStatus = action.payload.user;
          localStorage.setItem('streakStatus', JSON.stringify(action.payload.user))
          console.log("act pay user",action.payload.user)
        }

        if (state.selectedTask && state.selectedTask._id === completedTaskId) {
          state.selectedTask = {
            ...state.selectedTask,
            status: updatedTask.status,
          };
        }

        state.isSummaryUpdated = true;
        state.lastStateUpdate = new Date().toISOString();
      })
      .addCase(removedTask.fulfilled, (state, action) => {
        const removedTaskId = action.payload._id;

        if (!removedTaskId) {
          console.error("Removed task ID is undefined");
          return;
        }
        state.tasks = state.tasks.filter((task) => task._id !== removedTaskId);
        state.searchResults = state.searchResults.filter((task) => task._id !== removedTaskId)
        state.isSummaryUpdated = true;
        state.lastStateUpdate = new Date().toISOString();
      })
      .addCase(removedAllTask.fulfilled, (state) => {
        state.tasks = state.tasks.filter((task) => task.status !== "completed");
        state.isSummaryUpdated = true;
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
 // setTags,
  setSelectedTask,
  setStreakStatus,
  toggleCreatePopup,
  toggleTaskDetailPopup,
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
