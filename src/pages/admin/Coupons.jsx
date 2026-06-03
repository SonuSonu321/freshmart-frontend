import React, { useEffect, useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-toastify'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: 1, expiresAt: '' })

  const load = () => api.get('/coupons').then(r => setCoupons(r.data.coupons))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/coupons', form)
      toast.success('Coupon created!')
      setShowModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon?')) return
    await api.delete(`/coupons/${id}`)
    toast.success('Deleted')
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coupons</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c._id} className={`card p-4 border-l-4 ${c.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-lg text-green-600 tracking-wider">{c.code}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.description}</p>
              </div>
              <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
            </div>
            <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>Discount: {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'} off{c.maxDiscountAmount ? ` (max ₹${c.maxDiscountAmount})` : ''}</p>
              <p>Min order: ₹{c.minOrderAmount}</p>
              <p>Used: {c.usedCount}/{c.usageLimit}</p>
              <p>Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">Create Coupon</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Code *</label>
                  <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="input uppercase" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Type</label>
                  <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))} className="input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={e => setForm(p => ({ ...p, maxDiscountAmount: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} className="input" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Expires At *</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="input" required />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
