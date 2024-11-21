import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData, userLogin, userLogout } from "../functions/authen";
import { completedTask } from "./taskSlice";
import Cookies from "js-cookie";

const loadInitialState = () => {
  try {
    const persistedAuth = Cookies.get("isAuthenticated") === "true";
    const persistedUserId = Cookies.get("userId") || "";
    const persistedUsername = Cookies.get("username") || "";
    const accessToken = Cookies.get("accessToken") || "";
    const refreshToken = Cookies.get("refreshToken") || "";

    return {
      userData: {
        id: persistedUserId,
        username: persistedUsername,
        currentStreak: 0,
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
        accessToken,
        refreshToken,
      },
      loading: false,
      error: null,
      isAuthenticated: persistedAuth && !!accessToken,
    };
  } catch (error) {
    console.error("Error loading initial state:", error);
    return {
      userData: {
        id: "",
        username: "",
        currentStreak: 0,
        bestStreak: 0,
        currentBadge: "iron",
        settings: {
          theme: "dark",
          notification: true,
        },
        imageProfile: "",
        lastCompleted: null,
      },
      loading: false,
      error: null,
      isAuthenticated: false,
    };
  }
};

const initialState = loadInitialState();

// Thunks
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (userInput, { rejectWithValue }) => {
    try {
      const response = await userLogin(userInput);
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
  async (userId, { rejectWithValue }) => {
    try {
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
      state.isAuthenticated = newState.isAuthenticated;
      state.userData = newState.userData;
    },
    updateTokens: (state, action) => {
      state.tokens = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    },
    
  },
  extraReducers: (builder) => {
    builder
    .addCase(completedTask.fulfilled, (state, action) => {
       const { user } = action.payload
       state.userData.currentStreak = user.currentStreak
       state.userData.bestStreak = user.bestStreak
       state.userData.currentBadge = user.currentBadge
     
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData.id = action.payload.id;
        state.userData.username = action.payload.username;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        // ลบข้อมูลเมื่อ login ไม่สำเร็จ
        Cookies.remove("isAuthenticated");
        Cookies.remove("userId");
        Cookies.remove("username");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userData = initialState.userData;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.userData = { ...state.userData, ...action.payload };
        state.isAuthenticated = true;
        state.loading = false;
        console.log("userData action", action.payload);
        console.log("userData", state.userData);
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { restoreState, updateTokens } = userSlice.actions;
export default userSlice.reducer;
