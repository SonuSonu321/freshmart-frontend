import React, { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, MapPin, CheckCircle, LogOut, Navigation, Phone, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

// Lazy load map to prevent crash if leaflet not ready
const MapView = lazy(() => import('../../components/DeliveryMap'))

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const STATUS_COLORS = {
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700'
}

const STATUS_NEXT = {
  confirmed: 'packed',
  packed: 'out_for_delivery',
  out_for_delivery: 'delivered'
}

const STATUS_LABELS = {
  confirmed: '📦 Mark as Packed',
  packed: '🚴 Start Delivery',
  out_for_delivery: '✅ Mark Delivered'
}

export default function DeliveryDashboard() {
  const navigate = useNavigate()
  const [partner, setPartner] = useState(null)
  const [orders, setOrders] = useState([])
  const [myLocation, setMyLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [locationError, setLocationError] = useState(false)
  const locationInterval = useRef(null)

  const token = localStorage.getItem('deliveryToken')
  const authHeader = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/delivery/login'); return }
    const stored = localStorage.getItem('deliveryPartner')
    if (stored) {
      try { setPartner(JSON.parse(stored)) } catch (e) {}
    }
    loadOrders()
    startLocationTracking()
    return () => { if (locationInterval.current) clearInterval(locationInterval.current) }
  }, [])

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/delivery/orders`, { headers: authHeader })
      setOrders(res.data.orders || [])
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return }
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const startLocationTracking = () => {
    if (!navigator.geolocation) { setLocationError(true); return }

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude: lat, longitude: lng } = pos.coords
          setMyLocation({ lat, lng })
          setLocationError(false)
          axios.put(`${BASE_URL}/delivery/location`, { lat, lng }, { headers: authHeader })
            .catch(() => {})
        },
        () => setLocationError(true),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    updateLocation()
    locationInterval.current = setInterval(updateLocation, 30000)
  }

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const nextStatus = STATUS_NEXT[currentStatus]
    if (!nextStatus) return
    setUpdating(orderId)
    try {
      await axios.put(
        `${BASE_URL}/delivery/orders/${orderId}/status`,
        { status: nextStatus, note: `Updated by delivery partner` },
        { headers: authHeader }
      )
      toast.success(`Marked as ${nextStatus.replace(/_/g, ' ')}`)
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = () => {
    if (locationInterval.current) clearInterval(locationInterval.current)
    localStorage.removeItem('deliveryToken')
    localStorage.removeItem('deliveryPartner')
    navigate('/delivery/login')
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 gap-3">
      <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      <p className="text-gray-500 text-sm">Loading orders...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{partner?.name?.[0]?.toUpperCase() || 'D'}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">{partner?.name || 'Delivery Partner'}</p>
            <p className="text-xs flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${myLocation ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span className={myLocation ? 'text-green-600' : 'text-gray-400'}>
                {myLocation ? 'Location sharing active' : locationError ? 'Location unavailable' : 'Getting location...'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadOrders} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Refresh">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Live location map */}
        {myLocation && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b dark:border-gray-700">
              <Navigation size={15} className="text-orange-500" />
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Your Live Location</span>
              <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">● Live</span>
            </div>
            <div className="h-44">
              <Suspense fallback={<div className="h-44 bg-gray-100 flex items-center justify-center text-sm text-gray-400">Loading map...</div>}>
                <MapView lat={myLocation.lat} lng={myLocation.lng} label="You are here" />
              </Suspense>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Assigned', value: orders.length, color: 'text-blue-600' },
            { label: 'In Progress', value: orders.filter(o => o.orderStatus === 'out_for_delivery').length, color: 'text-orange-600' },
            { label: 'Done Today', value: orders.filter(o => o.orderStatus === 'delivered').length, color: 'text-green-600' }
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div>
          <h2 className="font-bold text-base text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Package size={17} className="text-orange-500" /> Orders
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-sm">
              <Package size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No orders assigned</p>
              <p className="text-xs text-gray-400 mt-1">Check back soon</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">

                  {/* Order ID + status */}
                  <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm">#{order.orderId}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Items</p>
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-700 dark:text-gray-300 py-0.5">
                        <span>{item.name} × {item.quantity} {item.unit}</span>
                        <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm border-t dark:border-gray-600 mt-2 pt-2 text-gray-800 dark:text-white">
                      <span>Total</span>
                      <span className="text-orange-600">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Deliver To</p>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{order.deliveryAddress?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {order.deliveryAddress?.addressLine1}
                          {order.deliveryAddress?.city ? `, ${order.deliveryAddress.city}` : ''}
                          {order.deliveryAddress?.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
                        </p>
                        {order.deliveryAddress?.mobile && (
                          <a href={`tel:${order.deliveryAddress.mobile}`}
                            className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 mt-1 font-medium">
                            <Phone size={11} /> {order.deliveryAddress.mobile}
                          </a>
                        )}
                      </div>
                    </div>
                    {order.deliveryAddress?.coordinates?.lat && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.coordinates.lat},${order.deliveryAddress.coordinates.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
                        🗺️ Open in Google Maps
                      </a>
                    )}
                  </div>

                  {/* Payment + action */}
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.paymentMethod === 'cod'
                        ? <span className="font-semibold text-orange-600">💵 Collect ₹{order.totalAmount}</span>
                        : <span className="font-semibold text-green-600">✅ Paid Online</span>
                      }
                    </div>

                    {STATUS_NEXT[order.orderStatus] ? (
                      <button
                        onClick={() => handleStatusUpdate(order._id, order.orderStatus)}
                        disabled={updating === order._id}
                        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                        <CheckCircle size={13} />
                        {updating === order._id ? 'Updating...' : STATUS_LABELS[order.orderStatus]}
                      </button>
                    ) : order.orderStatus === 'delivered' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <CheckCircle size={14} /> Delivered
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
