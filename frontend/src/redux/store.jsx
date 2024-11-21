import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice'
import  userReducer  from './userSlice';
import summaryReducer from './summarySlice'
import authMiddleware from './authMiddleware';

export const store = configureStore({
    reducer:{
        tasks: taskReducer,
        user: userReducer,
        summary:summaryReducer
    },
    middleware:(getDefaultMiddleware) => 
        getDefaultMiddleware().concat(authMiddleware)
});

export default store;