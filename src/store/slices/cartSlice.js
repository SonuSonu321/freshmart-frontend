import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart')
    return res.data.cart
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/add', data)
    return res.data.cart
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/update/${productId}`, { quantity })
    return res.data.cart
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/remove/${productId}`)
    return res.data.cart
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const applyCoupon = createAsyncThunk('cart/coupon', async (code, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/coupon', { code })
    return res.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const clearCartApi = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/clear')
    return { items: [], totalAmount: 0 }
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalAmount: 0, discount: 0, coupon: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false
      if (action.payload) {
        state.items = action.payload.items || []
        state.totalAmount = action.payload.totalAmount || 0
        state.discount = action.payload.discountAmount || 0
        state.coupon = action.payload.coupon || null
      }
    }
    builder
      .addCase(fetchCart.pending, s => { s.loading = true })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCartApi.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.discount = action.payload.discountAmount
      })
  }
})

export default cartSlice.reducer
