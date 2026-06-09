import { createSlice } from "@reduxjs/toolkit";

function safeReadStreakStatus() {
  try {
    return JSON.parse(localStorage.getItem("streakStatus")) || {};
  } catch {
    return {};
  }
}

export function writeStreakStatus(value) {
  try {
    localStorage.setItem("streakStatus", JSON.stringify(value));
  } catch {
    // storage unavailable or quota exceeded — state update still applies
  }
}

const initialState = {
  streakStatus: safeReadStreakStatus(),
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setStreakStatus(state, action) {
      state.streakStatus = action.payload;
    },
  },
});

export const { setStreakStatus } = taskSlice.actions;
export default taskSlice.reducer;
