import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, MapPin, Phone } from 'lucide-react'
import api from '../../utils/api'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order))
  }, [id])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center dark:bg-gray-900 min-h-screen">
      <div className="card p-8">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Order Placed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thank you for your order. We'll deliver fresh to your doorstep.
        </p>

        {order && (
          <div className="text-left space-y-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="font-bold text-green-700 dark:text-green-400 text-lg">Order ID: #{order.orderId}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Estimated delivery: {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString()} today
              </p>
            </div>

            <div className="card p-4 space-y-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Package size={16} /> Items Ordered
              </h3>
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t dark:border-gray-600 pt-2 flex justify-between font-bold">
                <span>Total</span><span className="text-green-600">₹{order.totalAmount}</span>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="card p-4 text-sm text-gray-600 dark:text-gray-400">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <MapPin size={16} /> Delivery Address
                </h3>
                <p>{order.deliveryAddress.name}</p>
                <p>{order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</p>
                <p className="flex items-center gap-1 mt-1"><Phone size={12} /> {order.deliveryAddress.mobile}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary px-6">Track Order</Link>
          <Link to="/products" className="btn-outline px-6">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
