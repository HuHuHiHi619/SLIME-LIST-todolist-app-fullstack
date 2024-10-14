import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getUserData, userLogin, userLogout } from "../functions/authen"

const initialState = {
    userData: {
        id: '',
        username: '',
        currentStreak: 0,
        bestStreak: 0,
        currentBadge: 'iron',
        settings: {
            theme: 'dark',
            notification: true,
        },
        imageProfile: '',
        lastCompleted: null,
    },
    loading: false,
    error: null,
    isAuthenticated: false
}

export const loginUser = createAsyncThunk('user/loginUser', async (userInput) => {
    const response = await userLogin(userInput);
    return response.user
});

export const logoutUser = createAsyncThunk('user/logout', async () => {
    const response = await userLogout();
    return response
})

export const fetchUserData = createAsyncThunk('user/fetchUserData', async (userId) => {
    const response = await getUserData(userId);
    return response
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.userData.id = action.payload.id
                state.userData.username = action.payload.username
                state.isAuthenticated = true
            })
            .addCase(fetchUserData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.userData = { ...state.userData, ...action.payload };
                state.loading = false;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});


export default userSlice.reducer