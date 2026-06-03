import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { setCartOpen } from '../store/slices/uiSlice'
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { cartOpen } = useSelector(s => s.ui)
  const { items, totalAmount, discount } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)

  const finalTotal = totalAmount - (discount || 0)
  const deliveryFee = finalTotal >= 500 ? 0 : finalTotal > 0 ? 40 : 0

  return (
    <>
      {cartOpen && <div className="fixed inset-0 bg-black/50 z-50" onClick={() => dispatch(setCartOpen(false))} />}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-green-600" /> Cart ({items.length})
          </h2>
          <button onClick={() => dispatch(setCartOpen(false))} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag size={60} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <Link to="/products" onClick={() => dispatch(setCartOpen(false))} className="mt-4 btn-primary">Shop Now</Link>
            </div>
          ) : (
            items.map(item => {
              const product = item.product || {}
              return (
                <div key={item._id || product._id} className="flex gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name || item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-200" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-white truncate">{product.name || item.name}</p>
                    <p className="text-green-600 font-bold text-sm">₹{item.price}/{product.unit || 'pc'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => dispatch(updateCartItem({ productId: product._id, quantity: item.quantity - 1 }))}
                          className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 border dark:border-gray-500 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => dispatch(updateCartItem({ productId: product._id, quantity: item.quantity + 1 }))}
                          className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 border dark:border-gray-500 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => dispatch(removeFromCart(product._id))} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span><span>{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 dark:text-white text-base border-t dark:border-gray-600 pt-2">
                <span>Total</span><span>₹{(finalTotal + deliveryFee).toFixed(2)}</span>
              </div>
            </div>
            {user ? (
              <Link to="/checkout" onClick={() => dispatch(setCartOpen(false))} className="btn-primary w-full text-center block">
                Proceed to Checkout
              </Link>
            ) : (
              <Link to="/login" onClick={() => dispatch(setCartOpen(false))} className="btn-primary w-full text-center block">
                Login to Checkout
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
