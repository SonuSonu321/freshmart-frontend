import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('darkMode') === 'true',
    cartOpen: false,
    mobileMenuOpen: false
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', state.darkMode)
      if (state.darkMode) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    },
    setCartOpen: (state, action) => { state.cartOpen = action.payload },
    setMobileMenuOpen: (state, action) => { state.mobileMenuOpen = action.payload }
  }
})

export const { toggleDarkMode, setCartOpen, setMobileMenuOpen } = uiSlice.actions
export default uiSlice.reducer
