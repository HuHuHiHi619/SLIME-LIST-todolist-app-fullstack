import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getSummaryTaskByCategory,
  getSummaryTask,
} from "../functions/summary";

const initialState = {
  summary: [],
  summaryCategory: [],
  loading: false,
  error: null,
  notification: [],
  instruction: false
};

export const fetchSummary = createAsyncThunk(
  "/summary/fetchSummary",
  async () => {
    try {
      const response = await getSummaryTask();
      return response || [];
    } catch (error) {
      console.error("Error fetching cateories:", error);
      throw error;
    }
  }
);

export const fetchSummaryByCategory = createAsyncThunk(
  "/summary/fetchSummaryByCategory",
  async () => {
    try {
      const response = await getSummaryTaskByCategory();
      return response || [];
    } catch (error) {
      console.error("Error fetching cateories:", error);
      throw error;
    }
  }
);



const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    clearSummaryState: (state) => {
      state.summary = [];
      state.summaryCategory = [];
      state.notification = [];
      state.loading = false;
      state.error = null;
    },
    toggleInstructPopup: (state) => {
      state.instruction = !state.instruction
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = false;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.summary = [];
      })
      .addCase(fetchSummaryByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSummaryByCategory.fulfilled, (state, action) => {
        state.summaryCategory = action.payload;
        state.loading = false;
      })
      .addCase(fetchSummaryByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.summaryCategory = [];
      })
     
  },
});
export const { clearSummaryState , toggleInstructPopup} = summarySlice.actions;
export default summarySlice.reducer;
