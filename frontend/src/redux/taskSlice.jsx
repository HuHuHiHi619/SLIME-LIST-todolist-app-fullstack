import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getCategoryData } from "../functions/category"
import { getTagData } from "../functions/tag";
import { createTask } from "../functions/task";
import { updateTask } from "../functions/task";

const initialState = {
    categories : [],
    tags : [],
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
    progress:{
        steps: [],
        totalSteps: 0,
        allStepsCompleted: false,
        history: {
          steps: [],
          timestamps: new Date(),
        },
    },
    loading:false,
    error:null
}
// asyncronous action
export const fetchCategories = createAsyncThunk('task/fetchCategories', async () => {
    const response = await getCategoryData();
    return response || [];
});

export const fetchTags = createAsyncThunk('task/fetchTags', async () => {
    const response = await getTagData();
    return response || [];
});

export const createNewTask = createAsyncThunk('task/createNewTask',async (taskData) => {
    const response = await createTask(taskData);
    return response;
});

export const updatedTask = createAsyncThunk('task/updateTask', async (taskId,taskData) => {
    const response = await updateTask(taskId,taskData);
    return response;
})

// reducer
const taskSlice = createSlice({
    name:'task',
    initialState,
    reducers:{
        setFormTask(state, action){
            state.formTask = {...state.formTask, ...action.payload};
        },
        addSteps(state,action){
            const newStep = action.payload
            state.progress.steps.push(newStep);
            state.progress.totalSteps += 1
            state.progress.allStepsCompleted = state.progress.steps.every((step) => step.completed);

            state.progress.history.steps.push({...newStep});
            state.progress.history.timestamps = new Date();
        },
        removeStep(state,action){
            const index = action.payload
            state.progress.steps = state.progress.steps.filter((_,i) => i !== index);
            state.progress.totalSteps -= 1
            state.progress.allStepsCompleted = state.progress.steps.every((step) => step.completed);

            state.progress.history.timestamps = new Date();
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state,action) => {
                state.categories = action.payload;
                state.loading = false;
            })
            .addCase(fetchCategories.rejected,(state,action) => {
                state.loading = false;
                state.error = action.error.message
                state.categories = [];
            })
            .addCase(fetchTags.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTags.fulfilled, (state,action) => {
                state.tags = action.payload;
                state.loading = false;
            })
            .addCase(fetchTags.rejected,(state,action) => {
                state.loading = false;
                state.error = action.payload.message;
                state.tags = [];
            })
            .addCase(createNewTask.pending,(state,action) => {
                state.loading = true
            })
            .addCase(createNewTask.fulfilled,(state,action) => {
                state.loading = false
            })
            .addCase(createNewTask.rejected,(state,action) => {
                state.error = action.error.message
            })
            
    }
});

export const { setFormTask, addSteps, removeStep } = taskSlice.actions;
export default taskSlice.reducer;