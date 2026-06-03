import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Heart, User, Search, Sun, Moon, Menu, X, LogOut, Package } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { setCartOpen, toggleDarkMode } from '../store/slices/uiSlice'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { cartOpen, darkMode } = useSelector(s => s.ui)
  const { items } = useSelector(s => s.cart)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  const cartCount = items.reduce((t, i) => t + i.quantity, 0)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🥦</span>
            <span className="font-bold text-green-600 text-xl hidden sm:block">FreshMart</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden md:flex">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search fruits & vegetables..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(toggleDarkMode())} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hidden sm:flex">
                <Heart size={18} />
              </Link>
            )}

            <button onClick={() => dispatch(setCartOpen(!cartOpen))} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User size={18} className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[80px] truncate">{user.name}</span>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 py-2 z-50">
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <User size={14} /> Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <Package size={14} /> Orders
                    </Link>
                    <button onClick={() => { dispatch(logout()); setUserMenu(false); navigate('/') }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 w-full">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5 px-4">Login</Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search + menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t dark:border-gray-700 space-y-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..." className="input flex-1" />
              <button type="submit" className="btn-primary px-3"><Search size={16} /></button>
            </form>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600">All Products</Link>
              {user && <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600">Wishlist</Link>}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
