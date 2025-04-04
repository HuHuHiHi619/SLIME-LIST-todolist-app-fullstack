import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData, userLogin, userLogout } from "../functions/authen";
import { completedTask } from "./taskSlice";
import Cookies from "js-cookie";

const checkTokenvalidity = (token) => {
  try{
      const decoded = JSON.parse(atob(token.split('.')[1]))
      return decoded.exp * 1000 > Date.now()
  } catch {
      return false
  }
}

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
  tokens: {
    accessToken: "",
    refreshToken: "",  
  },
  loading: false,
  isRefreshing: false,
  authError: null,
  isAuthenticated: false,
  isRegisterPopup: false
};

const loadInitialState = () => {
  try {
    const persistedAuth = Cookies.get("isAuthenticated") === "true";
    const persistedUserId = Cookies.get("userId") || "";
    const persistedUsername = Cookies.get("username") || "";
    const accessToken = Cookies.get("accessToken") || "";
    const refreshToken = Cookies.get("refreshToken") || "";

    const isTokenValid = accessToken && checkTokenvalidity(accessToken)

    if (!isTokenValid) {
      Cookies.remove("isAuthenticated");
      Cookies.remove("userId");
      Cookies.remove("username");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      return { ...defaultState }; // Return default state instead of undefined
    }

    return {
      userData: {
        id: persistedUserId,
        username: persistedUsername,
        currentStreak: 0,
        alreadyCompletedToday: null,
        bestStreak: 0,
        currentBadge: "iron",
        settings: {
          theme: "dark",
          notification: true,
        },
        imageProfile: "",
        lastCompleted: null,
      },
      tokens: {
        accessToken: null,
        refreshToken: null,
      },
      loading: false,
      isRefreshing: false,
      authError: null,
      isAuthenticated: persistedAuth && !!accessToken,
      isRegisterPopup: false
    };
  } catch (error) {
    console.error("Error loading initial state:", error);
    return { ...defaultState }; // Return default state on error
  }
};

const initialState = loadInitialState();

//delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve,ms))
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
      Cookies.set("isAuthenticated", "true");
      Cookies.set("userId", response.user.id);
      Cookies.set("username", response.user.username);
      Cookies.set("accessToken", response.accessToken);
      Cookies.set("refreshToken", response.refreshToken);

      return {
        user: response.user,
        tokens: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      };
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
      Cookies.remove("isAuthenticated", "true");
      Cookies.remove("userId");
      Cookies.remove("username");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
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
      const userId = Cookies.get('userId')
      if (!userId) {
        throw new Error('No user ID found');
      }
      const response = await getUserData(userId);
      return response;
    } catch (error) {
      Cookies.remove("isAuthenticated");
      Cookies.remove("userId");
      Cookies.remove("username");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // เพิ่ม reducer สำหรับ restore state จาก localStorage
    restoreState: (state) => {
      const newState = loadInitialState();
      return { ...newState }; // Replace entire state with loaded state
    },
    updateTokens: (state, action) => {
      state.tokens = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
      state.isAuthenticated = true;
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
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.authError = null;
        state.isRegisterPopup = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
        state.isAuthenticated = false;
        // ลบข้อมูลเมื่อ login ไม่สำเร็จ
        Cookies.remove("isAuthenticated");
        Cookies.remove("userId");
        Cookies.remove("username");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
      })
      .addCase(logoutUser.pending, (state) => {
        state.isAuthenticated = false;
        state.loading = true;
        state.authError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return { ...defaultState }; // Reset to default state
      })

      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.userData = { ...state.userData, ...action.payload };
        if(state.tokens.accessToken && typeof state.tokens.accessToken === "string"){
          state.isAuthenticated = true;
        }
        state.loading = false;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
        state.isAuthenticated = false;
        state.userData = initialState.userData;
      })
      .addCase("auth/refreshStart", (state) => {
        state.isRefreshing = true;
      })
      .addCase("auth/refreshEnd", (state) => {
        state.isRefreshing = false;
      });
  },
});

export const { restoreState, updateTokens, setAuthError, toggleRegisterPopup } = userSlice.actions;
export default userSlice.reducer;