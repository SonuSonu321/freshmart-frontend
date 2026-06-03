import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const adminLogin = createAsyncThunk('auth/adminLogin', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/admin/login', data)
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
    clearError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null }
    const handleFulfilled = (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token || state.token
    }
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(login.pending, handlePending).addCase(login.fulfilled, handleFulfilled).addCase(login.rejected, handleRejected)
      .addCase(adminLogin.pending, handlePending).addCase(adminLogin.fulfilled, handleFulfilled).addCase(adminLogin.rejected, handleRejected)
      .addCase(register.pending, handlePending).addCase(register.fulfilled, handleFulfilled).addCase(register.rejected, handleRejected)
      .addCase(getProfile.fulfilled, (state, action) => { state.user = action.payload.user })
      .addCase(getProfile.rejected, (state) => { state.user = null; state.token = null; localStorage.removeItem('token') })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
