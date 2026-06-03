import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { params })
    return res.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories')
    return res.data.categories
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured/list')
    return res.data.products
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], categories: [], featured: [],
    total: 0, pages: 1, page: 1,
    loading: false, error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, s => { s.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.products
        state.total = action.payload.total
        state.pages = action.payload.pages
        state.page = action.payload.page
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload })
  }
})

export default productSlice.reducer
