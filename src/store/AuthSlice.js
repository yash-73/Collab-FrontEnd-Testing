import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: {
            isLoggedIn: false,
            data: null
        }
    },

    reducers: {
        login: (state, action) => {
            state.user = action.payload
        },
        logout: (state) => {
            state.user = {
                isLoggedIn: false,
                data: null
            }
        }
    }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer

