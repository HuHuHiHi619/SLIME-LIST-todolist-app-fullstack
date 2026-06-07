import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData, userLogin, userLogout } from "../functions/authen";

const makeDefaultState = () => ({
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
});

const initialState = makeDefaultState();

const MIN_LOADING_MS = 2500;

// Delay function for loading states
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const minimumLoading = async (promise, minTimeMs = MIN_LOADING_MS) => {
  const startTime = Date.now();
  try{
    const result = await promise // await function ที่รับมา
    const remainingTime = minTimeMs - (Date.now() - startTime) // เอาเวลาที่กำหนด - (เวลาปัจจุบัน - เวลาที่เริ่ม)
    if(remainingTime > 0) {
      await delay(remainingTime) // ดึงเวลารอด้วย delay
    }
    return result
  } catch(error){
    throw error
  }
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
    restoreState: () => makeDefaultState(),
    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
    toggleRegisterPopup(state) {
      state.isRegisterPopup = !state.isRegisterPopup;
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
      .addCase(logoutUser.fulfilled, () => makeDefaultState())
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
        state.isGuest = true;
        state.userData = makeDefaultState().userData;
      });
  },
});

export const { restoreState, setAuthError, toggleRegisterPopup } =
  userSlice.actions;
export default userSlice.reducer;
