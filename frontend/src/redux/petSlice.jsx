import { createSlice } from "@reduxjs/toolkit";

const petSlice = createSlice({
  name: "pet",
  initialState: {
    lastReward: null,
  },
  reducers: {
    applyPetReward: (state, action) => {
      const { awardedExp, levelsGained } = action.payload;
      state.lastReward = { awardedExp, levelsGained };
    },
    clearLastReward: (state) => { state.lastReward = null; },
  },
});

export const { applyPetReward, clearLastReward } = petSlice.actions;
export default petSlice.reducer;
