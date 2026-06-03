import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { fetchWishlist } from '../../store/slices/wishlistSlice'
import ProductCard from '../../components/ProductCard'

export default function Wishlist() {
  const dispatch = useDispatch()
  const { products } = useSelector(s => s.wishlist)

  useEffect(() => { dispatch(fetchWishlist()) }, [dispatch])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <Heart size={24} className="text-red-500 fill-red-500" /> Wishlist ({products.length})
      </h1>
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Heart size={80} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary mt-4 inline-block px-8">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
