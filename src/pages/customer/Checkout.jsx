import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { clearCartApi } from '../../store/slices/cartSlice'
import MapPicker from '../../components/MapPicker'

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { items, totalAmount, discount } = useSelector(s => s.cart)
  const { loading: cartLoading } = useSelector(s => s.cart)

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [newAddress, setNewAddress] = useState({ name: user?.name || '', mobile: user?.mobile || '', addressLine1: '', city: '', state: '', pincode: '' })
  const [addingNew, setAddingNew] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [mapCoords, setMapCoords] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [deliveryZone, setDeliveryZone] = useState(null) // {available, distance, message}

  const deliveryFee = totalAmount >= 500 ? 0 : 25
  const finalTotal = totalAmount - (discount || 0) + deliveryFee

  useEffect(() => {
    api.get('/addresses').then(r => {
      setAddresses(r.data.addresses)
      const def = r.data.addresses.find(a => a.isDefault) || r.data.addresses[0]
      if (def) setSelectedAddress(def._id)
    })
  }, [])

  const handleUseLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(async pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setMapCoords(coords)
      setShowMap(true)
      // Check delivery zone
      try {
        const res = await api.post('/orders/check-delivery', coords)
        setDeliveryZone(res.data)
        if (!res.data.available) {
          toast.error(res.data.message, { autoClose: 8000 })
        } else {
          toast.success(res.data.message)
        }
      } catch (err) {}
    }, () => toast.error('Could not get location'))
  }

  const handleSaveAddress = async () => {
    try {
      const res = await api.post('/addresses', { ...newAddress, coordinates: mapCoords })
      setAddresses(prev => [...prev, res.data.address])
      setSelectedAddress(res.data.address._id)
      setAddingNew(false)
      toast.success('Address saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !addingNew) { toast.error('Please select a delivery address'); return }
    setPlacing(true)
    try {
      const addr = addresses.find(a => a._id === selectedAddress)
      const deliveryAddress = addingNew ? { ...newAddress, coordinates: mapCoords } : addr

      // Check delivery radius
      const coords = deliveryAddress?.coordinates
      if (coords?.lat && coords?.lng) {
        try {
          const checkRes = await api.post('/orders/check-delivery', { lat: coords.lat, lng: coords.lng })
          if (!checkRes.data.available) {
            toast.error(checkRes.data.message, { autoClose: 6000 })
            setPlacing(false)
            return
          }
        } catch (err) {
          // If check fails, allow order to proceed
        }
      }

      if (paymentMethod === 'razorpay') {
        // Check if Razorpay is loaded
        if (!window.Razorpay) {
          toast.error('Payment gateway not loaded. Please refresh the page.')
          setPlacing(false)
          return
        }

        let rzpData
        try {
          const { data } = await api.post('/payment/create-order', { amount: finalTotal })
          rzpData = data
        } catch (err) {
          toast.error(err.response?.data?.message || 'Could not initiate payment. Check Razorpay keys in backend .env')
          setPlacing(false)
          return
        }

        const options = {
          key: rzpData.key,
          amount: rzpData.order.amount,
          currency: 'INR',
          name: 'FreshMart',
          description: 'Fresh Produce Order',
          order_id: rzpData.order.id,
          handler: async (response) => {
            try {
              const orderRes = await api.post('/orders', {
                deliveryAddress, paymentMethod: 'razorpay',
                razorpayOrderId: rzpData.order.id,
                razorpayPaymentId: response.razorpay_payment_id
              })
              await api.post('/payment/verify', {
                razorpay_order_id: rzpData.order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderRes.data.order._id
              })
              dispatch(clearCartApi())
              navigate(`/order-success/${orderRes.data.order._id}`)
            } catch (err) {
              toast.error('Payment done but order failed. Contact support.')
            }
          },
          modal: {
            ondismiss: () => {
              setPlacing(false)
              toast.info('Payment cancelled')
            }
          },
          prefill: { name: user.name, contact: user.mobile, email: user.email || '' },
          theme: { color: '#16a34a' }
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', () => {
          toast.error('Payment failed. Please try again.')
          setPlacing(false)
        })
        rzp.open()
      } else {
        const res = await api.post('/orders', { deliveryAddress, paymentMethod: 'cod' })
        dispatch(clearCartApi())
        navigate(`/order-success/${res.data.order._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  if (cartLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center dark:bg-gray-900 min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
      <p className="mt-4 text-gray-500">Loading your cart...</p>
    </div>
  )
  if (!cartLoading && items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card p-5">
            <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" /> Delivery Address
            </h2>

            <div className="space-y-3 mb-4">
              {addresses.map(addr => (
                <label key={addr._id} className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddress === addr._id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="address" value={addr._id} checked={selectedAddress === addr._id}
                    onChange={() => { setSelectedAddress(addr._id); setAddingNew(false) }} className="mt-1" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{addr.name} • {addr.mobile}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">{addr.label}</span>
                  </div>
                </label>
              ))}
            </div>

            {!addingNew ? (
              <button onClick={() => { setAddingNew(true); setSelectedAddress(null) }} className="text-green-600 hover:text-green-700 text-sm font-medium">
                + Add new address
              </button>
            ) : (
              <div className="space-y-3 border-t dark:border-gray-700 pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={newAddress.name} onChange={e => setNewAddress(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="input" />
                  <input value={newAddress.mobile} onChange={e => setNewAddress(p => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" className="input" />
                </div>
                <input value={newAddress.addressLine1} onChange={e => setNewAddress(p => ({ ...p, addressLine1: e.target.value }))} placeholder="Address Line 1" className="input" />
                <div className="grid sm:grid-cols-3 gap-3">
                  <input value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} placeholder="City" className="input" />
                  <input value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} placeholder="State" className="input" />
                  <input value={newAddress.pincode} onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="Pincode" className="input" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUseLocation} className="btn-outline text-sm py-1.5 flex items-center gap-1">
                    <MapPin size={14} /> Use GPS
                  </button>
                  {mapCoords && <span className="text-xs text-green-600 self-center">📍 Location set</span>}
                </div>
                {deliveryZone && (
                  <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${deliveryZone.available ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                    <span className="text-lg">{deliveryZone.available ? '✅' : '❌'}</span>
                    <div>
                      <p className="font-semibold">{deliveryZone.available ? 'Delivery Available!' : 'Outside Delivery Zone'}</p>
                      <p className="text-xs mt-0.5">{deliveryZone.message}</p>
                    </div>
                  </div>
                )}
                {showMap && mapCoords && (
                  <MapPicker coords={mapCoords} onSelect={setMapCoords} />
                )}
                <div className="flex gap-2">
                  <button onClick={handleSaveAddress} className="btn-primary text-sm">Save Address</button>
                  <button onClick={() => setAddingNew(false)} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-green-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when delivered' },
                { value: 'razorpay', label: '💳 Pay Online', desc: 'UPI, Cards, Net Banking via Razorpay' }
              ].map(m => (
                <label key={m.value} className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === m.value ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} className="mt-1" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-5 h-fit">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item._id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="truncate flex-1">{item.product?.name || 'Item'} × {item.quantity}</span>
                <span className="ml-2 font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t dark:border-gray-700 pt-3 space-y-2 text-sm">
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
              <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 dark:text-white text-base border-t dark:border-gray-600 pt-2">
              <span>Total</span><span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full py-3 mt-4 text-base">
            {placing ? 'Placing...' : paymentMethod === 'cod' ? '🛒 Place Order' : '💳 Pay ₹' + finalTotal.toFixed(2)}
          </button>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-center">
            <Truck size={12} /> {deliveryFee === 0 ? 'You qualify for free delivery!' : `Free delivery on orders ₹500+`}
          </div>
        </div>
      </div>
    </div>
  )
}
