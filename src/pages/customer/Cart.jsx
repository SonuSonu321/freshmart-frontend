import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, Tag, ShoppingBag } from 'lucide-react'
import { updateCartItem, removeFromCart, applyCoupon, clearCartApi } from '../../store/slices/cartSlice'
import { toast } from 'react-toastify'

export default function Cart() {
  const dispatch = useDispatch()
  const { items, totalAmount, discount } = useSelector(s => s.cart)
  const [couponCode, setCouponCode] = useState('')
  const [applying, setApplying] = useState(false)

  const deliveryFee = totalAmount >= 500 ? 0 : items.length > 0 ? 40 : 0
  const finalTotal = totalAmount - (discount || 0) + deliveryFee

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setApplying(true)
    const res = await dispatch(applyCoupon(couponCode))
    setApplying(false)
    if (res.payload?.discountAmount) toast.success(res.payload.message)
    else toast.error(res.payload || 'Invalid coupon')
  }

  if (items.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center dark:bg-gray-900 min-h-screen">
      <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">Your cart is empty</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Add some fresh items to get started</p>
      <Link to="/products" className="btn-primary px-8">Shop Now</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const p = item.product || {}
            return (
              <div key={item._id || p._id} className="card p-4 flex gap-4">
                <img src={p.images?.[0] || 'https://placehold.co/80x80/e2e8f0/64748b?text=Fresh'} alt={p.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{p.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price}/{p.unit}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-2">
                      <button onClick={() => dispatch(updateCartItem({ productId: p._id, quantity: item.quantity - 1 }))}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-600">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ productId: p._id, quantity: item.quantity + 1 }))}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-600">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => dispatch(removeFromCart(p._id))} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <button onClick={() => dispatch(clearCartApi())} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Tag size={16} className="text-green-600" /> Apply Coupon
            </h3>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="COUPON CODE" className="input text-sm uppercase flex-1" />
              <button onClick={handleApplyCoupon} disabled={applying} className="btn-primary text-sm px-3">
                {applying ? '...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              {deliveryFee > 0 && <p className="text-xs text-gray-400">Add ₹{500 - totalAmount} more for free delivery</p>}
              <div className="border-t dark:border-gray-600 pt-2 flex justify-between font-bold text-gray-800 dark:text-white text-base">
                <span>Total</span><span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full text-center block py-3">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
