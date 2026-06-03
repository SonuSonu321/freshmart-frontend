import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { addToCart } from '../store/slices/cartSlice'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import { toast } from 'react-toastify'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { products: wishlistProducts } = useSelector(s => s.wishlist)
  const isWishlisted = wishlistProducts.some(p => (p._id || p) === product._id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) { toast.info('Please login to add to cart'); return }
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
    toast.success(`${product.name} added to cart!`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) { toast.info('Please login'); return }
    dispatch(toggleWishlist(product._id))
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <Link to={`/products/${product._id}`} className="group card overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img src={product.images?.[0] || 'https://placehold.co/300x300/e2e8f0/64748b?text=Fresh'} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">{discount}% OFF</span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
        <button onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{product.category?.name}</p>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">{product.averageRating?.toFixed(1) || '0.0'} ({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-green-600">₹{product.discountPrice || product.price}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/{product.unit}</span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.price}</span>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={!product.isAvailable}
            className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white flex items-center justify-center transition-colors">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}
