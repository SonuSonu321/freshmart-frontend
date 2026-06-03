import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist')
    return res.data.wishlist
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/wishlist/toggle/${productId}`)
    return { productId, added: res.data.added }
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload?.products || []
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, added } = action.payload
        if (added) {
          state.products = [...state.products, { _id: productId }]
        } else {
          state.products = state.products.filter(p => (p._id || p) !== productId)
        }
      })
  }
})

export default wishlistSlice.reducer
