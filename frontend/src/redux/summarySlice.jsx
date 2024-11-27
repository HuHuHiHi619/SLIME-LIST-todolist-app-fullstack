import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getSummaryTaskByCategory,
  getSummaryTask,
  summaryNotification,
} from "../functions/summary";




const initialState = {
  summary: [],
  summaryCategory: [],
  loading: false,
  error: null,
  notification: [],
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

export const fetchNotification = createAsyncThunk(
  "/summary/fetchNotification",
  async () => {
    try {
      const response = await summaryNotification();
      return response || [];
    } catch (error) {
      console.error("Error fetching notification:", error);
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
      .addCase(fetchNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotification.fulfilled, (state, action) => {
        state.notification = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.notification = [];
      })

  },
});
export const { clearSummaryState } = summarySlice.actions;
export default summarySlice.reducer;
