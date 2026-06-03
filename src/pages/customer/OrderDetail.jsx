import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Package, Phone, ChevronLeft, X } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered']
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).finally(() => setLoading(false))
    const interval = setInterval(() => {
      api.get(`/orders/${id}`).then(r => setOrder(r.data.order))
    }, 30000)
    return () => clearInterval(interval)
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await api.put(`/orders/${id}/cancel`, { reason: 'Customer cancelled' })
      toast.success('Order cancelled')
      api.get(`/orders/${id}`).then(r => setOrder(r.data.order))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel')
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse"><div className="card h-96" /></div>
  if (!order) return <div className="text-center py-20">Order not found</div>

  const stepIndex = STATUS_STEPS.indexOf(order.orderStatus)
  const isCancelled = order.orderStatus === 'cancelled'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-6">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order #{order.orderId}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className={`badge ${STATUS_COLORS[order.orderStatus]} text-sm px-3 py-1`}>
          {order.orderStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-5 mb-6">
          <div className="relative">
            <div className="flex justify-between mb-2">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${i <= stepIndex ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'}`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span className="text-xs mt-1 text-center text-gray-500 dark:text-gray-400 leading-tight">
                    {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 dark:bg-gray-600 -z-0">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Delivery partner location */}
      {order.deliveryPartner?.currentLocation && order.orderStatus === 'out_for_delivery' && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            🚴 Live Tracking
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            {order.deliveryPartner.name} is on the way!
          </p>
          <div className="h-48 rounded-xl overflow-hidden">
            <MapContainer center={[order.deliveryPartner.currentLocation.lat, order.deliveryPartner.currentLocation.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[order.deliveryPartner.currentLocation.lat, order.deliveryPartner.currentLocation.lng]} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <Package size={16} /> Items
        </h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image || 'https://placehold.co/48x48/e2e8f0/64748b?text=F'} alt={item.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price} × {item.quantity} {item.unit}</p>
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="border-t dark:border-gray-600 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
          <div className="flex justify-between font-bold text-gray-800 dark:text-white"><span>Total</span><span>₹{order.totalAmount}</span></div>
        </div>
      </div>

      {/* Address */}
      {order.deliveryAddress && (
        <div className="card p-5 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <MapPin size={16} /> Delivery Address
          </h3>
          <p className="font-medium">{order.deliveryAddress.name}</p>
          <p>{order.deliveryAddress.addressLine1}</p>
          <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
          <p className="flex items-center gap-1 mt-1"><Phone size={12} /> {order.deliveryAddress.mobile}</p>
        </div>
      )}

      {/* Cancel */}
      {['pending', 'confirmed'].includes(order.orderStatus) && (
        <button onClick={handleCancel} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 rounded-lg px-4 py-2">
          <X size={14} /> Cancel Order
        </button>
      )}
    </div>
  )
}
