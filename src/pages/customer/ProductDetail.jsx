import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import { Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../utils/api'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { products: wishlistProducts } = useSelector(s => s.wishlist)
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  const isWishlisted = wishlistProducts.some(p => (p._id || p) === id)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`)
        ])
        setProduct(pRes.data.product)
        setReviews(rRes.data.reviews)
      } finally { setLoading(false) }
    }
    fetch()
  }, [id])

  const handleAddToCart = () => {
    if (!user) { toast.info('Please login'); return }
    dispatch(addToCart({ productId: product._id, quantity: qty }))
    toast.success(`${product.name} added to cart!`)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.info('Please login to review'); return }
    try {
      const res = await api.post('/reviews', { productId: id, ...reviewForm })
      setReviews(prev => [res.data.review, ...prev])
      toast.success('Review submitted!')
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />)}
        </div>
      </div>
    </div>
  )
  if (!product) return <div className="text-center py-20">Product not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-6">
        <ChevronLeft size={16} /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
            <img src={product.images?.[activeImage] || 'https://placehold.co/500x500/e2e8f0/64748b?text=Fresh'}
              alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${activeImage === i ? 'border-green-500' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="text-sm text-green-600 font-medium">{product.category?.name}</span>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-1 mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-green-600">₹{product.discountPrice || product.price}</span>
            <span className="text-gray-500 dark:text-gray-400">per {product.unit}</span>
            {product.discountPrice && (
              <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3 mb-4">
            <span className={`badge ${product.isAvailable && product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.isAvailable && product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} ${product.unit})` : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={!product.isAvailable}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={() => { if (!user) { toast.info('Login to wishlist'); return } dispatch(toggleWishlist(product._id)) }}
              className={`p-3 rounded-xl border-2 transition-colors ${isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 dark:border-gray-600 hover:border-red-300 text-gray-500'}`}>
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <Truck size={16} className="text-green-600" />
            <span>Free delivery on orders above ₹500</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                      {r.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-gray-800 dark:text-white">{r.user?.name}</span>
                    {r.isVerifiedPurchase && <span className="badge bg-green-100 text-green-700 text-xs">✓ Verified</span>}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Write a Review</h2>
            <form onSubmit={handleReview} className="card p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: n }))}>
                      <Star size={24} className={n <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Comment</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  className="input" rows={3} placeholder="Share your experience..." />
              </div>
              <button type="submit" className="btn-primary w-full">Submit Review</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
