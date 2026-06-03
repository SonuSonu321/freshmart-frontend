import React, { useEffect, useState } from 'react'
import { Plus, X, Truck } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-toastify'

export default function AdminDelivery() {
  const [partners, setPartners] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', vehicleType: 'bike', vehicleNumber: '' })

  const load = () => api.get('/admin/delivery-partners').then(r => setPartners(r.data.partners))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/delivery-partners', form)
      toast.success('Partner added!')
      setShowModal(false)
      setForm({ name: '', mobile: '', email: '', password: '', vehicleType: 'bike', vehicleNumber: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const toggleActive = async (id, isActive) => {
    await api.put(`/admin/delivery-partners/${id}`, { isActive: !isActive })
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Delivery Partners</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map(p => (
          <div key={p._id} className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Truck size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{p.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{p.mobile}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Vehicle: {p.vehicleType} {p.vehicleNumber && `(${p.vehicleNumber})`}</p>
              <p>Deliveries: {p.totalDeliveries}</p>
              <p>Available: {p.isAvailable ? '✅' : '❌'}</p>
            </div>
            <button onClick={() => toggleActive(p._id, p.isActive)}
              className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium ${p.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
              {p.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">Add Delivery Partner</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" className="input" required />
              <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="Mobile *" className="input" required />
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" type="email" className="input" />
              <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Password *" type="password" className="input" required />
              <select value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))} className="input">
                {['bike', 'scooter', 'bicycle', 'car'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <input value={form.vehicleNumber} onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value }))} placeholder="Vehicle Number" className="input" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Add</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
