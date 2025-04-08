import { configureStore } from '@reduxjs/toolkit'
import authReducer from './AuthSlice'
const authStore = configureStore({
    reducer: {
        auth: authReducer
    }
})

export default authStore;