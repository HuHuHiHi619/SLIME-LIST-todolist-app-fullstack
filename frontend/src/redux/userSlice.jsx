import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData, userLogin, userLogout } from "../functions/authen";
import { completedTask } from "./taskSlice";

const defaultState = {
  userData: {
    id: "",
    username: "",
    currentStreak: 0,
    bestStreak: 0,
    alreadyCompletedToday: null,
    currentBadge: "iron",
    settings: {
      theme: "dark",
      notification: true,
    },
    imageProfile: "",
    lastCompleted: null,
  },
  loading: false,
  isRefreshing: false,
  authError: null,
  isAuthenticated: false,
  isGuest: true,
  isRegisterPopup: false,
};

const initialState = { ...defaultState };

// Delay function for loading states
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const minimumLoading = async (promise, minTimeMs = 2500) => {
  const startTime = Date.now();
  try {
    const result = await promise;
    const remainingTime = minTimeMs - (Date.now() - startTime);
    if (remainingTime > 0) {
      await delay(remainingTime);
    }
    return result;
  } catch (error) {
    throw error;
  }
};

// Thunks
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (userInput, { rejectWithValue }) => {
    try {
      const response = await minimumLoading(userLogin(userInput));

      return { user: response.user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await userLogout();
      return;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserData();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user data");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    restoreState: (state) => {
      return { ...defaultState }; // Reset to default state
    },
    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
    toggleRegisterPopup(state) {
      state.isRegisterPopup = !state.isRegisterPopup;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(completedTask.fulfilled, (state, action) => {
        const updatedTask = action.payload?.updatedTask;
        if (updatedTask && updatedTask.status) {
          console.log("Updated task status:", updatedTask.status);
        } else {
          console.warn("Unexpected payload structure:", action.payload);
        }
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.isAuthenticated = false;
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData.id = action.payload.user.id;
        state.userData.username = action.payload.user.username;
        // Update user information
        state.isAuthenticated = true;
        state.isGuest = false;
        state.authError = null;
        state.isRegisterPopup = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isAuthenticated = false;
        state.loading = true;
        state.authError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...defaultState,
          isAuthenticated: false, // ให้แน่ใจว่ามีการตั้งค่านี้
          isGuest: true,
        }; // Reset to default state
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.userData = { ...state.userData, ...action.payload };
        state.loading = false;
        state.isAuthenticated = true;
        state.isGuest = false;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
        state.isAuthenticated = false;
        state.userData = initialState.userData;
      });
  },
});

export const { restoreState, setAuthError, toggleRegisterPopup } =
  userSlice.actions;
export default userSlice.reducer;
