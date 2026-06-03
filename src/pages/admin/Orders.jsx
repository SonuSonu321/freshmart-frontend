import React, { useEffect, useState } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import { Eye } from 'lucide-react'

const STATUSES = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700', out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [partners, setPartners] = useState([])

  const load = async () => {
    const [o, p] = await Promise.all([
      api.get(`/admin/orders${filter ? `?status=${filter}` : ''}`),
      api.get('/admin/delivery-partners')
    ])
    setOrders(o.data.orders)
    setPartners(p.data.partners)
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const handleStatusUpdate = async (orderId, status, deliveryPartnerId) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status, deliveryPartnerId })
      toast.success('Status updated')
      load()
      setSelected(null)
    } catch (err) { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-48 text-sm">
          <option value="">All Orders</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
                : orders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">{o.orderId}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800 dark:text-white">{o.user?.name}</p>
                      <p className="text-xs text-gray-500">{o.user?.mobile}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{o.items?.length}</td>
                    <td className="py-3 px-4 font-medium text-green-600">₹{o.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_COLORS[o.orderStatus]}`}>
                        {o.orderStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelected(o)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 rounded-lg"><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <OrderModal order={selected} partners={partners} onClose={() => setSelected(null)} onUpdate={handleStatusUpdate} />
      )}
    </div>
  )
}

function OrderModal({ order, partners, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.orderStatus)
  const [partnerId, setPartnerId] = useState(order.deliveryPartner?._id || '')

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 dark:text-white">Order #{order.orderId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><span>✕</span></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span> {order.user?.name} ({order.user?.mobile})</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Address:</span> {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Payment:</span> {order.paymentMethod} ({order.paymentStatus})</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Items</h3>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 py-1">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-800 dark:text-white border-t dark:border-gray-600 pt-2 mt-1">
              <span>Total</span><span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm">
              {['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>

          {(status === 'out_for_delivery' || status === 'packed') && (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Assign Delivery Partner</label>
              <select value={partnerId} onChange={e => setPartnerId(e.target.value)} className="input text-sm">
                <option value="">Select partner</option>
                {partners.filter(p => p.isActive).map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.vehicleType})</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={() => onUpdate(order._id, status, partnerId)} className="btn-primary w-full">Update Order</button>
        </div>
      </div>
    </div>
  )
}
