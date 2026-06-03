import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import api from '../../utils/api'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data.orders)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-24" />)}</div></div>

  if (orders.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center dark:bg-gray-900 min-h-screen">
      <Package size={80} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">No orders yet</h2>
      <Link to="/products" className="btn-primary px-8 mt-4 inline-block">Start Shopping</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 block hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">#{order.orderId}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>
                  {order.orderStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.items?.length} item{order.items?.length > 1 ? 's' : ''} • {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
              </p>
              <p className="font-bold text-green-600">₹{order.totalAmount}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
