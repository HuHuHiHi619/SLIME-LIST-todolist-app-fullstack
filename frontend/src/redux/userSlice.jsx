import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userLogin, userLogout } from "../functions/authen";

const makeDefaultState = () => ({
  userData: {
    id: "",
    username: "",
    currentStreak: 0,
    bestStreak: 0,
    alreadyCompletedToday: null,
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
});

const initialState = makeDefaultState();

const MIN_LOADING_MS = 2500;

// Delay function for loading states
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const minimumLoading = async (promise, minTimeMs = MIN_LOADING_MS) => {
  const startTime = Date.now();
  const result = await promise
  const remainingTime = minTimeMs - (Date.now() - startTime)
  if(remainingTime > 0) {
    await delay(remainingTime)
  }
  return result
}
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


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    restoreState: () => makeDefaultState(),
    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
    toggleRegisterPopup(state) {
      state.isRegisterPopup = !state.isRegisterPopup;
    },
    setUserData(state, action) {
      state.userData = { ...state.userData, ...action.payload };
      state.isAuthenticated = true;
      state.isGuest = false;
    },
  },
  extraReducers: (builder) => {
    builder
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
       
        state.loading = true;
        state.authError = null;
      })
      .addCase(logoutUser.fulfilled, () => makeDefaultState());
  },
});

export const { restoreState, setAuthError, toggleRegisterPopup, setUserData } =
  userSlice.actions;
export default userSlice.reducer;
